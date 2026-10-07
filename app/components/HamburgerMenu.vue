<script setup lang="ts">
  const isOpen = ref(false)

  const links = [
    { label: 'Course', to: '/course' },
    { label: 'Profile', to: '/profile' },
    { label: 'Contact', to: '/contact' },
    { label: 'Logout', to: '/logout' },
  ]

  function closeMenu() {
    isOpen.value = false
  }
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="menu-toggle"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="isOpen"
      aria-controls="mobile-menu"
      @click="isOpen = !isOpen"
    >
      <span class="menu-icon" :class="{ 'menu-icon--open': isOpen }" aria-hidden="true">
        <span class="menu-icon__line" />
        <span class="menu-icon__line" />
        <span class="menu-icon__line" />
      </span>
    </button>

    <Teleport to="body">
      <Transition name="slide">
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
