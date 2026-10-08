<script setup lang="ts">
  import { ref } from 'vue'

  // Hardcoded book structure ( swap with real API data later )
  interface Chapter {
    title: string
    read: boolean
  }

  interface Section {
    title: string
    chapters: Chapter[]
  }

  const bookSections: Section[] = [
    {
      title: 'Welcome',
      chapters: [{ title: 'Overview', read: true }],
    },
    {
      title: 'Introduction',
      chapters: [
        { title: 'Introduction', read: true },
        { title: 'Sections Summary', read: true },
      ],
    },
    {
      title: 'Section 1: The Awakening: You Are Not Alone',
      chapters: [
        { title: 'Overview', read: true },
        { title: 'Chapter 1: Espresso and You', read: true },
        { title: 'Chapter 2: Your “Aha” Moment', read: true },
        { title: 'Chapter 3: Feelings Assessment', read: false },
        { title: 'Chapter 4: Coping Mechanisms', read: true },
        { title: 'Section One Summary', read: false },
      ],
    },
    {
      title: 'Section 2: Recognizing Patterns of Behavior',
      chapters: [
        { title: 'Overview', read: false },
        { title: 'Chapter 5: Reoccurring Themes', read: false },
        { title: 'Chapter 6: Your Behaviors, Set Boundaries', read: false },
        { title: 'Chapter 7: Inner Music', read: false },
        { title: 'Chapter 8: Communication Hooks, Medical Impact', read: false },
        { title: 'Section Two Summary', read: false },
      ],
    },
    {
      title: 'Section 3: Understanding Abusive Relationships',
      chapters: [
        { title: 'Overview', read: false },
        { title: 'Chapter 9: Powerless, Forgiveness, Bitterness', read: false },
        { title: 'Chapter 10: Types of Abuse, Cycles, Safety, Legal', read: false },
        { title: 'Section Three Summary', read: false },
      ],
    },
    {
      title: 'Section 4: Build Your Self-Esteem',
      chapters: [
        { title: 'Overview', read: false },
        { title: 'Chapter 11: Self-Esteem Defined', read: false },
        { title: 'Chapter 12: Self-Esteem: What erodes? How to enhance?', read: false },
        { title: 'Section Four Summary', read: false },
      ],
    },
    {
      title: 'Section 5: Redefine Your Life',
      chapters: [
        { title: 'Overview', read: false },
        { title: 'Chapter 13: Seven Ingredients to Perfection, #1 God, #2 Body', read: false },
        { title: 'Chapter 14: Seven Ingredients of Perfection, #3 Soul, #4 Mind', read: false },
        {
          title: 'Chapter 15: Seven Ingredients, #5 Words, #6 Lessons, #7 Relationships',
          read: false,
        },
        { title: 'Section Five Summary', read: false },
      ],
    },
    {
      title: 'Wrap Up',
      chapters: [
        { title: 'Wrap Up', read: false },
        { title: 'Action Plan', read: false },
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
                {{ chapter.title }}
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  </nav>
</template>
