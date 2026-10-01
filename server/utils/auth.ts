import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db'
import { env } from './env'
import { emailOTP } from 'better-auth/plugins/email-otp'
import nodemailer from 'nodemailer'

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
