import { eq, desc } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { prayerRequest } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

// gets current user prayer requests
export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  const requests = await db
    .select({
      id: prayerRequest.id,
      request: prayerRequest.request,
      submittedAt: prayerRequest.submittedAt,
    })
    .from(prayerRequest)
    .where(eq(prayerRequest.userId, currentUser.id))
    .orderBy(desc(prayerRequest.submittedAt))

  return requests
})