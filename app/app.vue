<script setup lang="ts"></script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-[#f9fafb] text-gray-900">
      <header
        class="sticky top-0 z-50 border-b border-gray-200 bg-gray-900/75 bg-white/75 backdrop-blur-md"
      >
        <UContainer class="relative flex min-h-16 items-center gap-4 px-4 py-2 sm:px-6 lg:px-8">
          <HamburgerMenu />

          <nav class="hidden items-center gap-6 md:flex" aria-label="Main navigation">
            <NuxtLink
              to="/dashboard"
              class="text-base font-medium text-gray-700 transition-colors hover:text-[#e0004d]"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/auth"
              class="text-base font-medium text-gray-700 transition-colors hover:text-[#e0004d]"
            >
              Sign in
            </NuxtLink>
            <NuxtLink
              to="/resources"
              class="text-base font-medium text-gray-700 transition-colors hover:text-[#e0004d]"
            >
              Resources
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="text-base font-medium text-gray-700 transition-colors hover:text-[#e0004d]"
            >
              Contact
            </NuxtLink>
          </nav>

          <NuxtLink
            to="/"
            class="absolute left-1/2 flex -translate-x-1/2 translate-y-1 items-center gap-2 text-xl font-bold md:static md:ml-auto md:translate-x-0"
          >
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
