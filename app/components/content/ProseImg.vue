<script setup lang="ts">
  const props = defineProps<{
    src?: string
    alt?: string
  }>()

  const isMarker = computed(() =>
    ['Learning Activity', 'Testimonial Quote', 'Scripture Reference'].includes(props.alt ?? '')
  )
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    class="mx-auto my-8 h-auto rounded-lg"
    :class="isMarker ? 'inline-block w-8 max-w-8 align-middle' : 'max-w-md'"
  >
</template>
