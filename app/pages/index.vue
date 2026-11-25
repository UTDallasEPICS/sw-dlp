<script setup lang="ts">
  definePageMeta({ alias: '/dashboard' })

  const { data: progress } = await useFetch('/api/userlessons', { key: 'course-progress' })
  const badges = computed(() => {
    const earned = new Set(progress.value?.chapters.filter((chapter) => chapter.badgeEarned).map((chapter) => chapter.slug))
    return Array.from({ length: 15 }, (_, index) => {
      const number = index + 1
      const slug = `chapter-${number}`
      return { number, slug, earned: earned.has(slug) }
    })
  })
</script>

<template>
  <main class="mx-auto my-2 w-full max-w-lg p-4 sm:max-w-xl md:max-w-2xl lg:max-w-3xl">
    <div aria-label="Badges Dashboard">
      <h2 class="mb-2 px-2 text-lg font-bold text-gray-900">Badge Dashboard</h2>
      <div
        class="grid grid-cols-5 justify-items-center gap-3 rounded-xl border border-[#e5e7eb] bg-white p-4 shadow-lg shadow-black/10 sm:gap-4 sm:p-5"
      >
        <NuxtLink
          v-for="badge in badges"
          :key="badge.slug"
          :to="`/chapters/${badge.slug}`"
          :aria-label="`Chapter ${badge.number} coffee mug badge, ${badge.earned ? 'earned' : 'locked'}`"
          :title="`Chapter ${badge.number}`"
          class="relative grid aspect-square w-full max-w-18 place-items-center rounded-full border focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          :class="badge.earned
            ? 'border-brand-500 bg-brand-500/10 text-brand-500'
            : 'border-gray-200 bg-gray-100 text-gray-500'"
        >
          <UIcon name="i-lucide-coffee" class="size-5 sm:size-7" aria-hidden="true" />
          <span
            v-if="badge.earned"
            class="absolute -right-0.5 -bottom-0.5 grid size-4 place-items-center rounded-full bg-brand-500 text-white"
          >
            <UIcon name="i-lucide-check" class="size-3" aria-hidden="true" />
          </span>
        </NuxtLink>
      </div>
    </div>

    <TableOfContents class="my-10 shadow-lg shadow-black/10" />
  </main>
</template>
