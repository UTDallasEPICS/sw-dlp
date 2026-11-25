<script setup lang="ts">
  const props = defineProps<{ mobileMenu?: boolean }>()

  const isOpen = ref(false)
  const buttonClass = computed(() =>
    props.mobileMenu
      ? 'block w-full rounded-md px-3 py-4 text-center text-xl font-bold hover:bg-gray-100'
      : 'hidden rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100 lg:inline-flex'
  )

  const instructionSections = [
    {
      title: 'iPhone or iPad',
      steps: [
        'In Safari or Chrome, tap Share (the square with an arrow), then Add to Home Screen > Add.',
      ],
    },
    {
      title: 'Android (Chrome)',
      steps: [
        'Open the three-dot menu in Chrome.',
        'Tap Install app or Add to Home screen, then confirm.',
      ],
    },
    {
      title: 'Windows, Mac, or Linux (Chrome)',
      steps: [
        'Open the three-dot menu in Chrome > Cast, save, and share > Install page as app.',
        'Confirm the installation.',
      ],
    },
  ]
</script>

<template>
  <button
    type="button"
    :class="buttonClass"
    aria-label="How to install this website"
    title="How to install this website"
    @click="isOpen = true"
  >
    Install App
  </button>

  <Teleport to="body">
    <UModal
      v-model:open="isOpen"
      title="Install Stronger Women"
      description="Choose your device and browser below for installation instructions."
      scrollable
      :ui="{
        overlay: 'z-[60]',
        content: 'z-[60] bg-white text-gray-900 dark:bg-white dark:text-gray-900',
        title: 'text-gray-900 dark:text-gray-900',
        description: 'text-black dark:text-black',
        close: 'rounded-md text-gray-500 hover:bg-gray-100 hover:text-[#e0004d] focus-visible:ring-2 focus-visible:ring-[#e0004d]',
      }"
    >
      <template #body>
        <div class="space-y-5">
          <section v-for="section in instructionSections" :key="section.title">
            <h3 class="mb-2 font-semibold text-[#e0004d]">{{ section.title }}</h3>
            <ol class="list-inside list-decimal space-y-1 text-sm text-black dark:text-black">
              <li v-for="step in section.steps" :key="step">{{ step }}</li>
            </ol>
          </section>
          <p class="text-sm text-black dark:text-black">
            If you don't see an install option, your browser may not support installing websites on
            your device. You can still bookmark this page.
          </p>
        </div>
      </template>
    </UModal>
  </Teleport>
</template>
