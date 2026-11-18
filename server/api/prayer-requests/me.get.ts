import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { prayerRequest } from '~~/server/db/schema'
import { requireUser } from '~~/server/utils/session'

// gets current user prayer request
export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  const [record] = await db
    .select({
      request: prayerRequest.request,
      submittedAt: prayerRequest.submittedAt,
    })
    .from(prayerRequest)
    .where(eq(prayerRequest.userId, currentUser.id))

  return record ?? null
})