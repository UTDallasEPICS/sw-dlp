<script setup lang="ts">
  import { z } from 'zod'

  type ProfileField = 'name' | 'email' | 'phoneNumber'

  interface Profile {
    name: string
    email: string
    phoneNumber: string | null
  }

  const route = useRoute()
  const {
    data: profile,
    status,
    error,
    refresh: refreshProfile,
  } = await useFetch<Profile>('/api/users/currentUser')

  const field = computed<ProfileField | null>(() => {
    const value = route.params.field
    return value === 'name' || value === 'email' || value === 'phoneNumber' ? value : null
  })

  const labels: Record<ProfileField, string> = {
    name: 'Name',
    email: 'Email',
    phoneNumber: 'Phone Number',
  }

  const fieldLabel = computed(() => (field.value ? labels[field.value] : 'Profile field'))
  const inputType = computed(() =>
    field.value === 'email' ? 'email' : field.value === 'phoneNumber' ? 'tel' : 'text'
  )
  const formSchema = computed(() => {
    if (field.value === 'name') {
      return z.object({ value: z.string().trim().min(1, 'Name is required') })
    }

    if (field.value === 'email') {
      return z.object({ value: z.string().trim().email('Enter a valid email address') })
    }

    if (field.value === 'phoneNumber') {
      return z.object({ value: z.string().trim().min(7, 'Enter a valid phone number') })
    }

    return z.object({ value: z.string().min(1, 'Invalid profile field') })
  })

  const form = reactive({ value: '' })
  const isSaving = ref(false)
  const awaitingEmailVerification = ref(false)
  const emailOtp = ref('')
  const emailOtpError = ref('')
  const fieldError = ref('')

  watch(
    [profile, field],
    () => {
      if (profile.value && field.value) {
        form.value = profile.value[field.value] ?? ''
      }
    },
    { immediate: true }
  )

  async function cancelEdit() {
    await navigateTo('/profile')
  }

  async function submitEdit() {
    fieldError.value = ''
    emailOtpError.value = ''

    if (!field.value || !profile.value) {
      fieldError.value = 'Profile data is unavailable.'
      return
    }

    isSaving.value = true

    try {
      if (field.value === 'email') {
        const newEmail = form.value.trim()

        if (awaitingEmailVerification.value) {
          if (!emailOtp.value.trim()) {
            emailOtpError.value = 'Enter the verification code sent to your new email.'
            return
          }

          await $fetch('/api/auth/email-otp/change-email', {
            method: 'POST',
            body: { newEmail, otp: emailOtp.value.trim() },
          })

          awaitingEmailVerification.value = false
          emailOtp.value = ''
        } else if (newEmail.toLowerCase() !== profile.value.email.toLowerCase()) {
          await $fetch('/api/auth/email-otp/request-email-change', {
            method: 'POST',
            body: { newEmail },
          })

          awaitingEmailVerification.value = true
          return
        }
      } else {
        await $fetch('/api/users/currentUser', {
          method: 'PATCH',
          body: {
            name: field.value === 'name' ? form.value : profile.value.name,
            phoneNumber:
              field.value === 'phoneNumber' ? form.value : (profile.value.phoneNumber ?? ''),
          },
        })
      }

      await refreshProfile()
      await navigateTo('/profile')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not save this field. Please try again.'

      if (field.value === 'email' && awaitingEmailVerification.value) {
        emailOtpError.value = message
      } else {
        fieldError.value = message
      }
    } finally {
      isSaving.value = false
    }
  }
</script>

<template>
  <section class="min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-10 sm:px-6">
    <UContainer>
      <div class="mx-auto max-w-md">
        <h1 class="mb-6 text-lg font-semibold text-[#e0004d]">
          Edit {{ fieldLabel.toLowerCase() }}
        </h1>

        <p v-if="status === 'pending'">Loading profile…</p>
        <p v-else-if="error">Could not load your profile. Please try again.</p>

        <UForm v-else :schema="formSchema" :state="form" class="space-y-5" @submit="submitEdit">
          <UFormField :label="fieldLabel" name="value" :error="fieldError || undefined">
            <UInput
              v-model="form.value"
              :type="inputType"
              :readonly="awaitingEmailVerification"
              autocomplete="off"
              class="w-full"
            />
          </UFormField>

          <UFormField
            v-if="awaitingEmailVerification"
            label="Email verification code"
            name="emailOtp"
            :error="emailOtpError || undefined"
          >
            <UInput
              v-model="emailOtp"
              inputmode="numeric"
              autocomplete="one-time-code"
              class="w-full"
            />
            <p class="mt-1 text-sm text-gray-500">Enter the code sent to your new email address.</p>
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UButton
              type="button"
              color="primary"
              variant="outline"
              class="w-full justify-center rounded-md"
              :disabled="isSaving"
              @click="cancelEdit"
            >
              Cancel
            </UButton>

            <UButton
              type="submit"
              color="primary"
              class="w-full justify-center rounded-md"
              :loading="isSaving"
            >
              Submit
            </UButton>
          </div>
        </UForm>
      </div>
    </UContainer>
  </section>
</template>
