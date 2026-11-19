import { eq, desc } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { prayerRequest } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'

// gets prayer-request user data for admin
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const userId = getRouterParam(event, 'userId')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing user ID',
    })
  }

  const requests = await db
    .select({
        id: prayerRequest.id,
        request: prayerRequest.request,
        submittedAt: prayerRequest.submittedAt,
    })
    .from(prayerRequest)
    .where(eq(prayerRequest.userId, userId))
    .orderBy(desc(prayerRequest.submittedAt))

    return requests
})