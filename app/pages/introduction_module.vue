<script setup lang="ts">
    const steps = [
        { id: 'video',   icon: 'i-lucide-video',     status: 'completed' },
        { id: 'reading', icon: 'i-lucide-book',      status: 'completed' },
        { id: 'list',    icon: 'i-lucide-list',      status: 'current' },
        { id: 'book',    icon: 'i-lucide-book-open', status: 'upcoming' },
        { id: 'idea',    icon: 'i-lucide-lightbulb', status: 'upcoming' },
    ]

    function goPrevious() {
    // navigate to previous section
    }

    function goNext() {
    // navigate to next section
    }

    function onStepClick(stepId: string) {
    // navigate to that specific step
    console.log('Clicked step:', stepId)
    }
</script>

<template>
  <div>
    <div class="pb-28">   <!-- extra bottom padding so content isn’t hidden behind the bar -->
        <!-- Your chapter content here -->
    </div>

    <ChapterFooter
        chapter-title="Introduction"
        :steps="steps"
        @previous="goPrevious"
        @next="goNext"
        @step-click="onStepClick"
    />
  </div>
</template>