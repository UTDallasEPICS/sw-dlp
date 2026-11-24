export default defineNuxtRouteMiddleware(async () => {
  // useRequestFetch forwards the browser's cookies when this runs during server-side rendering
  const requestFetch = useRequestFetch()
 
  try {
    const me = await requestFetch<{ admin: boolean; blocked: boolean }>('/api/users/currentUser')
 
    if (!me.admin || me.blocked) {
      return navigateTo('/')
    }
  } catch {
    // no session (the API answered 401)
    return navigateTo('/auth')
  }
})