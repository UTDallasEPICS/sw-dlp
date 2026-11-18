import { db } from '~~/server/utils/db'
import { user } from '~~/server/db/schema'
import { requireAdmin } from '~~/server/utils/session'
import { getChapterProgress } from '~~/server/utils/chapterProgress'

// for admin: get ALL users progress by chapter
export default defineEventHandler(async (event) => {
  /* take off later when actuallly implementing admin thing
    await requireAdmin(event)
  */

  const users = await db
    .select({ id: user.id })
    .from(user)

  const results = []

  for (const currentUser of users) {
    const { chapters } = await getChapterProgress(currentUser.id)

    const completedChapters = chapters.filter(
      chapter => chapter.completed
    ).length

    const totalChapters = chapters.length

    results.push({
      userId: currentUser.id,
      completedChapters,
      totalChapters,
      progress: totalChapters > 0
        ? Math.round(
            (completedChapters / totalChapters) * 100
          )
        : 0,
    })
  }

  return results
})