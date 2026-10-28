<script setup lang="ts">
  export interface Step {
    id: string
    icon: string
    label?: string
    status: 'completed' | 'current' | 'upcoming'
  }

  const props = withDefaults(
    defineProps<{
      chapterTitle: string
      modelValue?: string // current step id
    }>(),
    {
      modelValue: 'video',
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [stepId: string]
    finish: []
  }>()

  // Icons 
  const steps: Omit<Step, 'status'>[] = [
    { id: 'video', icon: 'i-lucide-video', label: 'Video' },
    { id: 'reading', icon: 'i-lucide-book-open', label: 'Reading' },
    { id: 'quiz', icon: 'i-lucide-list-checks', label: 'Quiz' },
  ]

  // index of steps the user has finished; stays light pink even after going back
  const completedIndex = ref<string[]>([])

  const currentIndex = computed(() => {
    const index = steps.findIndex((s) => s.id === props.modelValue)
    return index === -1 ? 0 : index
  })

  const isLast = computed(() => currentIndex.value === steps.length - 1)

  const stepsWithStatus = computed<Step[]>(() =>
    steps.map((step, index) => ({
      ...step,
      status:
        index === currentIndex.value
          ? 'current'
          : completedIndex.value.includes(step.id)
            ? 'completed'
            : 'upcoming',
    }))
  )

  function markDone(stepId: string) {
    if (!completedIndex.value.includes(stepId)) {
      completedIndex.value.push(stepId)
    }
  }

  function goPrevious() {
    const previousStep = steps[currentIndex.value - 1]
    if (previousStep) {
      emit('update:modelValue', previousStep.id)
    }
  }

  function goNext() {
    const currentStep = steps[currentIndex.value]
    if (currentStep) {
      markDone(currentStep.id) 
    }
    const nextStep = steps[currentIndex.value + 1]
      if (nextStep) {
        emit('update:modelValue', nextStep.id)
      } else {
        emit('finish')
      }
  }

  function onStepClick(stepId: string) {
    emit('update:modelValue', stepId) // jumping around does not mark anything done 
  }
</script>

<template>
  <div class="fixed bottom-0 left-0 right-0 z-40 border-t-2 border-brand-500 bg-white">
    <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
      <!-- Previous button -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-brand-500 transition hover:bg-brand-50"
        aria-label="Previous"
        :disabled="currentIndex === 0"
        @click="goPrevious"
      >
        <UIcon name="i-lucide-arrow-left" class="h-7 w-7" />
      </button>

      <!-- Center: title + steps -->
      <div class="flex flex-col items-center gap-2">
        <span class="text-sm font-medium text-gray-700">{{ chapterTitle }}</span>

        <div class="flex items-center gap-4">
          <button
            v-for="step in stepsWithStatus"
            :key="step.id"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
            :class="{
              // Completed → light pink 
              'border-brand-400 bg-brand-100 text-brand-600': step.status === 'completed',
              // Current → dark pink
              'border-brand-600 bg-brand-600 text-white': step.status === 'current',
              // Upcoming → outline only
              'border-gray-300 bg-white text-gray-400': step.status === 'upcoming',
            }"
            :aria-label="step.label || step.id"
            :aria-current="step.status === 'current' ? 'step' : undefined"
            @click="onStepClick(step.id)"
          >
            <UIcon :name="step.icon" class="h-5 w-5" />
          </button>
        </div>
      </div>

      <!-- Next button -->
      <button
        type="button"
        class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-brand-500 text-brand-500 transition hover:bg-brand-50"
        :aria-label="isLast ? 'Finish' : 'Next'"
        @click="goNext"
      >
        <UIcon name="i-lucide-arrow-right" class="h-7 w-7" />
      </button>
    </div>
  </div>
</template>