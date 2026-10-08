export default defineNuxtRouteMiddleware(async (to) => {
  const requestFetch = useRequestFetch()
  const session = await requestFetch<{ user?: unknown } | null>('/api/auth/get-session')

  if (session?.user) {
    if (to.path === '/auth' || to.path === '/login' || to.path === '/signup') {
      return navigateTo('/dashboard')
    }
  } else {
    if (to.path !== '/auth' && to.path !== '/login' && to.path !== '/signup') {
      return navigateTo('/auth')
    }
  }
})
