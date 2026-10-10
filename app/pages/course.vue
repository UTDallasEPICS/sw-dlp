<script setup lang="ts">
  type CourseTab = 'videos' | 'chapter' | 'activity'

  const activeTab = ref<CourseTab>('videos')
  const selectedAnswer = ref<boolean | null>(null)

  const tabs = [
    { id: 'videos', label: 'Videos' },
    { id: 'chapter', label: 'Chapter' },
    { id: 'activity', label: 'Activity / Quiz' },
  ] as const

  function goToPreviousTab() {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.value)
    const previousTab = tabs[currentIndex - 1]

    if (previousTab) {
      activeTab.value = previousTab.id
    }
  }

  function goToNextTab() {
    const currentIndex = tabs.findIndex((tab) => tab.id === activeTab.value)
    const nextTab = tabs[currentIndex + 1]

    if (nextTab) {
      activeTab.value = nextTab.id
    }
  }
</script>

<template>
  <div class="p-6 pb-24 md:pb-6">
    <h1 class="text-3xl font-bold">Course Page</h1>
    <p v-if="activeTab !== 'activity'" class="mt-2 text-gray-600">
      Selected section: {{ activeTab }}
    </p>

    <section v-else class="mt-6 rounded-xl border border-gray-200 bg-white p-5">
      <h2 class="text-xl font-semibold">Quick check-in</h2>

      <p class="mt-3 text-gray-700">
        True or False: I understand the purpose and main idea of this course.
      </p>

      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          :aria-pressed="selectedAnswer === true"
          :class="[
            'rounded-lg border px-4 py-3 font-medium',
            selectedAnswer === true
              ? 'border-[#e0004d] bg-pink-50 text-[#e0004d]'
              : 'border-gray-300 text-gray-700',
          ]"
          @click="selectedAnswer = true"
        >
          True
        </button>

        <button
          type="button"
          :aria-pressed="selectedAnswer === false"
          :class="[
            'rounded-lg border px-4 py-3 font-medium',
            selectedAnswer === false
              ? 'border-[#e0004d] bg-pink-50 text-[#e0004d]'
              : 'border-gray-300 text-gray-700',
          ]"
          @click="selectedAnswer = false"
        >
          False
        </button>
      </div>
    </section>
  </div>

  <nav
    aria-label="Course sections"
    class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden"
  >
    <div class="mx-auto flex max-w-3xl items-center">
      <button
        type="button"
        aria-label="Previous section"
        :disabled="activeTab === 'videos'"
        class="px-4 py-3 text-2xl text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
        @click="goToPreviousTab"
      >
        <span aria-hidden="true">←</span>
      </button>

      <div class="grid flex-1 grid-cols-3">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :aria-pressed="activeTab === tab.id"
          :class="[
            'min-h-16 px-2 py-3 text-sm font-medium',
            activeTab === tab.id ? 'text-[#e0004d]' : 'text-gray-500',
          ]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <button
        type="button"
        aria-label="Next section"
        :disabled="activeTab === 'activity'"
        class="px-4 py-3 text-2xl text-gray-600 disabled:cursor-not-allowed disabled:text-gray-300"
        @click="goToNextTab"
      >
        <span aria-hidden="true">→</span>
      </button>
    </div>
  </nav>
</template>
