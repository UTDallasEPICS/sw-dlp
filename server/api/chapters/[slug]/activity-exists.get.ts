import { eq } from 'drizzle-orm'
import { db } from '../../../utils/db'
import { chapter, activity } from '~~/server/db/schema' 

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const row = await db
    .select({ activityId: activity.id })
    .from(chapter)
    .leftJoin(activity, eq(activity.chapterId, chapter.id))
    .where(eq(chapter.slug, slug))
    .get()

  return {
    hasActivity: Boolean(row?.activityId),
  }
})