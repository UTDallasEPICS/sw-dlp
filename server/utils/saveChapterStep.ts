import { and, eq } from 'drizzle-orm'
import { lesson, userLesson } from '../db/schema'
import type { db } from './db'

type ChapterStepWriter = Pick<typeof db, 'select' | 'insert'>

export function saveChapterStep(writer: ChapterStepWriter, chapterId: string, userId: string, stepId: string) {
  const savedLesson = writer
    .select({ id: lesson.id })
    .from(lesson)
    .where(and(eq(lesson.chapterId, chapterId), eq(lesson.name, stepId)))
    .get() ?? writer
    .insert(lesson)
    .values({ chapterId, name: stepId, type: stepId.split('-')[0] ?? stepId })
    .returning({ id: lesson.id })
    .get()

  const completedAt = new Date()
  writer
    .insert(userLesson)
    .values({ userId, lessonId: savedLesson.id, completed: true, completedAt })
    .onConflictDoUpdate({
      target: [userLesson.userId, userLesson.lessonId],
      set: { completed: true, completedAt },
    })
    .run()
}
