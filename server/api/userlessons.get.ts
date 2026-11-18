import { requireUser } from '~~/server/utils/session'
import { getChapterProgress } from '~~/server/utils/chapterProgress'

export default defineEventHandler(async (event) => {
  const currentUser = requireUser(event)

  return getChapterProgress(currentUser.id)
})