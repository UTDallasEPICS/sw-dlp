<script setup lang="ts">
  import type { TableColumn } from '@nuxt/ui'
  import type { Row } from '@tanstack/vue-table'
  import { getExpandedRowModel, } from '@tanstack/vue-table'

  const expanded = ref<Record<string, boolean>>({})

  const columns: TableColumn<UserWithProgress>[] = [
    { accessorKey: 'name', header: 'User', },
    { accessorKey: 'email', header: 'Email', },
    { accessorKey: 'admin', header: 'Role', },
    { id: 'status', header: 'Status', },
    { accessorKey: 'hasPrayerRequest', header: 'Prayer Request', },
    { accessorKey: 'progress', header: 'Progress',},
    { id: 'expand', header: '', },
    { id: 'edit', header: ''},
  ]

  interface User {
    id: string
    name: string
    email: string
    phoneNumber: string | null
    emailVerified: boolean
    admin: boolean
    blocked: boolean
    createdAt: string
    hasPrayerRequest: boolean
    prayerRequestCount?: number
  }

  interface PrayerRequestData {
    id: string
    request: string
    submittedAt: string
  }

  interface UserProgress {
    userId: string
    completedChapters: number
    totalChapters: number
    progress: number
    completedChapterNames: string[]
  }

  interface UserWithProgress extends User {
    completedChapters: number
    totalChapters: number
    progress: number
    completedChapterNames: string[]
  }

  const { data: users, pending, error, refresh } = await useFetch<User[]>('/api/users')
  const { data: progressData } = await useFetch<UserProgress[]>('/api/users/allProgress')
  
  const search = ref('')
  const statusFilter = ref('all')
  const roleFilter = ref('all')
  const prayerFilter = ref('all')
  const prayerRequests = ref<Record<string, PrayerRequestData[]>>({})
  const prayerLoading = ref<string[]>([])
  const prayerErrors = ref<string[]>([])

  const statusItems = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Verified', value: 'verified' },
    { label: 'Non-verified', value: 'non-verified' },
    { label: 'Blocked', value: 'blocked' },
  ]
  const roleItems = [
    { label: 'All Roles', value: 'all' },
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' },
  ]

  // combine user and userProgress
  const usersWithProgress = computed<UserWithProgress[]>(() => {
    return (users.value ?? []).map(user => {
      const userProgress = progressData.value?.find(
        progress => progress.userId === user.id
      )

      return {
        ...user,
        completedChapters: userProgress?.completedChapters ?? 0,
        totalChapters: userProgress?.totalChapters ?? 0,
        progress: userProgress?.progress ?? 0,
        completedChapterNames: userProgress?.completedChapterNames ?? [],
      }
    })
  })

  type UserStatus = 'verified' | 'non-verified' | 'blocked'
  function getUserStatus(user: User): UserStatus {
    if (user.blocked) return 'blocked'
    return user.emailVerified ? 'verified' : 'non-verified'
  }

  const stats = computed(() => {
    const list = users.value ?? []
    return [
      { label: 'Total Users', value: list.length, icon: 'i-heroicons-users-20-solid', text: 'text-rose-600', bg: 'bg-rose-100' },
      { label: 'Admins', value: list.filter(u => u.admin).length, icon: 'i-heroicons-user-group-20-solid', text: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Verified', value: list.filter(u => getUserStatus(u) === 'verified').length, icon: 'i-heroicons-user-circle-20-solid', text: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Non-verified', value: list.filter(u => getUserStatus(u) === 'non-verified').length, icon: 'i-heroicons-clock-20-solid', text: 'text-amber-600', bg: 'bg-amber-100' },
      { label: 'Blocked', value: list.filter(u => getUserStatus(u) === 'blocked').length, icon: 'i-heroicons-no-symbol-20-solid', text: 'text-red-600', bg: 'bg-red-100' },
    ]
  })

  const filteredUsers = computed(() => {
    const q = search.value.trim().toLowerCase()
    return (usersWithProgress.value ?? []).filter(user => {
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)
      const matchesStatus = statusFilter.value === 'all' || getUserStatus(user) === statusFilter.value
      const matchesRole = roleFilter.value === 'all' || (roleFilter.value === 'admin' ? user.admin : !user.admin)
      const matchesPrayer = prayerFilter.value === 'all' || (prayerFilter.value === 'yes' ? user.hasPrayerRequest : !user.hasPrayerRequest)
      return matchesSearch && matchesStatus && matchesRole && matchesPrayer
    })
  })

  async function loadPrayerRequest(userId: string) {
    if (prayerLoading.value.includes(userId)) return
    prayerLoading.value.push(userId)
    prayerErrors.value = prayerErrors.value.filter(id => id !== userId)
    try {
      prayerRequests.value[userId] = await $fetch<PrayerRequestData[]>(
        `/api/prayer-requests/${encodeURIComponent(userId)}`
      )
    } catch {
      prayerErrors.value.push(userId)
    } finally {
      prayerLoading.value = prayerLoading.value.filter(id => id !== userId)
    }
  }

  async function handleExpand(
    user: UserWithProgress,
    row: Row<UserWithProgress>
  ) {
    const willExpand = !row.getIsExpanded()

    row.toggleExpanded()

    if (willExpand && user.hasPrayerRequest && !(user.id in prayerRequests.value)) { 
      await loadPrayerRequest(user.id) 
    }
  }

  function formatPhoneNumber(phone: string | null): string {
    if (!phone) return 'Not provided'
    const digits = phone.replace(/\D/g, '')
    const normalized =
      digits.length === 11 && digits.startsWith('1')
        ? digits.slice(1) : digits

    if (normalized.length !== 10) return phone
    return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`
  }
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col justify-between">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="border-l-4 border-[#c8294f] pl-3 text-2xl font-bold">Admin Dashboard</h1>
        <UButton icon="i-heroicons-plus-20-solid" label="Add User" class="bg-[#C8294F] hover:bg-[#a82142]" />
      </div>

      <!-- Stats cards -->
      <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <UCard v-for="s in stats" :key="s.label">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500">{{ s.label }}</p>
              <p class="text-3xl font-bold" :class="s.text">{{ s.value }}</p>
            </div>
            <div class="flex h-10 w-10 items-center justify-center rounded-full" :class="s.bg">
              <UIcon :name="s.icon" class="h-5 w-5" :class="s.text"/>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Filters -->
       <UCard class="mb-6 border-[#e5e5e5]">
        <div class="flex flex-col gap-3 md:flex-row">
          <UInput
            v-model="search"
            placeholder="Search by name, email, or chapter"
            icon="i-heroicons-magnifying-glass-20-solid"
            class="flex-1 border-[#f3f3f5]"
          />
          <USelect
            v-model="statusFilter"
            :items="statusItems"
            placeholder="Filter by status"
            class="w-44"
          />
          <USelect
            v-model="roleFilter"
            :items="roleItems"
            placeholder="Filter by role"
            class="w-36"
          />
        </div>
       </UCard>
    </div>

    <UCard class="w-full border-t-4 border-t-[#C8294F]" :ui="{body: '!p-0'}">
      <div v-if="pending" class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex items-center justify-between py-2">
          <div class="flex w-full items-center gap-3">
            <USkeleton class="h-10 w-10 rounded-full" />
            <div class="w-full max-w-50 space-y-2">
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-3 w-2/3" />
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="error">
        <UAlert
          icon="i-heroicons-exclamation-triangle-20-solid"
          color="error"
          variant="subtle"
          title="Error loading users"
          :description="error.message"
        />
      </div>

      <div v-else class="overflow-x-auto">
        <UTable
          v-model:expanded="expanded"
          sticky
          :data="filteredUsers"
          :columns="columns"
          :get-row-id="row => row.id"
          :get-expanded-row-model="getExpandedRowModel()"
          class="w-full"
        >
          <!-- User name -->
          <template #name-cell="{ row }">
            <span class="font-medium text-gray-900">
              {{ row.original.name }}
            </span>
          </template>

          <!-- Email -->
          <template #email-cell="{ row }">
            <span class="text-gray-500">
              {{ row.original.email }}
            </span>
          </template>

          <!-- Role -->
          <template #admin-cell="{ row }">
            <UBadge
              color="neutral"
              variant="subtle"
              size="md"
              :class="row.original.admin
                ? 'bg-purple-100! text-purple-700!'
                : ''"
            >
              {{ row.original.admin ? 'Admin' : 'User' }}
            </UBadge>
          </template>

          <!-- Status -->
          <template #status-cell="{ row }">
            <UBadge
              :color="getUserStatus(row.original) === 'blocked'
                ? 'error'
                : getUserStatus(row.original) === 'verified'
                  ? 'success'
                  : 'warning'"
              variant="subtle"
              size="md"
            >
              {{ getUserStatus(row.original) }}
            </UBadge>
          </template>

          <!-- Prayer Request (Shows count if loaded/available) -->
          <template #hasPrayerRequest-cell="{ row }">
            <UBadge
              :color="row.original.hasPrayerRequest ? 'secondary' : 'neutral'"
              variant="soft"
              size="md"
            >
              {{
                (prayerRequests[row.original.id]?.length ?? 0) > 0
                  ? `${prayerRequests[row.original.id]?.length ?? 0} Request(s)`
                  : row.original.prayerRequestCount
                    ? `${row.original.prayerRequestCount} Request(s)`
                    : row.original.hasPrayerRequest
                      ? 'Has request': 'N/A'
              }}
            </UBadge>
          </template>

          <!-- Progress -->
          <template #progress-cell="{ row }">
            <div class="flex items-center gap-3">
              <UProgress
                :model-value="row.original.progress"
                :max="100"
                class="w-20"
              />
              <span class="text-sm text-brand-500">
                {{ row.original.progress }}%
              </span>
            </div>
          </template>

          <!-- Expand button -->
          <template #expand-cell="{ row }">
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              :trailing-icon="row.getIsExpanded()
                ? 'i-heroicons-chevron-up'
                : 'i-heroicons-chevron-down'"
              @click="handleExpand(row.original, row)"
            >
              Details
            </UButton>
          </template>

          <template #edit-cell>
            <UButton
              trailing-icon="i-heroicons-ellipsis-vertical"
              color="neutral"
              variant="ghost"
              size="md"
              aria-label="Edit user"
            >Edit</UButton>
          </template>

          <!-- Expanded cell content with smooth transition wrapper -->
          <template #expanded="{ row }">
            <div class="transition-all duration-300 ease-in-out p-5">
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">

                <!-- Account information -->
                <UCard variant="subtle">
                  <div class="space-y-3">
                    <h3 class="font-semibold">Account Information</h3>
                    <div>
                      <p class="text-sm text-gray-700">Phone Number</p>
                      <p class="font-medium">
                        {{ formatPhoneNumber(row.original.phoneNumber) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Account Created</p>
                      <p class="font-medium">
                        {{ new Date(row.original.createdAt).toLocaleDateString() }}
                      </p>
                    </div>
                  </div>
                </UCard>

                <!-- Completed chapters (Fixed to reliably show list) -->
                <UCard variant="subtle">
                  <div class="space-y-3">
                    <h3 class="font-semibold">Completed Chapters</h3>
                    <ul 
                      v-if="row.original.completedChapterNames && row.original.completedChapterNames.length > 0" 
                      class="list-disc list-inside space-y-1 text-sm text-gray-700"
                    >
                      <li v-for="(chapterName, index) in row.original.completedChapterNames" :key="index">
                        {{ chapterName }}
                      </li>
                    </ul>
                    <div v-else class="text-sm text-gray-500">
                      No chapters completed yet.
                    </div>
                  </div>
                </UCard>

                <!-- Prayer requests -->
                <UCard variant="subtle" class="lg:col-span-2">
                  <div class="space-y-3">
                    <h3 class="font-semibold">Prayer Requests</h3>

                    <p v-if="prayerLoading.includes(row.original.id)">
                      Loading prayer requests...
                    </p>

                    <UAlert
                      v-else-if="prayerErrors.includes(row.original.id)"
                      color="error"
                      variant="subtle"
                      title="Could not load prayer requests"
                    />

                    <div
                      v-else-if="prayerRequests[row.original.id]?.length"
                      class="space-y-3"
                    >
                      <div
                        v-for="request in prayerRequests[row.original.id]"
                        :key="request.id"
                        class="rounded-lg border border-default p-4"
                      >
                        <p class="whitespace-pre-wrap">
                          {{ request.request }}
                        </p>
                        <p class="mt-2 text-xs text-gray-500">
                          Submitted:
                          {{ new Date(request.submittedAt).toLocaleDateString() }}
                        </p>
                      </div>
                    </div>

                    <p v-else class="text-sm text-gray-500">
                      No prayer requests.
                    </p>
                  </div>
                </UCard>

              </div>
            </div>
          </template>
        </UTable>
      </div>

    </UCard>
  </UContainer>
</template>