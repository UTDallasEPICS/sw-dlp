<script setup lang="ts">
  import { ref } from 'vue'

</script>

<template>
  <main class="w-full max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto my-2 p-4">
    <div aria-label="Badges Dashboard">
      <h2 class="px-2 text-lg font-bold text-gray-900 mb-2">Badge Dashboard</h2>
      <div class="w-full min-h-18 h-auto p-4 sm:p-5 bg-white border border-[#e5e7eb] rounded-xl shadow-lg shadow-black/10 flex flex-wrap items-center gap-3">
        <!-- State 1: When user has no badges -->
        <p class="text-sm sm:text-base text-gray-500 mx-auto">
          Complete chapter activities to earn badges
        </p>

        <!-- State 2: Display badges when available
        <template v-else>
            <IconTrophy 
              v-for="badge in badges" 
              :key="badge.id" 
              class="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 stroke-1 text-amber-500 shrink-0" 
            />
        </template>
      -->
      </div>
    </div>

    <TableOfContents class="my-10 shadow-lg shadow-black/10"/>
  </main>
</template>