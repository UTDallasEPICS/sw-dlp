<script setup lang="ts">
  export interface Step {
    id: string
    icon: string
    label?: string
    status: 'completed' | 'current' | 'upcoming'
  }

  defineProps<{
    chapterTitle: string
    steps: Step[]
  }>()

  const emit = defineEmits<{
    previous: []
    next: []
    stepClick: [stepId: string]
  }>()
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-brand-500 bg-white">
    <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
      <!-- Previous button -->
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-brand-500 transition hover:bg-brand-50"
        aria-label="Previous"
        @click="emit('previous')"
      >
        <UIcon name="i-lucide-arrow-left" class="h-7 w-7" />
      </button>

      <!-- Center: title + steps -->
      <div class="flex flex-col items-center gap-2">
        <span class="text-sm font-medium text-gray-700">{{ chapterTitle }}</span>

        <div class="flex items-center gap-4">
          <button
            v-for="step in steps"
            :key="step.id"
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
            :class="{
              // Completed → dark pink
              'border-brand-600 bg-brand-600 text-white': step.status === 'completed',
              // Current → light pink
              'border-brand-400 bg-brand-100 text-brand-600': step.status === 'current',
              // Upcoming → outline only
              'border-gray-300 bg-white text-gray-400': step.status === 'upcoming',
            }"
            :aria-label="step.label || step.id"
            @click="emit('stepClick', step.id)"
          >
            <UIcon :name="step.icon" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Next button -->
      <button
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-brand-500 transition hover:bg-brand-50"
        aria-label="Next"
        @click="emit('next')"
      >
        <UIcon name="i-lucide-arrow-right" class="h-7 w-7" />
      </button>
    </div>
  </div>
</template>