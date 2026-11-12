import { eq, asc } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { chapter, activity, activityQuestion } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const chapterRows = await db
    .select({ id: chapter.id, name: chapter.name })
    .from(chapter)
    .where(eq(chapter.slug, slug))
    .all()

  const ch = chapterRows[0]
  if (!ch) {
    throw createError({ statusCode: 404, statusMessage: 'Chapter not found' })
  }

  const activityRows = await db
    .select({ id: activity.id, title: activity.title })
    .from(activity)
    .where(eq(activity.chapterId, ch.id))
    .all()

  const act = activityRows[0]
  if (!act) {
    return { title: null, questions: [] as const }
  }

  const questions = await db
    .select({
      id: activityQuestion.id,
      key: activityQuestion.key,
      type: activityQuestion.type,
      prompt: activityQuestion.prompt,
      description: activityQuestion.description,
      options: activityQuestion.options,
      correctOptionId: activityQuestion.correctOptionId,
      position: activityQuestion.position,
    })
    .from(activityQuestion)
    .where(eq(activityQuestion.activityId, act.id))
    .orderBy(asc(activityQuestion.position))
    .all()

  return {
    title: act.title,
    questions,
  }
})