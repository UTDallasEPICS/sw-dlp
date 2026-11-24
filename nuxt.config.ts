// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/image', '@nuxt/eslint', '@nuxt/content', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      link: [
        // Required for iPhone / iPad "Add to Home Screen" icon
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
  // Prettier owns formatting; ESLint handles logic only (no stylistic rules).
  eslint: {
    config: {
      stylistic: false,
    },
  },
  // Surface TypeScript errors in the terminal during `nuxt dev`. Not during
  // `nuxt build`: the in-build vue-tsc runs in a clean environment where it
  // can't resolve auto-imports/module types and fails the Docker deploy. CI
  // runs `pnpm typecheck` (nuxi typecheck) as the real gate.
  typescript: {
    typeCheck: process.env.NODE_ENV !== 'production',
  },
  vite: {
    optimizeDeps: {
      include: ['better-auth/client/plugins', 'better-auth/vue', 'zod'],
    },
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Stronger Women Digital Learning Platform',
      short_name: 'SWApp',
      theme_color: '#e0004d',
      background_color: '#f9fafb',
      display: 'standalone',
      icons: [
        {
          src: '/apple-touch-icon.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/pink_heart_mug.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globStrict: false,
      navigateFallback: undefined,
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      globIgnores: ['**/favicon.ico'],
    },
    devOptions: {
      enabled: true, // Allows testing PWA behavior in dev mode
      type: 'module',
    },
  },
})
