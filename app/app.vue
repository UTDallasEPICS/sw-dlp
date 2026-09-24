<script setup lang="ts"></script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-[#f9fafb] text-gray-900">
      <header
        class="sticky top-0 z-50 border-b border-gray-200 bg-gray-900/75 bg-white/75 backdrop-blur-md"
      >
        <UContainer class="flex h-16 items-center justify-between">
          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold">
            <img src="/logo.png" alt="Stronger Women" class="h-15 w-auto" />
          </NuxtLink>
        </UContainer>
      </header>

      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
