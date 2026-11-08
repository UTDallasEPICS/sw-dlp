<script setup lang="ts">
  const route = useRoute()
  const slug = String(route.params.slug)
  const activeStep = ref('reading')

  const { data: chapter } = await useAsyncData(`chapter-${slug}`, async () => {
    const chapters = await queryCollection('chapters').all()

    return chapters.find((candidate) => {
      const filename = candidate.path.split('/').pop() ?? ''
      const filenameSlug = filename.replace(/\.md$/, '').replaceAll('_', '-').toLowerCase()

      return filenameSlug === slug
    })
  })

  if (!chapter.value) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Chapter not found',
    })
  }

  const chapterTitle = computed(() => chapter.value?.title ?? '')
  const videos = computed(() => chapter.value?.videos ?? [])
  const steps = computed(() => [
    ...(videos.value.length ? [{ id: 'video', icon: 'i-lucide-video', label: 'Video' }] : []),
    { id: 'reading', icon: 'i-lucide-book-open', label: 'Reading' },
    { id: 'activity', icon: 'i-lucide-list-checks', label: 'Activity' },
  ])

  function videoEmbedUrl(url: string): string {
    try {
      const parsed = new URL(url)
      const videoId =
        parsed.hostname === 'youtu.be' ? parsed.pathname.slice(1) : parsed.searchParams.get('v')

      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    } catch {
      return url
    }
  }
</script>

<template>
  <main class="min-h-screen bg-white pb-28 dark:bg-white">
    <div v-if="activeStep === 'video'" class="mx-auto max-w-6xl px-4 pt-8 pb-32 sm:px-6">
      <h1 class="text-brand-500 mb-8 text-3xl font-bold">{{ chapterTitle }}</h1>
      <div class="space-y-8">
        <section v-for="video in videos" :key="video.videoUrl" class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">{{ video.videoTitle }}</h2>
          <Videos :video-url="videoEmbedUrl(video.videoUrl)" :video-title="video.videoTitle" />
        </section>
      </div>
    </div>

    <div v-else-if="activeStep === 'activity'" class="min-h-screen bg-gray-50" />

    <div v-else class="mx-auto max-w-6xl px-4 pt-8 pb-32 sm:px-6">
      <article
        v-if="chapter"
        class="bg-white text-base leading-relaxed text-gray-900 sm:text-lg dark:bg-white dark:text-gray-900"
      >
        <ContentRenderer
          :value="chapter"
          class="prose max-w-none text-gray-900 dark:text-gray-900"
          prose
        />
      </article>
    </div>

    <ChapterFooter v-model="activeStep" :chapter-title="chapterTitle" :steps="steps" />
  </main>
</template>
