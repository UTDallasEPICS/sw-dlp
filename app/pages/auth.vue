<script setup lang="ts">
  import { z } from 'zod'
  import { authClient } from '../utils/auth-client'

  const toast = useToast()

  const login = reactive({ email: '' })

  const loginSchema = z.object({
    email: z.string().email('Invalid email'),
  })

  async function handleLogin() {
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email: login.email,
      type: 'sign-in',
    })

    if (error) {
      toast.add({ title: 'Error', description: error.message, color: 'error' })
    } else {
      toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
      await navigateTo({
        path: '/login',
        query: { email: login.email },
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
      <!-- Logo and header -->
      <div class="mb-10 text-center">
        <div class="mb-2 flex items-center justify-center gap-0">
          <img src="/logo_not_name.png" alt="Stronger Women" class="h-20 w-auto" />
          <h1 class="text-brand-500 -ml-2 text-3xl font-bold">Stronger Women</h1>
        </div>
        <p class="mt-1 text-gray-600">Digital Learning Platform</p>
      </div>

      <div class="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <h2 class="mb-8 text-center text-xl font-semibold">Login</h2>

        <UForm :schema="loginSchema" :state="login" class="space-y-5" @submit="handleLogin">
          <UFormField name="email">
            <UInput
              v-model="login.email"
              type="email"
              placeholder="Enter email"
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
            Login
          </UButton>
        </UForm>

        <p class="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?
          <NuxtLink to="/signup" class="text-brand-500 font-semibold hover:underline">
            Sign up
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>