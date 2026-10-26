<script setup lang="ts">
  defineProps<{
    src?: string
    alt?: string
  }>()
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    class="mx-auto my-8 max-w-full rounded-lg"
  >
</template>
