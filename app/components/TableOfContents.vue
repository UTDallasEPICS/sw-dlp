<script setup lang="ts">
  import { ref } from 'vue'

  // Hardcoded book structure ( swap with real API data later )
  interface Chapter {
    title: string
    slug: string
    read: boolean
  }

  interface Section {
    title: string
    chapters: Chapter[]
  }

  const bookSections: Section[] = [
    {
      title: 'Welcome',
      chapters: [{ title: 'Overview', slug: 'welcome', read: true }],
    },
    {
      title: 'Introduction',
      chapters: [
        { title: 'Introduction', slug: 'introduction', read: true },
        { title: 'Sections Summary', slug: 'sections-summary', read: true },
      ],
    },
    {
      title: 'Section 1: The Awakening: You Are Not Alone',
      chapters: [
        { title: 'Overview', slug: 'section-1-overview', read: true },
        { title: 'Chapter 1: Espresso and You', slug: 'chapter-1', read: true },
        { title: 'Chapter 2: Your “Aha” Moment', slug: 'chapter-2', read: true },
        { title: 'Chapter 3: Feelings Assessment', slug: 'chapter-3', read: false },
        { title: 'Chapter 4: Coping Mechanisms', slug: 'chapter-4', read: true },
        { title: 'Section One Summary', slug: 'section-1-summary', read: false },
      ],
    },
    {
      title: 'Section 2: Recognizing Patterns of Behavior',
      chapters: [
        { title: 'Overview', slug: 'section-2-overview', read: false },
        { title: 'Chapter 5: Reoccurring Themes', slug: 'chapter-5', read: false },
        { title: 'Chapter 6: Your Behaviors, Set Boundaries', slug: 'chapter-6', read: false },
        { title: 'Chapter 7: Inner Music', slug: 'chapter-7', read: false },
        { title: 'Chapter 8: Communication Hooks, Medical Impact', slug: 'chapter-8', read: false },
        { title: 'Section Two Summary', slug: 'section-2-summary', read: false },
      ],
    },
    {
      title: 'Section 3: Understanding Abusive Relationships',
      chapters: [
        { title: 'Overview', slug: 'section-3-overview', read: false },
        { title: 'Chapter 9: Powerless, Forgiveness, Bitterness', slug: 'chapter-9', read: false },
        { title: 'Chapter 10: Types of Abuse, Cycles, Safety, Legal', slug: 'chapter-10', read: false },
        { title: 'Section Three Summary', slug: 'section-3-summary', read: false },
      ],
    },
    {
      title: 'Section 4: Build Your Self-Esteem',
      chapters: [
        { title: 'Overview', slug: 'section-4-overview', read: false },
        { title: 'Chapter 11: Self-Esteem Defined', slug: 'chapter-11', read: false },
        { title: 'Chapter 12: Self-Esteem: What erodes? How to enhance?', slug: 'chapter-12', read: false },
        { title: 'Section Four Summary', slug: 'section-4-summary', read: false },
      ],
    },
    {
      title: 'Section 5: Redefine Your Life',
      chapters: [
        { title: 'Overview', slug: 'section-5-overview', read: false },
        { title: 'Chapter 13: Seven Ingredients to Perfection, #1 God, #2 Body', slug: 'chapter-13', read: false },
        { title: 'Chapter 14: Seven Ingredients of Perfection, #3 Soul, #4 Mind', slug: 'chapter-14', read: false },
        {
          title: 'Chapter 15: Seven Ingredients, #5 Words, #6 Lessons, #7 Relationships',
          slug: 'chapter-15',
          read: false,
        },
        { title: 'Section Five Summary', slug: 'section-5-summary', read: false },
      ],
    },
    {
      title: 'Wrap Up',
      chapters: [
        { title: 'Wrap Up', slug: 'wrap-up', read: false },
        { title: 'Action Plan', slug: 'action-plan', read: false },
      ],
    },
  ]

  const isSectionComplete = (chapters: Chapter[]): boolean => {
    return chapters.length > 0 && chapters.every((chapter) => chapter.read)
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
                :class="chapter.read ? 'text-brand-500' : 'text-gray-700'"
              >
                <IconCheckCircle
                  class="mr-2 h-4 w-4 text-xs sm:mr-3"
                  :class="chapter.read ? 'text-brand-500' : 'text-gray-300'"
                />
                <NuxtLink
                  :to="`/chapters/${chapter.slug}`"
                  class="flex-1"
                >
                  {{ chapter.title }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </nav>
</template>
