import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { scrolledReadingStep } from '#shared/utils/readingPages'
import {
  chapter,
  chapterVideo,
} from '~~/server/db/schema'
import { getReadingPageCounts } from '~~/server/utils/chapterProgress'
import { db } from '~~/server/utils/db'
import { saveChapterStep } from '~~/server/utils/saveChapterStep'
import { requireUser } from '~~/server/utils/session'

const bodySchema = z.object({
  stepId: z.string().regex(/^(video|reading-\d+|reading-visit-\d+)$/),
  reachedBottom: z.literal(true).optional(),
})

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const slug = getRouterParam(event, 'slug')
  const body = bodySchema.safeParse(await readBody(event))

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chapter slug' })
  }
  if (!body.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid progress step' })
  }

  const savedChapter = await db
    .select({ id: chapter.id })
    .from(chapter)
    .where(eq(chapter.slug, slug))
    .get()

  if (!savedChapter) {
    throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  }

  const stepId = body.data.stepId
  if (/^reading-\d+$/.test(stepId) && !body.data.reachedBottom) {
    throw createError({ statusCode: 400, statusMessage: 'Scroll to the bottom to complete this reading page' })
  }
  const storedStepId = scrolledReadingStep(stepId)
  const validStep =
    stepId === 'video'
      ? Boolean(
          await db
            .select({ id: chapterVideo.id })
            .from(chapterVideo)
            .where(eq(chapterVideo.chapterId, savedChapter.id))
            .get()
        )
      : stepId.startsWith('reading-visit-')
        ? stepId === `reading-visit-${(await getReadingPageCounts(event)).get(slug)}`
        : true

  if (!validStep) {
    throw createError({ statusCode: 400, statusMessage: 'Step is not available in this chapter' })
  }

  db.transaction((tx) => saveChapterStep(tx, savedChapter.id, user.id, storedStepId))

  return { success: true, stepId }
})
