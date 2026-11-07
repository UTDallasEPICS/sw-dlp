<script setup lang="ts">
  export interface Step {
    id: string
    icon: string
    label: string
    status: 'completed' | 'current' | 'upcoming'
  }

  const props = withDefaults(
    defineProps<{
      chapterTitle: string
      steps?: Omit<Step, 'status'>[]
      modelValue?: string
    }>(),
    {
      steps: () => [
        { id: 'video', icon: 'i-lucide-video', label: 'Video' },
        { id: 'reading', icon: 'i-lucide-book-open', label: 'Reading' },
      ],
      modelValue: 'reading',
    }
  )

  const emit = defineEmits<{
    'update:modelValue': [stepId: string]
  }>()

  const completedSteps = ref<string[]>([])

  const currentIndex = computed(() => {
    const index = props.steps.findIndex((s) => s.id === props.modelValue)
    return index === -1 ? 0 : index
  })

  const isLast = computed(() => currentIndex.value === props.steps.length - 1)

  const stepsWithStatus = computed<Step[]>(() =>
    props.steps.map((step, index) => ({
      ...step,
      status:
        index === currentIndex.value
          ? 'current'
          : completedSteps.value.includes(step.id)
            ? 'completed'
            : 'upcoming',
    }))
  )

  function markDone(stepId: string) {
    if (!completedSteps.value.includes(stepId)) {
      completedSteps.value.push(stepId)
    }
  }

  function goPrevious() {
    const previousStep = props.steps[currentIndex.value - 1]
    if (previousStep) {
      emit('update:modelValue', previousStep.id)
    }
  }

  function goNext() {
    const currentStep = props.steps[currentIndex.value]
    if (currentStep) {
      markDone(currentStep.id)
    }
    const nextStep = props.steps[currentIndex.value + 1]
    if (nextStep) {
      emit('update:modelValue', nextStep.id)
    }
  }

  function onStepClick(stepId: string) {
    emit('update:modelValue', stepId)
  }
</script>

<template>
  <div class="border-brand-500 fixed right-0 bottom-0 left-0 z-40 border-t-2 bg-white">
    <div class="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
      <button
        type="button"
        class="border-brand-500 text-brand-500 hover:bg-brand-50 flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
        aria-label="Previous"
        :disabled="currentIndex === 0"
        @click="goPrevious"
      >
        <UIcon name="i-lucide-arrow-left" class="h-7 w-7" />
      </button>

      <div class="flex flex-col items-center gap-2">
        <span class="text-sm font-medium text-gray-700">{{ chapterTitle }}</span>

        <div class="flex items-center gap-4">
          <button
            v-for="step in stepsWithStatus"
            :key="step.id"
            type="button"
            class="flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
            :class="{
              'border-brand-400 bg-brand-100 text-brand-600': step.status === 'completed',
              'border-brand-600 bg-brand-600 text-white': step.status === 'current',
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

      <button
        type="button"
        class="border-brand-500 text-brand-500 hover:bg-brand-50 flex h-10 w-10 items-center justify-center rounded-full border-2 transition"
        aria-label="Next"
        :disabled="isLast"
        @click="goNext"
      >
        <UIcon name="i-lucide-arrow-right" class="h-7 w-7" />
      </button>
    </div>
  </div>
</template>
