<script setup lang="ts">
  const isOpen = ref(false)

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Sign in', to: '/auth' },
  ]

  function closeMenu() {
    isOpen.value = false
  }
</script>

<template>
  <div class="relative">
    <button
      type="button"
      class="block cursor-pointer border-0 bg-transparent p-0"
      style="width: 48px; height: 43px; aspect-ratio: 48 / 43"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'"
      :aria-expanded="isOpen"
      aria-controls="mobile-menu"
      @click="isOpen = !isOpen"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="43"
        viewBox="0 0 48 43"
        fill="none"
        aria-hidden="true"
      >
        <rect x="1" y="1" width="46" height="41" stroke="#E0004D" stroke-width="2" />
        <path
          d="M3 1H45C46.1046 1 47 1.89543 47 3V40C47 41.1046 46.1046 42 45 42H3C1.89543 42 1 41.1046 1 40V3C1 1.89543 1.89543 1 3 1Z"
          fill="#E0004D"
          fill-opacity="0.1"
          stroke="#E0004D"
          stroke-width="2"
        />
        <rect
          x="9.36584"
          y="11.6216"
          width="29.2683"
          height="4.64865"
          rx="2.32432"
          fill="#E0004D"
        />
        <rect
          x="9.36584"
          y="19.7568"
          width="29.2683"
          height="4.64865"
          rx="2.32432"
          fill="#E0004D"
        />
        <rect
          x="9.36584"
          y="27.8919"
          width="29.2683"
          height="4.64865"
          rx="2.32432"
          fill="#E0004D"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      id="mobile-menu"
      class="absolute top-12 left-0 z-50 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
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
  </div>
</template>
