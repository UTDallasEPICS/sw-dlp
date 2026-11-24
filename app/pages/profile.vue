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

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
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

  function formatDate(value: string) {
    return dateFormatter.format(new Date(value))
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
        <div class="mb-6 flex items-center justify-between">
          <h1 class="text-lg font-semibold text-[#e0004d]">Your profile</h1>
          <UButton
            v-if="profile && !isEditing"
            type="button"
            color="neutral"
            variant="ghost"
            icon="i-lucide-pencil"
            class="hidden lg:inline-flex"
            @click="startEditing"
          >
            Edit
          </UButton>
        </div>

        <p v-if="status === 'pending'">Loading profile…</p>
        <p v-else-if="error">Could not load your profile. Please try again.</p>

        <div v-else-if="profile">
          <nav class="mx-auto max-w-md space-y-3 lg:hidden" aria-label="Profile fields">
            <NuxtLink
              to="/profile-edit/name"
              class="flex min-h-16 items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-[#e0004d]"
            >
              <span class="min-w-0">
                <span class="block text-sm text-gray-500">Name</span>
                <span class="block truncate">{{ profile.name }}</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-gray-500" aria-hidden="true" />
            </NuxtLink>

            <NuxtLink
              to="/profile-edit/email"
              class="flex min-h-16 items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-[#e0004d]"
            >
              <span class="min-w-0">
                <span class="block text-sm text-gray-500">Email</span>
                <span class="block truncate">{{ profile.email }}</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-gray-500" aria-hidden="true" />
            </NuxtLink>

            <NuxtLink
              to="/profile-edit/phoneNumber"
              class="flex min-h-16 items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:border-[#e0004d]"
            >
              <span class="min-w-0">
                <span class="block text-sm text-gray-500">Phone Number</span>
                <span class="block truncate">{{ profile.phoneNumber || 'Not provided' }}</span>
              </span>
              <UIcon name="i-lucide-chevron-right" class="size-5 shrink-0 text-gray-500" aria-hidden="true" />
            </NuxtLink>
          </nav>

          <UForm
            :schema="profileSchema"
            :state="draft"
            class="mx-auto hidden max-w-md space-y-5 lg:block"
            @submit="saveProfile"
          >
            <UFormField label="Name" name="name">
              <UInput v-model="draft.name" :readonly="!isEditing" class="w-full" />
            </UFormField>

            <UFormField label="Email" name="email">
              <UInput
                v-model="draft.email"
                :readonly="!isEditing || awaitingEmailVerification"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Phone Number" name="phoneNumber">
              <UInput v-model="draft.phoneNumber" :readonly="!isEditing" class="w-full" />
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

          <div class="mt-6 text-center text-xs text-gray-400">
            <p>Account created on {{ formatDate(profile.createdAt) }}</p>
            <p>Account last updated on {{ formatDate(profile.updatedAt) }}</p>
          </div>
        </div>
        <p v-else>Profile data is unavailable. Please try again.</p>
      </div>
    </UContainer>
  </section>
</template>
