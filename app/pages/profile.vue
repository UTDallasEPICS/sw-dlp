<script setup lang="ts">
  import { z } from 'zod'

  interface Profile {
    name: string
    email: string
    phoneNumber: string | null
    createdAt: string
    updatedAt: string
  }

  const profileSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Enter a valid email address'),
    phoneNumber: z.string().trim().min(7, 'Enter a valid phone number'),
  })

  const {
    data: profile,
    status,
    error,
    refresh: refreshProfile,
  } = await useFetch<Profile>('/api/users/currentUser')

  const isEditing = ref(false)
  const isSaving = ref(false)
  const awaitingEmailVerification = ref(false)
  const emailOtp = ref('')
  const emailOtpError = ref('')
  const submitError = ref('')
  const draft = reactive({
    name: '',
    email: '',
    phoneNumber: '',
  })

  function copySavedProfile() {
    const saved = profile.value
    if (!saved) return

    Object.assign(draft, {
      name: saved.name,
      email: saved.email,
      phoneNumber: saved.phoneNumber ?? '',
    })
  }

  function startEditing() {
    if (isEditing.value) return

    copySavedProfile()
    isEditing.value = true
  }

  function cancelEditing() {
    copySavedProfile()
    awaitingEmailVerification.value = false
    emailOtp.value = ''
    emailOtpError.value = ''
    submitError.value = ''
    isEditing.value = false
  }

  async function saveProfile() {
    if (!profile.value) {
      submitError.value = 'Profile data is unavailable.'
      return
    }

    isSaving.value = true
    emailOtpError.value = ''
    submitError.value = ''

    try {
      if (awaitingEmailVerification.value) {
        if (!emailOtp.value.trim()) {
          emailOtpError.value = 'Enter the verification code sent to your new email.'
          return
        }

        await $fetch('/api/auth/email-otp/change-email', {
          method: 'POST',
          body: {
            newEmail: draft.email.trim(),
            otp: emailOtp.value.trim(),
          },
        })

        awaitingEmailVerification.value = false
        emailOtp.value = ''
        await refreshProfile()
      } else if (draft.email.trim().toLowerCase() !== profile.value.email.toLowerCase()) {
        await $fetch('/api/auth/email-otp/request-email-change', {
          method: 'POST',
          body: { newEmail: draft.email.trim() },
        })

        awaitingEmailVerification.value = true
        return
      }

      await $fetch('/api/users/currentUser', {
        method: 'PATCH',
        body: {
          name: draft.name,
          phoneNumber: draft.phoneNumber,
        },
      })

      await refreshProfile()
      copySavedProfile()
      isEditing.value = false
    } catch (error) {
      submitError.value = error instanceof Error
        ? error.message
        : 'Could not save your profile. Please try again.'
    } finally {
      isSaving.value = false
    }
  }

  watch(profile, () => {
    if (!isEditing.value) copySavedProfile()
  }, { immediate: true })
</script>
<template>
  <section class="min-h-[calc(100vh-4rem)] bg-gray-100 px-4 py-10 sm:px-6">
    <UContainer>
      <div class="mx-auto max-w-4xl">
        <h1 class="mb-6 text-lg font-semibold text-[#e0004d]">Your profile</h1>

        <p v-if="status === 'pending'">Loading profile…</p>
        <p v-else-if="error">Could not load your profile. Please try again.</p>

        <UForm
          v-else
          :schema="profileSchema"
          :state="draft"
          class="mx-auto max-w-md space-y-5"
          @submit="saveProfile"
        >
          <UFormField label="Name" name="name">
            <UInput
              v-model="draft.name"
              :readonly="!isEditing"
              class="w-full"
              @focus="startEditing"
            />
          </UFormField>

          <UFormField label="Email" name="email">
            <UInput
              v-model="draft.email"
              :readonly="!isEditing || awaitingEmailVerification"
              class="w-full"
              @focus="startEditing"
            />
          </UFormField>

          <UFormField label="Phone Number" name="phoneNumber">
            <UInput
              v-model="draft.phoneNumber"
              :readonly="!isEditing"
              class="w-full"
              @focus="startEditing"
            />
          </UFormField>

          <UFormField
            v-if="awaitingEmailVerification"
            label="Email verification code"
            name="emailOtp"
            :error="emailOtpError"
          >
            <UInput
              v-model="emailOtp"
              inputmode="numeric"
              autocomplete="one-time-code"
              class="w-full"
            />
            <p class="mt-1 text-sm text-gray-500">
              Enter the code sent to your new email address.
            </p>
          </UFormField>

          <p v-if="submitError" role="alert" class="text-sm text-red-600">
            {{ submitError }}
          </p>

          <div v-if="isEditing" class="grid grid-cols-2 gap-4">
            <UButton
              type="button"
              color="primary"
              variant="outline"
              class="w-full justify-center rounded-md"
              :disabled="isSaving"
              @click="cancelEditing"
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
