<script setup lang="ts">
  useHead({ title: 'Resources | Stronger Women' })
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <section
      class="mx-auto max-w-3xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h1 class="text-brand-500 text-3xl font-bold">Resources</h1>
      <p class="mt-4 text-lg text-gray-600">
        Continue your learning journey with the Stronger Women program.
      </p>
      <NuxtLink
        to="/dashboard"
        class="bg-brand-500 hover:bg-brand-600 mt-6 inline-flex rounded-md px-5 py-3 font-bold text-white"
      >
        Explore course chapters
      </NuxtLink>
      <p class="mt-6 text-gray-600">Additional resources will be available here soon.</p>
    </section>
  </UContainer>
</template>
