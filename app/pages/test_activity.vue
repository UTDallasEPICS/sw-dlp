<script setup lang="ts">
const answers = ref<string[]>([''])
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-2xl">
      <ActivityShortAnswer
        v-model="answers"
        :question-number="1"
        :total-questions="5"
        prompt="Describe areas where you have further potential."
      />
    </div>
  </div>
</template>