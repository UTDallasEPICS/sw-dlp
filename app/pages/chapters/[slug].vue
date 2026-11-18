<script setup lang="ts">
  const route = useRoute()
  const slug = String(route.params.slug)

  interface ActivityQuestion {
    id: string
    key: string
    type: 'mcq' | 'short_answer'
    prompt: string
    options?: unknown
    correctOptionId?: string | null
    description?: string
  }

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

  // ---- Activity ----
  const { data: activityMeta } = await useFetch<{ hasActivity: boolean }>(
    `/api/chapters/${slug}/activity-exists`
  )

  const hasActivity = computed(() => activityMeta.value?.hasActivity === true)

  const { data: progressData } = await useFetch<{
    completedSteps: string[]
  }>(`/api/chapters/${slug}/progress`)
  const completedSteps = ref(progressData.value?.completedSteps ?? [])

  async function completeStep(stepId: string) {
    if (completedSteps.value.includes(stepId)) return
    try {
      await $fetch(`/api/chapters/${slug}/progress`, {
        method: 'POST',
        body: { stepId },
      })
      completedSteps.value = [...completedSteps.value, stepId]
    } catch (error) {
      console.error('Unable to save chapter progress:', error)
    }
  }

  const { data: activityData } = await useFetch<{
    title: string | null
    questions: ActivityQuestion[]
  }>(`/api/chapters/${slug}/activity`)

  const activityQuestions = computed(() => activityData.value?.questions ?? [])
  const activityTitle = computed(() => activityData.value?.title ?? 'Activity')

  // answers keyed by question key (q1, q2, ...)
  const mcqAnswers = ref<Record<string, string>>({})
  const shortAnswers = ref<Record<string, string[]>>({})

  const skipAutosave = ref(false) // move here if you declare it twice, keep only one

  function parseOptions(raw: unknown): { id?: string; label?: string }[] {
    let opts: unknown = raw
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts)
      } catch {
        return []
      }
    }
    if (!Array.isArray(opts)) return []
    return opts as { id?: string; label?: string }[]
  }

  function optionLabelForId(question: ActivityQuestion, optionId: string | null): string {
    if (!optionId) return ''
    const match = parseOptions(question.options).find((o) => o.id === optionId)
    return typeof match?.label === 'string' ? match.label : ''
  }

  async function loadSavedResponses() {
    if (!activityQuestions.value.length) return

    skipAutosave.value = true
    try {
      // empty defaults first
      for (const q of activityQuestions.value) {
        if (q.type === 'short_answer') {
          shortAnswers.value[q.key] = shortAnswers.value[q.key] ?? ['']
        }
        if (q.type === 'mcq') {
          mcqAnswers.value[q.key] = mcqAnswers.value[q.key] ?? ''
        }
      }

      const data = await $fetch<{
        responses: {
          questionId: string
          key: string
          type: string
          selectedOptionId: string | null
          writtenAnswers: string[] | null
        }[]
      }>(`/api/chapters/${slug}/activity-responses`)

      for (const row of data.responses ?? []) {
        const q = activityQuestions.value.find(
          (question) => question.id === row.questionId || question.key === row.key
        )
        if (!q) continue

        if (q.type === 'mcq') {
          mcqAnswers.value[q.key] = optionLabelForId(q, row.selectedOptionId)
        } else if (row.writtenAnswers?.length) {
          shortAnswers.value[q.key] = [...row.writtenAnswers]
        }
      }
    } catch (e) {
      console.error('Failed to load responses', e)
    } finally {
      await nextTick()
      skipAutosave.value = false
    }
  }

  watch(
    activityQuestions,
    async (qs) => {
      if (!qs.length) return
      await loadSavedResponses()
    },
    { immediate: true }
  )

  function mcqOptionLabels(q: ActivityQuestion): string[] {
    let opts: unknown = q.options

    // If Drizzle ever returns a JSON string
    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts)
      } catch {
        return []
      }
    }

    if (!Array.isArray(opts) || opts.length === 0) return []

    // Already labels: ["True", "False"]
    if (typeof opts[0] === 'string') {
      return opts as string[]
    }

    return (opts as { id?: string; label?: string }[])
      .map((o) => o.label)
      .filter((label): label is string => typeof label === 'string' && label.length > 0)
  }

  function mcqCorrectLabel(q: ActivityQuestion): string {
    if (!q.correctOptionId) return ''
    
    let opts: unknown = q.options

    if (typeof opts === 'string') {
      try {
        opts = JSON.parse(opts)
      } catch {
        return ''
      }
    }

    if (!Array.isArray(opts)) return ''

    type OptionObject = { id?: string; label?: string }

    const correct = (opts as OptionObject[]).find(
      (o) => typeof o === 'object' && o !== null && o.id === q.correctOptionId
    )

    return typeof correct?.label === 'string' ? correct.label : ''  
  }

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

      return videoId
        ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
        : url
    } catch {
      return url
    }
  }

  // ---- Saves activities (submit button and autosave) ----
  const isSubmitting = ref(false)
  const submitError = ref('')
  const submitSuccess = ref(false)
  //const saveStatus = ref('') // autosave only

  type SaveState = 'idle' | 'saving' | 'saved' | 'error'
  const saveState = ref<SaveState>('idle')
  const lastSavedAt = ref<Date | null>(null)

  const saveLabel = computed(() => {
    if (saveState.value === 'saving') return 'Saving…'
    if (saveState.value === 'error') return 'Couldn’t save. Trying again soon.'
    if (saveState.value === 'saved' && lastSavedAt.value) {
      const time = lastSavedAt.value.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
      return `Saved at ${time}`
    }
    return ''
  })

  let saveTimer: ReturnType<typeof setTimeout> | null = null

  function scrollToTop() {
    if (import.meta.client){
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // finds associated lable for corresponding mcq answer string
  function getMcqOptionId(
    question: ActivityQuestion,
    selectedLabel: string
  ): string | null {
    let options: unknown = question.options

    if (typeof options === 'string') {
      try {
        options = JSON.parse(options)
      } catch {
        return null
      }
    }

    if (!Array.isArray(options)) {
      return null
    }

    const selected = options.find((option: unknown) => {
      if (typeof option !== 'object' || option === null) return false
      const o = option as { id?: string; label?: string }
      return o.label === selectedLabel || o.id === selectedLabel
    }) as { id?: string } | undefined

    return typeof selected?.id === 'string' ? selected.id : null
  }

  type ActivitySubmission = {
    questionId: string
    selectedOptionId: string | null
    writtenAnswers: string[] | null
  }

  function buildResponses(requireAll: boolean): ActivitySubmission[] | null {
    const responses: ActivitySubmission[] = []

    for (const question of activityQuestions.value) {
      if (question.type === 'mcq') {
        const selectedLabel = mcqAnswers.value[question.key] ?? ''
        const selectedOptionId = getMcqOptionId(question, selectedLabel)

        if (!selectedOptionId) {
          if (requireAll) {
            submitError.value = `Please answer question ${question.key}.`
            return null
          }
          continue
        }

        responses.push({
          questionId: question.id,
          selectedOptionId,
          writtenAnswers: null,
        })
      } else {
        const answers = (shortAnswers.value[question.key] ?? [])
          .map((answer) => answer.trim())
          .filter((answer) => answer.length > 0)

        if (answers.length === 0) {
          if (requireAll) {
            submitError.value = `Please answer question ${question.key}.`
            return null
          }
          continue
        }

        responses.push({
          questionId: question.id,
          selectedOptionId: null,
          writtenAnswers: answers,
        })
      }
    }

    if (requireAll && responses.length !== activityQuestions.value.length) {
      submitError.value = 'Please answer all questions before submitting.'
      return null
    }

    return responses
  }

  async function saveToDb(mode: 'autosave' | 'submit', 
    options?: {silent?: boolean}
  ) {
    const silent = options?.silent === true

    // Submit: clear previous messages first (same as your old logic)
    if (mode === 'submit') {
      if (isSubmitting.value) return
      submitError.value = ''
      submitSuccess.value = false
    }

    const responses = buildResponses(mode === 'submit')

    if (!responses || responses.length === 0) {
      // submitError already set when requireAll and something missing
      return
    }

    if (mode === 'submit') isSubmitting.value = true

    if (mode === 'autosave' && !silent && activeStep.value === 'activity') {
      saveState.value = 'saving'
    }

    try {
      await $fetch(`/api/chapters/${slug}/activity-responses`, {
        method: 'POST',
        body: {
          mode, 
          responses,
        },
      })

      if (mode === 'submit') {
        submitSuccess.value = true
        saveState.value = 'idle'
        await completeStep('activity')
        await nextTick()
        scrollToTop()
      } else {
        saveState.value = 'saved'
        lastSavedAt.value = new Date()
      }
    } catch (error: unknown) {
      console.error('Activity save failed:', error)
      if (mode === 'submit') {
        submitError.value = 'Unable to save your answers. Please try again.'
      }
      if (mode === 'autosave') {
        saveState.value = 'error'
        scheduleAutosave() 
      }
    } finally {
      if (mode === 'submit') {
        isSubmitting.value = false
      }
    }
  }

  function scheduleAutosave() {
    if (submitSuccess.value) return  // never autosave after a successful submit
    if (skipAutosave.value) return
    // Only schedule while user is on Activity
    if (activeStep.value !== 'activity') return

    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      if (activeStep.value !== 'activity') return
      saveToDb('autosave').catch(console.error)
    }, 30_000) // 30 seconds to save
  }

  watch([mcqAnswers, shortAnswers], () => scheduleAutosave(), { deep: true })

  watch(activeStep, (step, prev) => {
    if (step === 'activity' && saveState.value === 'error') scheduleAutosave()
    if (prev === 'activity' && step !== 'activity') {
      if (saveTimer) clearTimeout(saveTimer)
      saveToDb('autosave', {silent: true}).catch(console.error)
    }
  })

  /** Only submit handler — used by the button */
  async function onSubmitActivity() {
    if (saveTimer) clearTimeout(saveTimer)
    await saveToDb('submit')
  }
