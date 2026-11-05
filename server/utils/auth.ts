import { betterAuth } from 'better-auth'
import { APIError, createAuthMiddleware } from 'better-auth/api'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { env } from './env'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'
import { z } from 'zod'

const signupDetails = z.object({
  name: z.string().trim().min(1),
  phoneNumber: z.string().trim().min(7),
})

function accountNotFound() {
  return new APIError('NOT_FOUND', {
    message: 'No account found for this email. Sign up first.',
  })
}

const transporter = nodemailer.createTransport({
  host: env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS,
  },
})

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const isCodeRequest = ctx.path === '/email-otp/send-verification-otp'
        && ctx.body?.type === 'sign-in'
      if (!isCodeRequest && ctx.path !== '/sign-in/email-otp') return

      const email = z.string().trim().toLowerCase().email().safeParse(ctx.body?.email)
      if (!email.success) {
        throw new APIError('BAD_REQUEST', { message: 'Invalid email address.' })
      }

      const existingUser = await ctx.context.internalAdapter.findUserByEmail(email.data)
      const isSignup = ctx.headers?.get('x-auth-intent') === 'signup'
      if (isSignup && existingUser) {
        throw new APIError('CONFLICT', {
          message: 'An account already exists for this email. Log in instead.',
        })
      }
      if (!isSignup && !existingUser) throw accountNotFound()

      return { context: { body: { ...ctx.body, email: email.data } } }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          if (ctx?.path !== '/sign-in/email-otp') return
          if (ctx.headers?.get('x-auth-intent') !== 'signup') throw accountNotFound()

          const details = signupDetails.safeParse(user)
          if (!details.success) {
            throw new APIError('BAD_REQUEST', { message: 'Enter your name and phone number to sign up.' })
          }

          return { data: details.data }
        },
      },
    },
  },
  // Added an additional field for phone number 
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,   
        input: true,      
      },
    },
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await transporter.sendMail({
          from: env.EMAIL_FROM,
          to: email,
          subject: 'Your Stronger Women OTP',
          html: `Your verification code is: ${otp}`,
        })
      },
    }),
  ],
})
