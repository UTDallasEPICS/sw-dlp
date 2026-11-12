<script setup lang="js">
  /* Props for video URL and title used for embedding the variables from the pages folder into the video component. 
    This allows for dynamic video embedding based on the page context. */

  defineProps({
    videoUrl: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <div class="flex max-w-screen items-center justify-center p-4">
    <div
      class="aspect-video w-full max-w-full rounded-[10px] bg-white p-2 shadow-md sm:p-5 md:max-w-3xl"
    >
      <iframe
        class="h-full w-full rounded-md"
        :src="videoUrl"
        :title="videoTitle"
        frameborder="0"
        allow="
          accelerometer;
          autoplay;
          clipboard-write;
          encrypted-media;
          gyroscope;
          picture-in-picture;
          web-share;
        "
        allowfullscreen
      ></iframe>
    </div>
  </div>
</template>
