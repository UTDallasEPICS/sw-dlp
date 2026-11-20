import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'
import { getChapterProgress, getReadingPageCounts } from '~~/server/utils/chapterProgress'

// for admin: get ALL users progress percentage by chapter
export default defineEventHandler(async (event) => {
    await requireAdmin(event)

  const users = await db
    .select({ id: user.id })
    .from(user)

  const results = []
  const readingPageCounts = await getReadingPageCounts(event)

  for (const currentUser of users) {
    const { chapters } = await getChapterProgress(currentUser.id, readingPageCounts)

    const completedChapters = chapters.filter(chapter => chapter.completed).length
    const completedChapterNames = chapters.filter(chapter => chapter.completed)
        .map(chapter => chapter.name)

    const totalChapters = chapters.length

    results.push({
      userId: currentUser.id,
      completedChapters,
      totalChapters,
      progress: totalChapters > 0
        ? Math.round( (completedChapters / totalChapters) * 100) : 0,
      completedChapterNames,
    })
  }

  return results
})
