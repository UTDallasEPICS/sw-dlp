import { and, eq } from 'drizzle-orm'
import { chapter, lesson, userLesson } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { requireUser } from '~~/server/utils/session'

// Older databases store the lesson foreign key in userLesson.id.
const hasLessonIdColumn = (
  db.$client.prepare('PRAGMA table_info(userLesson)').all() as Array<{ name: string }>
).some((column) => column.name === 'lessonId')

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  const rows = await db
    .select({
      chapterId: chapter.id,
      chapterName: chapter.name,
      lessonId: lesson.id,
      completed: userLesson.completed,
    })
    .from(chapter)
    .leftJoin(lesson, eq(lesson.chapterId, chapter.id))
    .leftJoin(
      userLesson,
      and(
        hasLessonIdColumn ? eq(userLesson.lessonId, lesson.id) : eq(userLesson.id, lesson.id),
        eq(userLesson.userId, currentUser.id)
      )
    )
    .orderBy(chapter.name)

  const chapters = new Map<
    string,
    { id: string; name: string; lessonCount: number; completedLessonCount: number }
  >()

  for (const row of rows) {
    let progress = chapters.get(row.chapterId)

    if (!progress) {
      progress = {
        id: row.chapterId,
        name: row.chapterName,
        lessonCount: 0,
        completedLessonCount: 0,
      }
      chapters.set(row.chapterId, progress)
    }

    if (row.lessonId) {
      progress.lessonCount += 1
      if (row.completed) {
        progress.completedLessonCount += 1
      }
    }
  }

  return {
    chapters: Array.from(chapters.values(), ({ id, name, lessonCount, completedLessonCount }) => ({
      id,
      name,
      completed: lessonCount > 0 && completedLessonCount === lessonCount,
    })),
  }
})
