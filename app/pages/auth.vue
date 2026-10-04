<script setup lang="ts">
  import { z } from 'zod'
  import { authClient } from '../utils/auth-client'

  const toast = useToast()
  const activeTab = ref<'signup' | 'login'>('signup')

  const signup = reactive({ name: '', email: '', phone: '' })
  const login = reactive({ email: '' })

  const signupSchema = z.object({
    name: z.string().min(1, 'Required'),
    email: z.string().email('Invalid email'),
    phone: z.string().min(7, 'Invalid phone'),
  })

  const loginSchema = z.object({
    email: z.string().email('Invalid email'),
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
        path: '/signup',
        query: {
          email: signup.email,
          name: signup.name,
          phone: signup.phone,
        },
      })
    }
  }

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
    base: 'rounded-full bg-gray-50 border border-gray-200 placeholder:text-gray-400 focus:border-brand-500 focus:ring-0',
  }
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-4xl">
      <!-- Logo and header -->
      <div class="mb-10 text-center">
        <div class="mb-2 flex items-center justify-center gap-1">
          <img src="/logo_not_name.png" alt="Stronger Women" class="h-13 w-auto" />
          <h1 class="text-brand-500 text-3xl font-bold">Stronger Women</h1>
        </div>
        <p class="mt-1 text-gray-600">Digital Learning Platform</p>
      </div>

      <!-------- Desktop (side-by-side view) --------->
      <div
        class="relative hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-brand-500/20 md:grid md:grid-cols-2
              shadow-[0_0_60px_rgba(224,0,77,0.18)]"
      >
        <!-- Sign Up -->
        <div class="p-10">
          <h2 class="mb-8 text-center text-xl font-semibold">Sign up</h2>

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
        </div>

        <!-- Vertical Divider -->
        <div class="absolute inset-y-8 left-1/2 w-px -translate-x-1/2 bg-gray-200">
          <span
            class="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400"
          >
            or
          </span>
        </div>

        <!-- Login -->
        <div class="p-10">
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
        </div>
      </div>

      <!------------ Mobile / Ipad (tabs) ------------->
      <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl md:hidden">
        <!-- Tabs -->
        <div class="flex">
          <button
            class="flex-1 py-4 text-sm font-semibold transition-colors"
            :class="activeTab === 'signup' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600'"
            @click="activeTab = 'signup'"
          >
            Sign up
          </button>
          <button
            class="flex-1 py-4 text-sm font-semibold transition-colors"
            :class="activeTab === 'login' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600'"
            @click="activeTab = 'login'"
          >
            Login
          </button>
        </div>

        <div class="p-8">
          <!-- Sign Up Tab -->
          <div v-show="activeTab === 'signup'">
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
          </div>

          <!-- Login Tab -->
          <div v-show="activeTab === 'login'">
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>