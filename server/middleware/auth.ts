import { auth } from '~~/server/utils/auth'

// API paths that must stay reachable without a session. Better Auth's own
// endpoints (sign-in, email OTP, get-session, etc.) live under /api/auth.
const PUBLIC_PREFIXES = ['/api/auth', '/api/health', '/api/_nuxt_icon', '/api/users/signup']

export default defineEventHandler(async (event) => {
  // Only guard server API routes. Page navigation and assets are handled by
  // the client route middleware (app/middleware/auth.global.ts).
  if (!event.path.startsWith('/api/')) {
    return
  }

  const pathname = event.path.split('?')[0] ?? event.path

  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return
  }

  const session = await auth.api.getSession({
    headers: event.headers,
  })

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.user = session.user
  event.context.session = session.session
})
