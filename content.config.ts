import { defineContentConfig, defineCollection } from '@nuxt/content'
import { resolve } from 'node:path'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    chapters: defineCollection({
      type: 'page',
      source: {
        cwd: resolve('app/assets/Contents'),
        include: '**/*.md',
        prefix: '/chapters',
      },
      schema: z.object({
        title: z.string(),
        videos: z
          .array(
            z.object({
              videoUrl: z.string().url(),
              videoTitle: z.string(),
            })
          )
          .default([]),
      }),
    }),
  },
})
