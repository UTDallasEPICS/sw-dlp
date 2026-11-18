<script setup lang="ts">
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
  }

  interface PrayerRequestData {
    request: string
    submittedAt: string
  }

  interface UserProgress {
    userId: string
    completedChapters: number
    totalChapters: number
    progress: number
  }

  interface UserWithProgress extends User {
    completedChapters: number
    totalChapters: number
    progress: number
  }

  const { data: users, pending, error, refresh } = await useFetch<User[]>('/api/users')
  const { data: progressData } = await useFetch<UserProgress[]>('/api/users/allProgress')
  
  const search = ref('')
  const statusFilter = ref('all')
  const roleFilter = ref('all')
  const prayerFilter = ref('all')
  const expandedUsers = ref<string[]>([])
  const prayerRequests = ref<Record<string, PrayerRequestData | null>>({})
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
  const prayerItems = [
    { label: 'All Prayer Requests', value: 'all' },
    { label: 'Prayer Request', value: 'yes' },
    { label: 'No Prayer Request', value: 'no' },
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

  // if want to add progress filter change users.value to usersWithProgress.value
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
      prayerRequests.value[userId] = await $fetch<PrayerRequestData | null>(
        `/api/admin/prayer-requests/${encodeURIComponent(userId)}`
      )
    } catch {
      prayerErrors.value.push(userId)
    } finally {
      prayerLoading.value = prayerLoading.value.filter(id => id !== userId)
    }
  }

  async function toggleUser(user: User) {
    if (expandedUsers.value.includes(user.id)) {
      expandedUsers.value = expandedUsers.value.filter(id => id !== user.id)
      return
    }
    expandedUsers.value.push(user.id)
    if (user.hasPrayerRequest && !(user.id in prayerRequests.value)) {
      await loadPrayerRequest(user.id)
    }
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
        <table class="w-full text-left text-sm">
          <thead class="w-full bg-[#e0004d]/[0.03] text-gray-700">
            <tr>
              <th class="px-4 py-3 font-semibold">User</th>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Prayer Request</th>
              <th class="px-4 py-3 font-semibold">Progress</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
              <td class="px-4 py-2.5 text-gray-500">{{ user.email }}</td>
              <td class="px-4 py-2.5">
                <UBadge
                  :color="error"
                  variant="subtle"
                  size="md"
                  :class="user.admin ? '!bg-purple-100 !text-purple-700 dark:!bg-purple-900/40 dark:!text-purple-300'
                          : ''"
                >{{ user.admin ? 'Admin' : 'User' }}</UBadge>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <UBadge :color="getUserStatus(user) === 'blocked' ? 'error' : getUserStatus(user) === 'verified' ? 'success' : 'warning'" variant="subtle" size="md">
                    {{ getUserStatus(user) === 'non-verified' ? 'Non-verified' : getUserStatus(user) === 'verified' ? 'Verified' : 'Blocked' }}
                  </UBadge>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <UBadge :color="user.hasPrayerRequest ? 'secondary' : 'neutral'" variant="soft" size="md">
                    {{ user.hasPrayerRequest ? 'Has request' : 'N/A' }}
                  </UBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <UProgress
                    :model-value="user.progress"
                    :max="100"
                    class="w-20"
                  />
                  <span class="text-sm text-brand-500">
                    {{ user.progress }}%
                  </span>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <UButton color="neutral" variant="subtle" size="xs">Edit</UButton>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="6" class="py-8 text-center text-gray-500">No users found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </UCard>
  </UContainer>
</template>