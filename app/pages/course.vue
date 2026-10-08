<script setup lang="ts">
  type CourseTab = 'videos' | 'chapter' | 'activity'

  const activeTab = ref<CourseTab>('videos')

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
  <div>
    <div class="p-6 pb-24">
      <h1 class="text-3xl font-bold">Course Page</h1>
      <p class="mt-2 text-gray-600">Selected section: {{ activeTab }}</p>
    </div>

    <nav
      aria-label="Course sections"
      class="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white"
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
  </div>
</template>