</script>

<template>
  <main class="min-h-screen bg-white pb-28 dark:bg-white">
    <div v-if="activeStep === 'video'" class="mx-auto max-w-6xl px-4 pt-8 pb-32 sm:px-6">
      <h1 class="text-brand-500 mb-8 text-3xl font-bold">{{ chapterTitle }}</h1>
      <div class="space-y-8">
        <section v-for="video in videos" :key="video.videoUrl" class="space-y-3">
          <h2 class="text-xl font-semibold text-gray-900">{{ video.videoTitle }}</h2>
          <VideoPlayer
            :video-url="videoEmbedUrl(video.videoUrl)"
            :video-title="video.videoTitle"
            @interacted="completeStep('video')"
          />
        </section>
      </div>
    </div>

    <div v-else-if="activeStep === 'activity' && hasActivity" class="mx-auto max-w-2xl flex flex-col space-y-10 p-4">
      <h1 class="mt-8 mb-0 text-2xl lg:text-3xl font-bold text-brand-500">
        {{ activityTitle }}</h1>

      <p
        role="status"
        aria-live="polite"
        class="sticky top-20 z-10 !mt-1 mb-4 h-7 self-end rounded-full bg-white/90 px-3 text-sm leading-7 shadow-sm backdrop-blur"
        :class="[
          saveState === 'error' ? 'text-red-600' : 'text-gray-500',
          saveLabel && !submitSuccess ? '' : 'invisible',
        ]"
      >
        {{ saveLabel }}
      </p> 
       
      <template v-for="(q, index) in activityQuestions" :key="q.id">
        <!-- Short Answer -->
        <ActivityShortAnswer
          v-if="q.type === 'short_answer'"
          v-model="shortAnswers[q.key]"
          :question-number="index + 1"
          :total-questions="activityQuestions.length"
          :prompt="q.prompt"
          :show-results="submitSuccess"
        />

        <!-- MCQ -->
        <ActivityMCQ
          v-else-if="q.type === 'mcq'"
          v-model="mcqAnswers[q.key]"
          :question-number="index + 1"
          :total-questions="activityQuestions.length"
          :prompt="q.prompt"
          :options="mcqOptionLabels(q)"
          :correct-answer="mcqCorrectLabel(q)"
          :description="q.description ?? undefined"
          :show-results="submitSuccess"
        />
      </template>

      <UButton
        v-if="!submitSuccess"
        class="flex w-45 items-center justify-center bg-brand-500 px-3 py-2 text-base font-semibold text-white hover:bg-brand-600"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="onSubmitActivity"
      >
        Submit Activity
      </UButton>
      <p v-if="submitError" role="alert" class="text-red-600">
        {{ submitError }}
      </p>
    </div>

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
        <UButton
          class="mt-8 bg-brand-500 px-4 py-2 font-semibold text-white hover:bg-brand-600"
          :disabled="completedSteps.includes(activeStep)"
          @click="completeStep(activeStep)"
        >
          {{ completedSteps.includes(activeStep) ? 'Reading completed' : 'I read this page' }}
        </UButton>
      </article>
    </div>   

    <ChapterFooter
      v-model="activeStep"
      :chapter-title="chapterTitle"
      :steps="steps"
      :completed-steps="completedSteps"
    />
  </main>
</template>
