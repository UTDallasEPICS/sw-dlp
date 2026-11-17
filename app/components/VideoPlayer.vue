<script setup lang="js">
  /* Props for video URL and title used for embedding the variables from the pages folder into the video component. 
    This allows for dynamic video embedding based on the page context. */

  const props = defineProps({
    videoUrl: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
  })

  const emit = defineEmits(['interacted'])
  const playerHost = ref(null)
  let player = null

  function videoIdFromUrl(url) {
    try {
      const parsed = new URL(url)
      if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1)
      return parsed.searchParams.get('v') ?? parsed.pathname.split('/').pop()
    } catch {
      return ''
    }
  }

  function createPlayer() {
    if (!window.YT?.Player || !playerHost.value) return
    player?.destroy?.()

    player = new window.YT.Player(playerHost.value, {
      videoId: videoIdFromUrl(props.videoUrl),
      events: {
        onStateChange(event) {
          if (event.data === 1) emit('interacted')
        },
      },
    })
  }

  function loadYouTubeApi() {
    if (window.YT?.Player) {
      createPlayer()
      return
    }

    const existingScript = document.querySelector(
      'script[src="https://www.youtube.com/iframe_api"]'
    )
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(script)
    }

    const previousReady = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      previousReady?.()
      createPlayer()
    }
  }

  onMounted(() => {
    loadYouTubeApi()
  })

  onBeforeUnmount(() => player?.destroy?.())
</script>

<template>
  <div class="flex max-w-screen items-center justify-center p-4">
    <div
      class="aspect-video w-full max-w-full rounded-[10px] bg-white p-2 shadow-md sm:p-5 md:max-w-3xl"
    >
      <div
        ref="playerHost"
        class="h-full w-full rounded-md"
        :aria-label="videoTitle"
      />
    </div>
  </div>
</template>
