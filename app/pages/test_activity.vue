<script setup lang="ts">
import ActivityMCQ from '~/components/ActivityMCQ.vue';

const answers = ref<string[]>([''])
</script>

<template>
  <div class="min-h-screen bg-gray-50 px-4 py-10">
    <div class="mx-auto max-w-2xl flex flex-col space-y-4">
      
      <ActivityShortAnswer
        v-model="answers"
        :question-number="1"
        :total-questions="5"
        prompt="Describe areas where you have further potential."
      />

      <ActivityMCQ
        :question-number="2"
        :total-questions="5"
        prompt="What is your preferred learning style?"
        :options="['Option 1', 'Option 2', 'Option 3', 'Option 4']"
      />

    </div>
  </div>
</template>