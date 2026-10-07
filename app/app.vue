<script setup lang="ts"></script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-[#f9fafb] text-gray-900">
      <header
        class="sticky top-0 z-50 border-b border-gray-200 bg-gray-900/75 bg-white/75 backdrop-blur-md"
      >
        <UContainer class="flex h-16 items-center gap-4">
          <HamburgerMenu class="md:hidden" />

          <NuxtLink to="/" class="flex items-center gap-2 text-xl font-bold">
            <img src="/logo.png" alt="Stronger Women" class="h-15 w-auto" />
          </NuxtLink>

          <nav class="ml-auto hidden items-center gap-3 md:flex" aria-label="Main navigation">
            <NuxtLink
              to="/course"
              class="rounded-md px-4 py-2 font-bold text-[#e0004d] hover:bg-gray-100"
            >
              Course
            </NuxtLink>
            <NuxtLink
              to="/profile"
              class="rounded-md px-4 py-2 font-bold text-[#e0004d] hover:bg-gray-100"
            >
              Profile
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="rounded-md px-4 py-2 font-bold text-[#e0004d] hover:bg-gray-100"
            >
              Contact
            </NuxtLink>
          </nav>
        </UContainer>
      </header>

      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
