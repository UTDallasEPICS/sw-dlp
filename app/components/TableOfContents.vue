<script setup lang="ts">
  import { ref } from 'vue'

  const { data: chapterProgress, error: progressError } = await useFetch('/api/userlessons')

  interface Chapter {
    title: string
  }

  interface Section {
    title: string
    chapters: Chapter[]
  }

  const bookSections: Section[] = [
    {
      title: 'Welcome',
      chapters: [{ title: 'Overview' }],
    },
    {
      title: 'Introduction',
      chapters: [{ title: 'Introduction' }, { title: 'Sections Summary' }],
    },
    {
      title: 'Section 1: The Awakening: You Are Not Alone',
      chapters: [
        { title: 'Overview' },
        { title: 'Chapter 1: Espresso and You' },
        { title: 'Chapter 2: Your “Aha” Moment' },
        { title: 'Chapter 3: Feelings Assessment' },
        { title: 'Chapter 4: Coping Mechanisms' },
        { title: 'Section One Summary' },
      ],
    },
    {
      title: 'Section 2: Recognizing Patterns of Behavior',
      chapters: [
        { title: 'Overview' },
        { title: 'Chapter 5: Reoccurring Themes' },
        { title: 'Chapter 6: Your Behaviors, Set Boundaries' },
        { title: 'Chapter 7: Inner Music' },
        { title: 'Chapter 8: Communication Hooks, Medical Impact' },
        { title: 'Section Two Summary' },
      ],
    },
    {
      title: 'Section 3: Understanding Abusive Relationships',
      chapters: [
        { title: 'Overview' },
        { title: 'Chapter 9: Powerless, Forgiveness, Bitterness' },
        { title: 'Chapter 10: Types of Abuse, Cycles, Safety, Legal' },
        { title: 'Section Three Summary' },
      ],
    },
    {
      title: 'Section 4: Build Your Self-Esteem',
      chapters: [
        { title: 'Overview' },
        { title: 'Chapter 11: Self-Esteem Defined' },
        { title: 'Chapter 12: Self-Esteem: What erodes? How to enhance?' },
        { title: 'Section Four Summary' },
      ],
    },
    {
      title: 'Section 5: Redefine Your Life',
      chapters: [
        { title: 'Overview' },
        { title: 'Chapter 13: Seven Ingredients to Perfection, #1 God, #2 Body' },
        { title: 'Chapter 14: Seven Ingredients of Perfection, #3 Soul, #4 Mind' },
        {
          title: 'Chapter 15: Seven Ingredients, #5 Words, #6 Lessons, #7 Relationships',
        },
        { title: 'Section Five Summary' },
      ],
    },
    {
      title: 'Wrap Up',
      chapters: [{ title: 'Wrap Up' }, { title: 'Action Plan' }],
    },
  ]

  const normalizeTitle = (title: string): string =>
    title
      .normalize('NFKC')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, '')

  const chapterNumber = (title: string): string | undefined =>
    /^chapter\s+(\d+)\b/i.exec(title)?.[1]

  const isChapterComplete = (title: string): boolean => {
    const chapters = chapterProgress.value?.chapters
    if (!chapters) return false

    const matchingChapter = chapters.find(
      (chapter) => normalizeTitle(chapter.name) === normalizeTitle(title)
    )
    if (matchingChapter) return matchingChapter.completed

    const number = chapterNumber(title)
    return (
      chapters.find((chapter) => number !== undefined && chapterNumber(chapter.name) === number)
        ?.completed ?? false
    )
  }

  const isSectionComplete = (chapters: Chapter[]): boolean => {
    return chapters.length > 0 && chapters.every((chapter) => isChapterComplete(chapter.title))
  }

  const openSections = ref<Set<number>>(
    new Set(
      bookSections
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => !isSectionComplete(section.chapters))
        .map(({ index }) => index)
    )
  )

  const isOpen = (index: number): boolean => openSections.value.has(index)

  const toggleSection = (index: number): void => {
    const next = new Set(openSections.value)
    if (next.has(index)) {
      next.delete(index)
    } else {
      next.add(index)
    }
    //  next.has(index) ? next.delete(index) : next.add(index)
    openSections.value = next
  }
</script>

<template>
  <nav aria-label="Table of Contents">
    <p v-if="progressError" role="alert" class="mb-3 text-sm text-red-600">
      Unable to load course progress. Please try again later.
    </p>
    <div class="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-xs">
      <section
        v-for="(section, sIndex) in bookSections"
        :key="`section-${sIndex}`"
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
                :class="isChapterComplete(chapter.title) ? 'text-brand-500' : 'text-gray-700'"
              >
                <IconCheckCircle
                  class="mr-2 h-4 w-4 text-xs sm:mr-3"
                  :class="isChapterComplete(chapter.title) ? 'text-brand-500' : 'text-gray-300'"
                />
                {{ chapter.title }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </nav>
</template>
