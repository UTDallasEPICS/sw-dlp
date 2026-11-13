<template>
  <main class="mx-auto my-2 w-full max-w-lg p-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
    <div aria-label="Badges Dashboard">
      <h2 class="mb-2 px-2 text-lg font-bold text-gray-900">Badge Dashboard</h2>
      <div
        class="flex h-auto min-h-18 w-full flex-wrap items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-lg shadow-black/10 sm:p-5"
      >
        <!-- State 1: When user has no badges -->
        <p class="mx-auto text-sm text-gray-500 sm:text-base">
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
      --></div>
    </div>

    <TableOfContents class="my-10 shadow-lg shadow-black/10" />
  </main>
</template>
