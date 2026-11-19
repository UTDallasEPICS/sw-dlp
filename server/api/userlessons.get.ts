import { requireUser } from '~~/server/utils/session'
import { getChapterProgress, getReadingPageCounts } from '~~/server/utils/chapterProgress'

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  return getChapterProgress(currentUser.id, await getReadingPageCounts(event))
})
