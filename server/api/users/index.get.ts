import { db } from '../../utils/db'
import { user, prayerRequest } from '../../db/schema'
import { eq, sql } from 'drizzle-orm'
//import { requireAdmin } from '../../utils/session.ts'

// await requireAdmin(event) add back to test admin
export default defineEventHandler(async (event) => {

  // combine user data w/ prayer request data
  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      admin: user.admin,
      blocked: user.blocked,
      createdAt: user.createdAt,
      prayerRequestCount: sql<number>`count(${prayerRequest.id})`.mapWith(Number),
    })
    .from(user)
    .leftJoin(prayerRequest, eq(user.id, prayerRequest.userId))
    .groupBy(user.id)
 
  return rows.map((row) => ({
    ...row,
    hasPrayerRequest: row.prayerRequestCount > 0,
  }))
})
