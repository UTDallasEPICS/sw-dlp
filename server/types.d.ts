import { auth } from './utils/auth'

declare module 'h3' {
  interface H3EventContext {
    user?: typeof auth.$Infer.Session.user
    session?: typeof auth.$Infer.Session.session
  }
}
