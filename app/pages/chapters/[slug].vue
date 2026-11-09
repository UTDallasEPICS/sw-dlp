<script setup lang="ts">
  const route = useRoute()
  const slug = String(route.params.slug)

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

  // ---- Reading pages ----
  type MarkdownNode = string | [string, Record<string, unknown>, ...unknown[]]

  function nodeText(node: unknown): string {
    if (typeof node === 'string') return node
    if (Array.isArray(node)) return node.slice(2).map(nodeText).join('')
    return ''
  }

  // Page Breaks indicated in the markdown files 
  const PAGE_BREAK = /^\s*<-{2,}\s*next\s*-{2,}>\s*$/i

  const readingPages = computed<MarkdownNode[][]>(() => {
    const body = chapter.value?.body as { value?: MarkdownNode[] } | undefined
    const nodes = body?.value ?? []
 
    const pages: MarkdownNode[][] = [[]]
    for (const node of nodes) {
      if (PAGE_BREAK.test(nodeText(node))) {
        pages.push([])
      } else {
        pages[pages.length - 1]!.push(node)
      }
    }
 
    const nonEmpty = pages.filter((page) => page.length > 0)
    return nonEmpty.length > 0 ? nonEmpty : [[]]
  })
 
  const readingPageCount = computed(() => readingPages.value.length)

  // --- Activity ---
  const { data: activityMeta } = await useFetch<{ hasActivity: boolean }>(
    `/api/chapters/${slug}/activity-exists`
  )

  const hasActivity = computed(() => activityMeta.value?.hasActivity === true)

  const steps = computed(() => {
    const list: { id: string; icon: string; label: string }[] = []

    // Only if this chapter has videos
    if (videos.value.length > 0) {
      list.push({ id: 'video', icon: 'i-lucide-video', label: 'Video' })
    }

    // Always at least one reading page
    const n = readingPageCount.value
    for (let i = 1; i <= n; i++) {
      list.push({
        id: `reading-${i}`,
        icon: 'i-lucide-book-open',
        label: n > 1 ? `Reading ${i}` : 'Reading',
      })
    }

    // Only if activity exists in the chapter
    if (hasActivity.value) {
      list.push({
        id: 'activity',
        icon: 'i-lucide-list-checks',
        label: 'Activity',
      })
    } 
    return list
  })

  /* First available step — never "video" if there is no video */
  const activeStep = ref(steps.value[0]?.id ?? 'reading-1')

  // If steps change, keep activeStep valid
  watch(
    steps,
    (next) => {
      if (!next.some((s) => s.id === activeStep.value)) {
        activeStep.value = next[0]?.id ?? 'reading-1'
      }
    },
    { immediate: true }
  )

  // Scroll to the top when the user moves to another step
  watch(activeStep, () => {
    if (import.meta.client) window.scrollTo({ top: 0 })
  })

  const currentPage = computed(() => {
    const id = String(activeStep.value)
    if (!id.startsWith('reading-') || !chapter.value) return null
  
    const nodes = readingPages.value[Number(id.replace('reading-', '')) - 1]      
    if (!nodes) return null
  
    return { ...chapter.value, body: { ...chapter.value.body, value: nodes } }
  })

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
          <VideoPlayer :video-url="videoEmbedUrl(video.videoUrl)" :video-title="video.videoTitle" />
        </section>
      </div>
    </div>

    <div v-else-if="activeStep === 'activity' && hasActivity" class="min-h-screen bg-gray-50" />

    <div v-else class="mx-auto max-w-6xl px-4 pt-8 pb-32 sm:px-6">
      <article
        v-if="currentPage"
        class="bg-white text-base leading-relaxed text-gray-900 sm:text-lg dark:bg-white dark:text-gray-900"
      >
        <ContentRenderer
          :value="currentPage"
          class="prose max-w-none text-gray-900 dark:text-gray-900"
          prose
        />
      </article>
    </div>   

    <ChapterFooter v-model="activeStep" :chapter-title="chapterTitle" :steps="steps" />
  </main>
</template>
