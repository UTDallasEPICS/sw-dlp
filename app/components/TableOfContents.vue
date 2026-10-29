<script setup lang="ts">
  import { ref } from 'vue'

  const { data, status, error, refresh } = await useFetch('/api/course-titles')
  const { data: chapterProgress, error: progressError } = await useFetch('/api/userlessons')
  const bookSections = computed(() => data.value ?? [])

  type Chapter = { id: string | null; title: string }
  const normalizeTitle = (title: string): string =>
    title
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, '')
  const chapterNumber = (title: string): string | undefined =>
    /^chapter\s+(\d+)\b/i.exec(title)?.[1]

  const isChapterComplete = (chapter: Chapter): boolean => {
    const progress = chapterProgress.value?.chapters
    if (!progress || progressError.value) return false
    const match = chapter.id
      ? progress.find((entry) => entry.id === chapter.id)
      : progress.find((entry) => normalizeTitle(entry.name) === normalizeTitle(chapter.title))
    if (match) return match.completed
    const number = chapterNumber(chapter.title)
    return (
      progress.find((entry) => number !== undefined && chapterNumber(entry.name) === number)
        ?.completed ?? false
    )
  }

  const isSectionComplete = (chapters: Chapter[]): boolean =>
    chapters.length > 0 && chapters.every(isChapterComplete)

  const openSections = ref<Set<number>>(new Set())
  watch(
    [bookSections, chapterProgress],
    ([sections]) => {
      openSections.value = new Set(
        sections.flatMap((section, index) => (isSectionComplete(section.chapters) ? [] : [index]))
      )
    },
    { immediate: true }
  )
  const isOpen = (index: number): boolean => openSections.value.has(index)

  const toggleSection = (index: number): void => {
    const next = new Set(openSections.value)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    openSections.value = next
  }
</script>

<template>
  <nav aria-label="Table of Contents">
    <p v-if="progressError" role="alert" class="mb-3 text-sm text-red-600">
      Unable to load course progress. Please try again later.
    </p>
    <p v-if="status === 'pending'" role="status" class="p-5 text-gray-600">Loading chapters…</p>
    <div v-else-if="error" role="alert" class="p-5 text-red-600">
      Unable to load chapters.
      <button type="button" class="underline" @click="refresh()">Try again</button>
    </div>
    <p v-else-if="!bookSections.length" class="p-5 text-gray-600">No chapters are available yet.</p>
    <div v-else class="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xs">
      <section
        v-for="(section, sIndex) in bookSections"
        :key="section.id"
        class="border-b border-[#e5e7eb] last:border-b-0"
      >
        <!-- Section Header -->
        <h2>
          <button
            type="button"
            class="focus-visible:ring-brand-400 flex w-full cursor-pointer items-center justify-between gap-3 bg-[#f3f3f3] px-6 py-4 text-left transition-colors hover:bg-gray-200 focus:outline-none focus-visible:ring-2"
            :aria-expanded="isOpen(sIndex)"
            :aria-controls="`panel-${sIndex}`"
            :id="`accordion-${sIndex}`"
            @click="toggleSection(sIndex)"
          >
            <span
              class="text-md font-bold transition-colors sm:text-base md:text-lg"
              :class="isSectionComplete(section.chapters) ? 'text-brand-500' : 'text-gray-900'"
            >
              {{ section.title }}
            </span>

            <IconChevronDown
              class="h-5 w-5 text-xs text-gray-500"
              :class="{ 'rotate-180': isOpen(sIndex) }"
            />
          </button>
        </h2>

        <!-- Collapsible panel -->
        <div
          :id="`panel-${sIndex}`"
          role="region"
          :aria-labelledby="`accordion-${sIndex}`"
          class="grid transition-[grid-template-rows] duration-300 ease-in-out"
          :class="isOpen(sIndex) ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
        >
          <div class="overflow-hidden">
            <ul class="divide-y divide-gray-200 border-t border-[#e5e7eb]">
              <li
                v-for="(chapter, cIndex) in section.chapters"
                :key="`chap-${sIndex}-${cIndex}`"
                class="group sm:text-md flex items-center px-5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-100 hover:outline-1 hover:outline-gray-400 sm:px-5 sm:py-3"
                :class="isChapterComplete(chapter) ? 'text-brand-500' : 'text-gray-700'"
              >
                <IconCheckCircle
                  class="mr-2 h-4 w-4 text-xs sm:mr-3"
                  :class="isChapterComplete(chapter) ? 'text-brand-500' : 'text-gray-300'"
                />
                <NuxtLink v-if="chapter.slug" :to="`/chapters/${chapter.slug}`" class="flex-1">
                  {{ chapter.title }}
                </NuxtLink>
                <span v-else class="flex-1">{{ chapter.title }}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </nav>
</template>
