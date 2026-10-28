<script setup lang="ts">
    withDefaults(
        defineProps<{
            class?: string
            strokeWidth?: number | string
        }>(),
        {
            class: 'w-6 h-6',
            strokeWidth: 2.5
        }
    )
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['shrink-0 transition-colors', $props.class]"
    aria-hidden="true"
  >
    <path d="M21.801 10A10 10 0 1 1 17 3.335" />
    <path d="m9 11 3 3L22 4" />
  </svg>
</template>