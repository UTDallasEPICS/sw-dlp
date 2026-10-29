<script setup lang="ts">
  import { z } from 'zod'
  import { authClient } from '../../utils/auth-client'

  const toast = useToast()
  const signup = reactive({ name: '', email: '', phone: '' })

  const signupSchema = z.object({
    name: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(7, 'Invalid phone'),
  })

  async function handleSignup() {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: signup.email,
      type: 'sign-in',
    })

    if (error) {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    } else {
      toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
      await navigateTo({
        path: '/signup/verify',
        query: {
          email: signup.email,
          name: signup.name,
          phone: signup.phone,
        },
      })
    }
  }

  const inputUi = {
    base: 'rounded-full bg-gray-50 border border-gray-200 text-black placeholder:text-gray-400 focus:border-brand-500 focus:ring-0',
  }
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 text-black">
    <div class="w-full max-w-xl">
      <div class="mb-10 text-center">
        <div class="mb-2 flex items-center justify-center gap-0">
          <img src="/logo_not_name.png" alt="Stronger Women" class="h-20 w-auto" />
          <h1 class="text-brand-500 -ml-2 text-3xl font-bold">Stronger Women</h1>
        </div>
        <p class="mt-1 text-gray-600">Digital Learning Platform</p>
      </div>

      <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <h2 class="mb-8 text-center text-xl font-semibold">Create account</h2>

        <UForm :schema="signupSchema" :state="signup" class="space-y-5" @submit="handleSignup">
          <UFormField name="name">
            <UInput
              v-model="signup.name"
              placeholder="Enter name"
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>
          <UFormField name="email">
            <UInput
              v-model="signup.email"
              type="email"
              placeholder="Enter email"
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>
          <UFormField name="phone">
            <UInput
              v-model="signup.phone"
              type="tel"
              placeholder="Enter phone number"
              class="w-full"
              :ui="inputUi"
            />
          </UFormField>

          <UButton
            type="submit"
            loading-auto
            block
            class="bg-brand-500 hover:bg-brand-600 rounded-full py-3 text-sm font-semibold tracking-widest text-white uppercase"
          >
            Create Account
          </UButton>
        </UForm>

        <p class="mt-6 text-center text-sm text-gray-600">
          Already have an account?
          <NuxtLink to="/auth" class="text-brand-500 font-semibold hover:underline">
            Login
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>