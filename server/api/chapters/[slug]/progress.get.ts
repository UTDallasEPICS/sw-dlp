import { and, eq } from 'drizzle-orm'
import { chapter, lesson, userLesson } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { requireUser } from '~~/server/utils/session'

export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const slug = getRouterParam(event, 'slug')

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing chapter slug' })
  }

  const savedChapter = await db
    .select({ id: chapter.id })
    .from(chapter)
    .where(eq(chapter.slug, slug))
    .get()

  if (!savedChapter) {
    throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  }

  const completedSteps = await db
    .select({ stepId: lesson.name })
    .from(lesson)
    .innerJoin(userLesson, and(
      eq(userLesson.lessonId, lesson.id),
      eq(userLesson.userId, user.id),
      eq(userLesson.completed, true)
    ))
    .where(
      eq(lesson.chapterId, savedChapter.id)
    )

  return { completedSteps: completedSteps.map(({ stepId }) => stepId) }
})
