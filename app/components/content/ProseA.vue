<script setup lang="ts">
  defineProps<{
    href?: string
  }>()
</script>

<template>
  <a
    :href="href"
    class="font-medium text-brand-500 underline hover:text-brand-600"
  >
    <slot />
  </a>
</template>
