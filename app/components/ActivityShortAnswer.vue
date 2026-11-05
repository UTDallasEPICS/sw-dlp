<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      questionNumber: number
      totalQuestions: number
      prompt: string
      initialFields?: number
      maxFields?: number
    }>(),
    {
      initialFields: 1,
      maxFields: 5,
    }
  )

  const model = defineModel<string[]>({ default: () => [''] })

  if (model.value.length < props.initialFields) {
    model.value = [
      ...model.value,
      ...Array(props.initialFields - model.value.length).fill(''),
    ]
  }

  const errorMessage = ref('')

  const canDelete = computed(() => model.value.length > 1)
  
  function addField() {
    if (model.value.length >= props.maxFields) return

    const hasEmpty = model.value.some((v) => v.trim().length === 0)
    if (hasEmpty) {
      errorMessage.value =
        'Please add a response before adding another field.'
      return
    }
    errorMessage.value = ''
    model.value = [...model.value, '']
  }

  function deleteField(index: number) {
    if (model.value.length <= 1) return
    model.value = model.value.filter((_, i) => i !== index)
    errorMessage.value = ''
  }

  function updateField(index: number, value: string) {
    const next = [...model.value]
    next[index] = value
    model.value = next
  }

  function onTextareaInput(index: number, event: Event) {
    const el = event.target as HTMLTextAreaElement
    updateField(index, el.value)

    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }
</script>

<template>
  <div
    class="rounded-2xl border border-pink-100 bg-white p-6 shadow-[0_0_24px_rgba(224,0,77,0.12)]"
  >
    <h3 class="text-lg font-bold text-gray-900">
      Question {{ questionNumber }} of {{ totalQuestions }}:
    </h3>

    <p class="mt-3 text-base leading-relaxed text-black">
      {{ prompt }}
    </p>

    <div class="mt-5 space-y-3">
      <div
        v-for="(value, index) in model"
        :key="index"
        class="flex items-center gap-3"
      >
        <span class="w-5 shrink-0 text-sm font-medium text-gray-500">
          {{ index + 1 }}
        </span>
        <textarea
          :value="value"
          rows="1"
          placeholder="Write text here"
          class="w-full resize-none overflow-hidden rounded-md border border-gray-300 bg-white px-3 py-2 text-base leading-normal text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          @input="onTextareaInput(index, $event)"
        />

        <!-- Delete trash icon -->
        <UButton
          v-if="canDelete"
          color="neutral"
          variant="ghost"
          icon="i-lucide-trash-2"
          aria-label="Delete field"
          @click="deleteField(index)"
        />
      </div>
    </div>

    <!-- Only shows after they click Add with an empty field -->
    <p v-if="errorMessage" class="mt-2 text-sm text-red-600">
      {{ errorMessage }}
    </p>

    <div class="mt-4 flex items-center justify-between gap-3">
      <UButton
        v-if="model.length < maxFields"
        class="rounded-full bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        @click="addField"
      >
        Add another response
      </UButton>
    </div>
  </div>
</template>