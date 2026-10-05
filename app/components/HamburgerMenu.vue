<script setup lang="ts">
  const isOpen = ref(false)

  const links = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Sign in', to: '/auth' },
    { label: 'Resources', to: '/resources' },
    { label: 'Contact', to: '/contact' },
  ]

  function closeMenu() {
    isOpen.value = false
  }
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="inline-flex h-[43px] w-12 cursor-pointer items-center justify-center rounded-lg border-0 bg-white text-[#e0004d] focus-visible:outline-2 focus-visible:outline-current focus-visible:outline-offset-[3px] md:hidden"
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
          class="fixed top-16 bottom-0 left-0 z-60 w-48 border-r border-gray-200 bg-white p-4 shadow-lg md:hidden"
        >
          <NuxtLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
            @click="closeMenu"
          >
            {{ link.label }}
          </NuxtLink>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
