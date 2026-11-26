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
      return z.object({ 
        value: z
          .string()
          .trim()
          .refine((val) => val === '' || val.length>= 7, {
            message: 'Enter a valid phone number'
          }),
      })
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

    if (!hasChanges.value) {
      cancelEdit()
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
              field.value === 'phoneNumber' ? (form.value.trim() || null) : (profile.value.phoneNumber ?? null),
          },
        })
      }

      await refreshProfile()
      await navigateTo('/profile')
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Could not save this field. Please try again.'
      )

      if (field.value === 'email' && awaitingEmailVerification.value) {
        emailOtpError.value = message
      } else {
        fieldError.value = message
      }
    } finally {
      isSaving.value = false
    }
  }

  function getApiErrorMessage(error: unknown, fallback: string): string {
    const apiError = error as {
      data?: {
        statusMessage?: string
        message?: string
      }
      statusMessage?: string
      message?: string
    }

    return (
      apiError.data?.statusMessage ||
      apiError.data?.message ||
      apiError.statusMessage ||
      apiError.message ||
      fallback
    )
  }

  const hasChanges = computed(() => {
  const savedProfile = profile.value
  const selectedField = field.value

  if (!savedProfile || !selectedField) return false

  if (selectedField === 'phoneNumber') {
    return (
      form.value.replace(/\D/g, '') !==
      (savedProfile.phoneNumber ?? '').replace(/\D/g, '')
    )
  }

  if (selectedField === 'email') {
    return (
      form.value.trim().toLowerCase() !==
      savedProfile.email.toLowerCase()
    )
  }

  return form.value.trim() !== savedProfile.name
})
</script>

<template>
  <section class="max-w-2xl mx-auto px-4 py-10 sm:px-6">
    <UContainer>
      <div class="space-y-4">
        <UButton 
          icon="heroicons-chevron-left" 
          color="neutral" 
          variant="ghost"
          :disabled="isSaving"
          @click="cancelEdit"
          data-testid="back-button"
        >
          Back
        </UButton>
        <h1 class="mb-6 px-2 text-xl font-semibold text-[#e0004d]">
          Edit {{ fieldLabel.toLowerCase() }}
        </h1>

        <p v-if="status === 'pending'">Loading profile…</p>
        <p v-else-if="error">Could not load your profile. Please try again.</p>

        <UForm v-else :schema="formSchema" :state="form" class="space-y-5 mx-4" @submit="submitEdit">
          <UFormField :label="fieldLabel" name="value" :error="fieldError || undefined">
            <UInput
              v-model="form.value"
              size="lg"
              :type="inputType"
              :readonly="awaitingEmailVerification"
              autocomplete="off"
              class="w-full"
              data-testid="field-input"
            />
          </UFormField>

          <UFormField
            v-if="awaitingEmailVerification"
            label="Email verification code"
            name="emailOtp"
            size="lg"
            :error="emailOtpError || undefined"
          >
            <UInput
              v-model="emailOtp"
              inputmode="numeric"
              autocomplete="one-time-code"
              class="w-full"
              data-testid="otp-input"
            />
            <p class="mt-1 text-sm text-gray-500">Enter the code sent to your new email address.</p>
          </UFormField>

          <UButton
            type="submit"
            color="primary"
            class="w-full justify-center rounded-md mt-4"
            :loading="isSaving"
            :disabled="isSaving || (!hasChanges && !awaitingEmailVerification)"
            data-testid="save-button"
          >
            Save
          </UButton>
        </UForm>
      </div>
    </UContainer>
  </section>
</template>
