<script setup lang="ts">
  import { authClient } from '../utils/auth-client'

  const { data: session } = await authClient.useSession(useFetch)
  const isOpen = ref(false)

  const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/profile' },
    { label: 'Prayer Request', to: '/prayer-request' },
    { label: 'Contact', to: '/contact' },
    { label: 'Resources', to: '/resources' },
  ]

  function closeMenu() {
    isOpen.value = false
  }

  async function logout() {
    await authClient.signOut()
    closeMenu()
    await navigateTo('/auth')
  }
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="text-brand-500 inline-flex h-10.75 w-12 cursor-pointer items-center justify-center rounded-lg border-0 bg-white focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current lg:hidden"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="isOpen"
      aria-controls="mobile-menu"
      @click="isOpen = !isOpen"
    >
      <span class="sr-only">Menu</span>
      <span class="grid h-6 w-7.5 justify-items-center gap-1.5" aria-hidden="true">
        <span
          class="bg-brand-500 h-1 w-full rounded-full transition-all duration-300"
          :class="{ 'translate-y-2.5 rotate-45': isOpen }"
        />
        <span
          class="bg-brand-500 h-1 w-full rounded-full transition-all duration-300"
          :class="{ 'scale-x-0': isOpen }"
        />
        <span
          class="bg-brand-500 h-1 w-full rounded-full transition-all duration-300"
          :class="{ '-translate-y-2.5 -rotate-45': isOpen }"
        />
      </span>
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transform transition duration-[250ms] ease-[ease]"
        leave-active-class="transform transition duration-[250ms] ease-[ease]"
        enter-from-class="-translate-x-full"
        leave-to-class="-translate-x-full"
      >
        <div
          v-if="isOpen"
          id="mobile-menu"
          class="fixed inset-x-0 top-16 bottom-0 z-40 bg-white p-6 lg:hidden"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block rounded-md px-3 py-4 text-center text-xl font-bold hover:bg-gray-100"
            @click="closeMenu"
          >
            {{ link.label }}
          </NuxtLink>
          <button
            v-if="session"
            type="button"
            class="block w-full rounded-md px-3 py-4 text-center text-xl font-bold hover:bg-gray-100"
            @click="logout"
          >
            Logout
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
