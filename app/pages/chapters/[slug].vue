<script setup lang="ts">
  const route = useRoute()
  const slug = computed(() => String(route.params.slug))

  const { data: chapter } = await useAsyncData(`chapter-${slug.value}`, async () => {
    const chapters = await queryCollection('chapters').all()

    return chapters.find((candidate) => {
      const filename = candidate.path.split('/').pop() ?? ''
      const sourceSlug = filename
        .replace(/\.md$/, '')
        .replaceAll('_', '-')
        .toLowerCase()

      return sourceSlug === slug.value
    })
  })

  if (!chapter.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    })
  }
</script>

<template>
  <main class="bg-white pb-28 dark:bg-white">
    <div class="mx-auto max-w-6xl px-4 pb-32 pt-8 sm:px-6">
      <article
        v-if="chapter"
        class="bg-white text-base leading-relaxed !text-gray-900 sm:text-lg dark:bg-white dark:!text-gray-900"
      >
        <ContentRenderer
          :value="chapter"
          class="!text-gray-900 dark:!text-gray-900"
          prose
        />
      </article>
    </div>
  </main>
</template>
