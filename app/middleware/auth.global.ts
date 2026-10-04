import { authClient } from '../utils/auth-client'

export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await authClient.useSession(useFetch)

  if (session.value) {
    if (to.path === '/auth' || to.path === '/login' || to.path === '/signup') {
      return navigateTo('/')
    }
  } else {
    if (to.path !== '/auth' && to.path !== '/login' && to.path !== '/signup') {
      return navigateTo('/auth')
    }
  }
})
