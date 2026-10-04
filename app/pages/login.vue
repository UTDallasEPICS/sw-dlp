<script setup lang="ts">
import { z } from 'zod'
import { authClient } from '../utils/auth-client'

const route = useRoute()
const toast = useToast()

const email = computed(() => route.query.email as string)
const otp = ref<string[]>([])

const schema = z.object({
  otp: z.array(z.string()).length(6, 'Must be 6 digits'),
})

async function handleVerify() {
  const { error } = await authClient.signIn.emailOtp({
    email: email.value,
    otp: otp.value.join(''),
  })

  if (error) {
    toast.add({ title: 'Error', description: error.message, color: 'error' })
  } else {
    await navigateTo('/', { external: true })
  }
}

function goBack() {
  navigateTo('/auth')
}
</script>

<template>
  <div class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
    <div class="w-full max-w-md">
      <!-- logo header ... -->
      <div class="rounded-2xl border border-gray-100 bg-white p-10 shadow-2xl shadow-brand-500/20">
        <h2 class="mb-2 text-center text-xl font-semibold">Enter verification code</h2>
        <p class="mb-8 text-center text-sm text-gray-500">
          We sent a 6-digit code to <strong>{{ email }}</strong>
        </p>

        <UForm :schema="schema" :state="{ otp }" class="space-y-6" @submit="handleVerify">
          <UFormField name="otp">
            <UPinInput
              v-model="otp"
              otp
              :length="6"
              size="lg"
              class="flex w-full items-center justify-center"
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

          <p class="text-center text-sm text-gray-500">
            <button type="button" class="text-brand-500 hover:underline" @click="goBack">
              Change email
            </button>
          </p>
        </UForm>
      </div>
    </div>
  </div>
</template>