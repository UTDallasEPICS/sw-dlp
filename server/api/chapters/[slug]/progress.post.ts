import { and, eq } from 'drizzle-orm'
import { z } from 'zod'
import {
  activity,
  activityQuestion,
  chapter,
  chapterVideo,
  lesson,
  userLesson,
} from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { requireUser } from '~~/server/utils/session'

const bodySchema = z.object({
  stepId: z.string().regex(/^(video|reading-\d+|activity)$/),
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
  const validStep =
    stepId === 'video'
      ? Boolean(
          await db
            .select({ id: chapterVideo.id })
            .from(chapterVideo)
            .where(eq(chapterVideo.chapterId, savedChapter.id))
            .get()
        )
      : stepId === 'activity'
        ? Boolean(
            await db
              .select({ id: activityQuestion.id })
              .from(activity)
              .innerJoin(activityQuestion, eq(activityQuestion.activityId, activity.id))
              .where(eq(activity.chapterId, savedChapter.id))
              .get()
          )
        : true

  if (!validStep) {
    throw createError({ statusCode: 400, statusMessage: 'Step is not available in this chapter' })
  }

  let savedLesson = await db
    .select({ id: lesson.id })
    .from(lesson)
    .where(and(
      eq(lesson.chapterId, savedChapter.id),
      eq(lesson.name, stepId)
    ))
    .get()

  if (!savedLesson) {
    savedLesson = await db
      .insert(lesson)
      .values({
        chapterId: savedChapter.id,
        name: stepId,
        type: stepId.split('-')[0] ?? stepId,
      })
      .returning({ id: lesson.id })
      .get()
  }

  await db
    .insert(userLesson)
    .values({
      userId: user.id,
      lessonId: savedLesson.id,
      completed: true,
      completedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [userLesson.userId, userLesson.lessonId],
      set: { completed: true, completedAt: new Date() },
    })
    .run()

  return { success: true, stepId }
})
