<script setup lang = 'js'>

    /* Props for video URL and title used for embedding the variables from the pages folder into the video component. 
    This allows for dynamic video embedding based on the page context. */
    
    defineProps({
        videoUrl: {
            type: String,
            required: true
        },
        videoTitle: {
            type: String,
            required: true
        }
    })

    useHead({
        bodyAttrs: {
            class: 'bg-gray-50 overflow-y-hidden h-screen'
        }
    })
</script>

<template>
    <div class="flex max-w-screen items-center p-4 justify-center lg:justify-end lg:pr-16">
        <div class="bg-white p-5 rounded-[10px] w-full max-w-sm aspect-video shadow-md md:max-w-3xl">
            <iframe 
            class = "w-full h-full rounded-md"
            :src="videoUrl" 
            :title="videoTitle"
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowfullscreen
            ></iframe>
        </div>
    </div>
</template>

