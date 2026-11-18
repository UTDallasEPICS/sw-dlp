import { eq, and } from 'drizzle-orm'
import { db } from '../../../utils/db'
import {
  chapter,
  activity,
  activityQuestion,
  userQuestionResponse,
} from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.user?.id
  if (!userId) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const [savedChapter] = await db
    .select({ id: chapter.id })
    .from(chapter)
    .where(eq(chapter.slug, slug))
    .all()
  if (!savedChapter) {
    return { responses: [] as const }
  }

  const [savedActivity] = await db
    .select({ id: activity.id })
    .from(activity)
    .where(eq(activity.chapterId, savedChapter.id))
    .all()
  if (!savedActivity) {
    return { responses: [] as const }
  }

  const rows = await db
    .select({
      questionId: activityQuestion.id,
      key: activityQuestion.key,
      type: activityQuestion.type,
      selectedOptionId: userQuestionResponse.selectedOptionId,
      writtenAnswers: userQuestionResponse.writtenAnswers,
    })
    .from(activityQuestion)
    .innerJoin(
      userQuestionResponse,
      and(
        eq(userQuestionResponse.questionId, activityQuestion.id),
        eq(userQuestionResponse.userId, userId)
      )
    )
    .where(eq(activityQuestion.activityId, savedActivity.id))
    .all()

  return { responses: rows }
})