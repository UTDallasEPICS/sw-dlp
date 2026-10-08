<script setup lang="ts">
  import { authClient } from '../utils/auth-client'

  const { data: session } = await authClient.useSession(useFetch)
  const isOpen = ref(false)

  const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Profile', to: '/profile' },
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
      v-if="session"
      type="button"
      class="inline-flex h-[43px] w-12 cursor-pointer items-center justify-center rounded-lg border-0 bg-white text-[#e0004d] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-current lg:hidden"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="isOpen"
      aria-controls="mobile-menu"
      @click="isOpen = !isOpen"
    >
      <span class="sr-only">Menu</span>
      <span class="grid h-6 w-[30px] justify-items-center gap-1.5" aria-hidden="true">
        <span
          class="h-1 w-full rounded-full bg-[#e0004d] transition-all duration-300"
          :class="{ 'translate-y-2.5 rotate-45': isOpen }"
        />
        <span
          class="h-1 w-full rounded-full bg-[#e0004d] transition-all duration-300"
          :class="{ 'scale-x-0': isOpen }"
        />
        <span
          class="h-1 w-full rounded-full bg-[#e0004d] transition-all duration-300"
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
          class="fixed inset-x-0 top-16 bottom-0 z-[40] bg-white p-6"
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

<style scoped>
  .slide-enter-active,
  .slide-leave-active {
    transition: transform 250ms ease;
  }

  .slide-enter-from,
  .slide-leave-to {
    transform: translateX(-100%);
  }

  .menu-toggle {
    display: inline-flex;
    width: 48px;
    height: 43px;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    background: #ffffff;
    color: #e0004d;
    cursor: pointer;
  }

  .menu-toggle:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 3px;
  }

  .menu-icon {
    display: flex;
    width: 30px;
    height: 24px;
    flex-direction: column;
    justify-content: space-between;
  }

  .menu-icon__line {
    display: block;
    width: 100%;
    height: 4px;
    border-radius: 999px;
    background: #e0004d;
    transition:
      transform 180ms ease,
      opacity 180ms ease;
    transform-origin: center;
  }

  .menu-icon--open .menu-icon__line:first-child {
    transform: translateY(10px) rotate(45deg);
  }

  .menu-icon--open .menu-icon__line:nth-child(2) {
    opacity: 0;
  }

  .menu-icon--open .menu-icon__line:last-child {
    transform: translateY(-10px) rotate(-45deg);
  }
</style>
