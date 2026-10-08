<script setup lang="ts">
  import { authClient } from './utils/auth-client'

  const { data: session } = await authClient.useSession(useFetch)

  async function logout() {
    await authClient.signOut()
    await navigateTo('/auth')
  }
</script>

<template>
  <UApp>
    <div class="flex min-h-screen flex-col bg-surface text-gray-900">
      <header class="sticky top-0 z-50 border-b border-gray-200 bg-white/75 backdrop-blur-md">
        <UContainer
          class="relative grid h-16 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 sm:px-6 lg:px-8"
        >
          <HamburgerMenu class="absolute left-4 lg:hidden" />

          <nav
            class="hidden min-w-0 items-center gap-1 justify-self-start lg:flex"
            aria-label="Main navigation"
          >
            <NuxtLink
              to="/dashboard"
              class="rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100"
            >
              Dashboard
            </NuxtLink>
            <NuxtLink
              to="/contact"
              class="rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100"
            >
              Contact
            </NuxtLink>
            <NuxtLink
              to="/resources"
              class="rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100"
            >
              Resources
            </NuxtLink>
          </nav>

          <NuxtLink to="/" class="relative h-16 w-48 overflow-hidden justify-self-center">
            <img
              src="/logo.png"
              alt="Stronger Women"
              class="absolute top-1/2 left-1/2 h-52 w-52 max-w-none -translate-x-1/2 -translate-y-1/2"
            />
          </NuxtLink>

          <nav
            class="hidden min-w-0 items-center gap-1 justify-self-end lg:flex"
            aria-label="Account navigation"
          >
            <NuxtLink
              to="/profile"
              class="rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100"
            >
              Profile
            </NuxtLink>
            <button
              v-if="session"
              type="button"
              class="rounded-md px-4 py-2 font-bold whitespace-nowrap text-[#e0004d] hover:bg-gray-100"
              @click="logout"
            >
              Logout
            </button>
          </nav>
        </UContainer>
      </header>

      <main class="flex-1">
        <NuxtPage />
      </main>
    </div>
  </UApp>
</template>
