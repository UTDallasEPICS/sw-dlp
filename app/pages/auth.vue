<script setup lang="ts">
  import { z } from 'zod'
  import { authClient } from '../utils/auth-client'

  const toast = useToast()

  const isEmailSent = ref(false)
  const activeTab = ref<'signup' | 'login'>('signup') // mobile only

  const signup = reactive({ name: '', email: '', phone: '', otp: [] as string[] })
  const login = reactive({ email: '', otp: [] as string[] })

  //------ Schemas ----------
  const signupSchema = computed(() => {
    if (!isEmailSent.value) {
      return z.object({
        name: z.string().min(1, 'Required'),
        email: z.string().email('Invalid email'),
        phone: z.string().min(7, 'Invalid phone'),
      })
    } else {
      return z.object({
        email: z.string().email('Invalid email'),
        otp: z.array(z.string()).length(6, 'Must be 6 digits'),
      })
    }
  })

  const loginSchema = computed(() => {
    if (!isEmailSent.value) {
      return z.object({
        email: z.string().email('Invalid email'),
      })
    }
    return z.object({
      email: z.string().email('Invalid email'),
      otp: z.array(z.string()).length(6, 'Must be 6 digits'),
    })
  })

  //------------- Signup ---------------
  async function handleSignup() {
    if (!isEmailSent.value) {
      // Sends OTP
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: signup.email,
        type: 'sign-in',
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        isEmailSent.value = true
        toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
      }
    } else {
      // Verify OTP and create an account
      const { error } = await authClient.signIn.emailOtp({
        email: signup.email,
        otp: signup.otp.join(''),
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        await navigateTo('/', { external: true })
      }
    }
  }

  //------------- Login ---------------
  async function handleLogin() {
    if (!isEmailSent.value) {
      // Sends OTP
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: login.email,
        type: 'sign-in',
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        isEmailSent.value = true
        toast.add({ title: 'Success', description: 'OTP sent to your email', color: 'success' })
      }
    } else {
      // Verify OTP and log into account
      const { error } = await authClient.signIn.emailOtp({
        email: login.email,
        otp: login.otp.join(''),
      })

      if (error) {
        toast.add({ title: 'Error', description: error.message, color: 'error' })
      } else {
        await navigateTo('/', { external: true })
      }
    }
  }

  function resetOtp() {
    isEmailSent.value = false
    signup.otp = []
    login.otp = []
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
        <h1 class="text-brand-500 text-3xl font-bold">Stronger Women</h1>
        <p class="mt-1 text-gray-600">Digital Learning Platform</p>
      </div>

      <!-------- Desktop (side-by-side view) --------->
      <div
        class="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl md:grid md:grid-cols-2"
      >
        <!-- SIGN UP -->
        <div class="p-10">
          <h2 class="mb-8 text-center text-xl font-semibold">Sign up</h2>

          <UForm :schema="signupSchema" :state="signup" class="space-y-5" @submit="handleSignup">
            <template v-if="!isEmailSent">
              <UFormField name="name">
                <UInput
                  v-model="signup.name"
                  placeholder="Enter first and last name"
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
            </template>

            <UFormField name="otp" v-if="isEmailSent">
              <UPinInput
                otp
                v-model="signup.otp"
                :length="6"
                size="xl"
                class="flex w-full items-center justify-center"
              />
            </UFormField>

            <UButton
              loading-auto
              type="submit"
              class="bg-brand-500 hover:bg-brand-600 rounded-full py-3 text-sm font-semibold tracking-widest text-white uppercase"
            >
              {{ isEmailSent ? 'Login' : 'Send OTP' }}
            </UButton>

            <p v-if="isEmailSent" class="text-center text-sm text-gray-500">
              <button type="button" class="text-brand-500 hover:underline" @click="resetOtp">
                Change email
              </button>
            </p>
          </UForm>
        </div>

        <!-- Divider -->
        <div class="relative border-l border-gray-200">
          <span
            class="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-sm text-gray-400"
          >
            or
          </span>
        </div>

        <!-- LOGIN -->
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
                :disabled="isEmailSent"
              />
            </UFormField>

            <UFormField v-if="isEmailSent" name="otp">
              <UPinInput
                v-model="login.otp"
                otp
                :length="6"
                size="lg"
                class="flex justify-center"
              />
            </UFormField>

            <UButton
              type="submit"
              loading-auto
              block
              class="bg-brand-500 hover:bg-brand-600 rounded-full py-3 text-sm font-semibold tracking-widest text-white uppercase"
            >
              {{ isEmailSent ? 'Login' : 'Send OTP' }}
            </UButton>

            <p v-if="isEmailSent" class="text-center text-sm text-gray-500">
              <button type="button" class="text-brand-500 hover:underline" @click="resetOtp">
                Change email
              </button>
            </p>
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
            @click="
              activeTab = 'signup'
              resetOtp()
            "
          >
            Sign up
          </button>
          <button
            class="flex-1 py-4 text-sm font-semibold transition-colors"
            :class="activeTab === 'login' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600'"
            @click="
              activeTab = 'login'
              resetOtp()
            "
          >
            Login
          </button>
        </div>

        <div class="p-8">
          <!-- SIGN UP TAB -->
          <div v-show="activeTab === 'signup'">
            <UForm :schema="signupSchema" :state="signup" class="space-y-5" @submit="handleSignup">
              <template v-if="!isEmailSent">
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
              </template>

              <UFormField v-else name="otp">
                <UPinInput
                  v-model="signup.otp"
                  otp
                  :length="6"
                  size="lg"
                  class="flex justify-center"
                />
              </UFormField>

              <UButton
                type="submit"
                loading-auto
                block
                class="bg-brand-500 hover:bg-brand-600 rounded-full py-3 text-sm font-semibold tracking-widest text-white uppercase"
              >
                {{ isEmailSent ? 'Verify & Create Account' : 'Create Account' }}
              </UButton>
            </UForm>
          </div>

          <!-- LOGIN TAB -->
          <div v-show="activeTab === 'login'">
            <UForm :schema="loginSchema" :state="login" class="space-y-5" @submit="handleLogin">
              <UFormField name="email">
                <UInput
                  v-model="login.email"
                  type="email"
                  placeholder="Enter email"
                  class="w-full"
                  :ui="inputUi"
                  :disabled="isEmailSent"
                />
              </UFormField>

              <UFormField v-if="isEmailSent" name="otp">
                <UPinInput
                  v-model="login.otp"
                  otp
                  :length="6"
                  size="lg"
                  class="flex justify-center"
                />
              </UFormField>

              <UButton
                type="submit"
                loading-auto
                block
                class="bg-brand-500 hover:bg-brand-600 rounded-full py-3 text-sm font-semibold tracking-widest text-white uppercase"
              >
                {{ isEmailSent ? 'Login' : 'Send OTP' }}
              </UButton>
            </UForm>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
