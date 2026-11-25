<script setup lang="ts">
  useHead({ title: 'Prayer Request | Stronger Women' })

  const { data: currentUser } = useNuxtData<{ admin: boolean } | null>('current-user')
  const isAdmin = computed(() => currentUser.value?.admin === true)

  const text = ref('')
  const isSubmitting = ref(false)
  const error = ref('')
  const success = ref('')

  const { data: requests, refresh, pending } = await useFetch<
    { id: string; request: string; submittedAt: string | Date }[]
  >('/api/prayer-requests')

  async function submitRequest() {
    if (isAdmin.value) return // the form is disabled for admins
    error.value = ''
    success.value = ''
    const request = text.value.trim()
    if (!request) {
      error.value = 'Please write your prayer request.'
      return
    }

    isSubmitting.value = true
    try {
      await $fetch('/api/prayer-requests', {
        method: 'POST',
        body: { request }, // matches requestSchema
      })
      text.value = ''
      success.value = 'Your prayer request was submitted.'
      await refresh()
    } catch {
      error.value = 'Could not submit. Please try again.'
    } finally {
      isSubmitting.value = false
    }
  }

  function formatDate(value: string | Date) {
    return new Date(value).toLocaleString(undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    })
  }
</script>

<template>
  <UContainer class="py-10 sm:py-14">
    <div class="mx-auto max-w-2xl">
      <h1 class="mb-6 text-3xl font-bold text-brand-500">Prayer Request</h1>
      <p class="mt-2 text-gray-900">
        Share what you would like a prayer for. You can submit more than one request.
      </p>

      <!-- Admins can look at this page but not submit -->
      <UAlert
        v-if="isAdmin"
        class="mt-5"
        color="neutral"
        variant="subtle"
        icon="i-lucide-info"
        title="Prayer requests are for users only"
        description="Admins can view this page, but can’t submit prayer requests."
      />

      <form class="mt-5 max-w-2xl space-y-4" @submit.prevent="submitRequest">
        <textarea
          v-model="text"
          rows="5"
          :disabled="isAdmin"
          class="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 
          focus:ring-brand-500/30 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
          placeholder="Write your prayer request here..."
        />
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">{{ success }}</p>
        <UButton
          type="submit"
          :disabled="isAdmin"
          :loading="isSubmitting"
          class="rounded-full bg-brand-500 px-6 py-3 font-semibold text-white hover:bg-brand-600"
        >
          Submit Prayer Request
        </UButton>
      </form>

      <section v-if="!isAdmin || requests?.length" class="mt-12 max-w-2xl">
        <h2 class="text-[22px] font-semibold text-gray-900">Your requests</h2>
        <p v-if="pending" class="mt-4 text-gray-500">Loading...</p>
        <ul v-else-if="requests?.length" class="mt-4 space-y-3">
          <li
            v-for="item in requests"
            :key="item.id"
            class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p class="text-gray-800 whitespace-pre-wrap">{{ item.request }}</p>
            <p class="mt-2 text-xs text-gray-500">
              Submitted: {{ formatDate(item.submittedAt) }}
            </p>
          </li>
        </ul>
        <p v-else class="mt-4 text-gray-500">No prayer requests yet.</p>
      </section>
    </div>  
  </UContainer>
</template>
