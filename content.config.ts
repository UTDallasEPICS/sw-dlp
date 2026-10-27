import { defineContentConfig, defineCollection } from '@nuxt/content'
import { resolve } from 'node:path'

export default defineContentConfig({
  collections: {
    chapters: defineCollection({
      type: 'page',
      source: {
        cwd: resolve('app/assets/Contents'),
        include: '**/*.md',
        prefix: '/chapters',
      },
    }),
  },
})
