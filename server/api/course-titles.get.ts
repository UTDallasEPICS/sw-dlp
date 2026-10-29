import { sql } from 'drizzle-orm'
import { CourseTitles } from '../db/schema'
import { db } from '../utils/db'
import { requireUser } from '../utils/session'

export default defineEventHandler(async (event) => {
  requireUser(event)

  return db
    .select({
      id: CourseTitles.id,
      title: CourseTitles.Sections,
      chapters: CourseTitles.Chapters,
    })
    .from(CourseTitles)
    .orderBy(sql`${CourseTitles}.rowid`)
})
