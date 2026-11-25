<script setup lang="ts">
  import type { TableColumn, } from '@nuxt/ui'
  import type {FormError, DropdownMenuItem} from '@nuxt/ui'
  import type { Row } from '@tanstack/vue-table'
  import { getExpandedRowModel, } from '@tanstack/vue-table'

  definePageMeta({ middleware: 'admin', colorMode: 'light'})

  const columns: TableColumn<UserWithProgress>[] = [
    { accessorKey: 'name', header: 'User', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { accessorKey: 'email', header: 'Email', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { accessorKey: 'admin', header: 'Role', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { id: 'status', header: 'Status', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { accessorKey: 'hasPrayerRequest', header: 'Prayer Request', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { accessorKey: 'progress', header: 'Progress', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { id: 'expand', header: '',  meta: { class: { th: 'bg-brand-500/5', td: ''} }},
    { id: 'edit', header: '', meta: { class: { th: 'bg-brand-500/5', td: ''} }},
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
    updatedAt: string
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
  const expanded = ref<Record<string, boolean>>({})
  const closingRows = ref<string[]>([])

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

  const toast = useToast()

  const roleChoices = roleItems.filter(i => i.value !== 'all')
  const statusChoices = statusItems.filter(i => i.value !== 'all')

  const updatingUsers = ref<string[]>([])

  async function updateUser(
    id: string,
    change: {
      role?: 'admin' | 'user'
      status?: UserStatus
    }
  ) {
    const target = (users.value ?? []).find(u => u.id === id)
    if (!target) return

    // Prevent duplicate requests for the same user
    if (updatingUsers.value.includes(id)) return

    updatingUsers.value.push(id)

    try {
      await $fetch(`/api/users/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: change,
      })

      // Get the updated user data from the database
      await refresh()

      toast.add({
        title: change.role ? 'Role updated' : 'Status updated',
        description: `${target.name} is now ${change.role ?? change.status}.`,
        icon: 'i-lucide-check-circle',
        color: 'success',
      })
    } catch (error: any) {
      toast.add({
        title: 'Update failed',
        description:
          error.data?.statusMessage ??
          error.statusMessage ??
          'Could not update the user.',
        icon: 'i-lucide-circle-alert',
        color: 'error',
      })
    } finally {
      updatingUsers.value = updatingUsers.value.filter(
        userId => userId !== id
      )
    }
  }

  function getRowItems(user: User): DropdownMenuItem[][] {
    const currentRole = user.admin ? 'admin' : 'user'
    const currentStatus = getUserStatus(user)
    const isUpdating = updatingUsers.value.includes(user.id)

    return [
      [{ type: 'label', label: 'Edit user' }],
      [
        {
          label: 'Role',
          icon: 'i-lucide-shield',
          children: roleChoices.map(o => ({
            label: o.label,
            type: 'checkbox' as const,
            checked: currentRole === o.value,
            disabled: isUpdating,
            onSelect: () => updateUser(user.id, {
              role: o.value as 'admin' | 'user',
            }),
          })),
        },
        {
          label: 'Status',
          icon: 'i-lucide-circle-dot',
          children: statusChoices.map(o => ({
            label: o.label,
            type: 'checkbox' as const,
            checked: currentStatus === o.value,
            disabled: isUpdating,
            onSelect: () => updateUser(user.id, {
              status: o.value as UserStatus,
            }),
          })),
        },
      ],
    ]
  }

  // adding User modal for "Add User" button
  const addOpen = ref(false)

  const form = reactive({
    name: '',
    email: '',
    phoneNumber: '',
    role: undefined as 'admin' | 'user' | undefined,
    status: undefined as UserStatus | undefined
  })

  const roleOptions = roleItems.filter(i => i.value !== 'all')
  const statusOptions = statusItems.filter(i => i.value !== 'all')

  function validate(state: typeof form): FormError[] {
    const errors: FormError[] = []
    if (!state.name.trim()) errors.push({name: 'name', message: 'Name is required'})

    if (!/^\S+@\S+\.\S+$/.test(state.email.trim())) {
      errors.push({ name: 'email', message: 'Enter a valid email' })
    } else if ((users.value ?? []).some(u => u.email.toLowerCase() === state.email.trim().toLowerCase())) {
      errors.push({ name: 'email', message: 'A user with this email already exists' })
    }

    if (state.phoneNumber.replace(/\D/g, '').length < 10) {
      errors.push({ name: 'phoneNumber', message: 'Enter a 10-digit phone number' })
    }
    if (!state.role) errors.push({ name: 'role', message: 'Select a role' })
    if (!state.status) errors.push({ name: 'status', message: 'Select a status' })
    return errors
  }

  function resetForm() {
    Object.assign(form, { name: '', email: '', phoneNumber: '', role: undefined, status: undefined })
  }

  // Clears the form whenever the modal closes (Cancel, X, or after submit)
  watch(addOpen, open => { if (!open) resetForm() })

  const addingUser = ref(false)

async function addUser() {
  if (addingUser.value) return

  addingUser.value = true

  try {
    await $fetch('/api/users/insert', {
      method: 'POST',
      body: {
        name: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        role: form.role,
        status: form.status,
      },
    })

    // Reload users from the database
    await refresh()

    // Close modal after successful creation
    addOpen.value = false

    toast.add({
      title: 'User created',
      description: 'The user was successfully added to the database.',
      color: 'success',
    })
  } catch (error: any) {
    toast.add({
      title: 'Could not create user',
      description:
        error.data?.statusMessage ??
        error.statusMessage ??
        'An unexpected error occurred.',
      color: 'error',
    })
  } finally {
    addingUser.value = false
  }
}


  const stats = computed(() => {
    const list = users.value ?? []
    return [
      { label: 'Total Users', value: list.length, icon: 'i-heroicons-users-20-solid', text: 'text-pink-600', bg: 'bg-pink-100' },
      { label: 'Admins', value: list.filter(u => u.admin).length, icon: 'i-heroicons-user-group-20-solid', text: 'text-purple-600', bg: 'bg-purple-100' },
      { label: 'Verified', value: list.filter(u => getUserStatus(u) === 'verified').length, icon: 'i-heroicons-user-circle-20-solid', text: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Non-verified', value: list.filter(u => getUserStatus(u) === 'non-verified').length, icon: 'i-heroicons-clock-20-solid', text: 'text-amber-600', bg: 'bg-amber-100' },
      { label: 'Blocked', value: list.filter(u => getUserStatus(u) === 'blocked').length, icon: 'i-heroicons-no-symbol-20-solid', text: 'text-red-600', bg: 'bg-red-100' },
    ]
  })

  const filteredUsers = computed(() => {
    const q = search.value.trim().toLowerCase()
    const looksLikePhone = /^[\d\s()+-]+$/.test(q)
    const phoneQuery = looksLikePhone ? formatPhoneNumber(q) : ''

    return (usersWithProgress.value ?? []).filter(user => {
      const matchesSearch = !q || user.name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q) || (phoneQuery !== '' && formatPhoneNumber(user.phoneNumber).includes(phoneQuery)) //|| user.completedChapterNames.some(c => c.toLowerCase().includes(q))
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

  async function handleExpand( user: UserWithProgress, row: Row<UserWithProgress> ) {
    const userId = user.id

    if (closingRows.value.includes(userId)) return

    // closing transition
    if (row.getIsExpanded()) {
      closingRows.value.push(userId)
      return
    }
    // Open expanded row
    row.toggleExpanded(true)

    if ( user.hasPrayerRequest && !(userId in prayerRequests.value) ) {
      await loadPrayerRequest(userId)
    }
  }

  function finishCollapse(row: Row<UserWithProgress>) {
    row.toggleExpanded(false)

    closingRows.value = closingRows.value.filter(
      id => id !== row.original.id
    )
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

  function formatDateTime(dateInput: string | Date | null | undefined): string {
    if (!dateInput) return 'N/A'
    const date = new Date(dateInput)
    if (Number.isNaN(date.getTime())) return 'N/A'

    return date.toLocaleString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  function canManagePrivateFieldsFor(rowUser: { admin: boolean }) {
    return rowUser.admin === false
  }
</script>

<template>
  <UContainer class="py-10">
    <div class="flex flex-col justify-between">
      <div class="mb-8 flex items-center justify-between">
        <h1 class="border-l-4 border-[#c8294f] pl-3 text-2xl font-bold">Admin Dashboard</h1>
        <UButton 
          icon="i-heroicons-plus-20-solid" 
          label="Add User" 
          class="bg-[#C8294F] hover:bg-[#a82142]" 
          @click="addOpen = true"
          />
      </div>

      <!-- Stats cards -->
      <div class="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-6">
        <UCard 
          v-for="(s, i) in stats" 
          :key="s.label"
          :class="i < 2 ? 'lg:col-span-3' : 'lg:col-span-2'"
        >
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
            placeholder="Search by name, email, or phone number"
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
              :color="(row.original.hasPrayerRequest && !row.original.admin) ? 'secondary' : 'neutral'"
              variant="soft"
              size="md"
            >
              {{
                row.original.admin? 'N/A' : (prayerRequests[row.original.id]?.length ?? 0) > 1 ? `${prayerRequests[row.original.id]?.length ?? 0} Requests`
                  : row.original.prayerRequestCount === 1 ? `1 Request` : 'None'
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
                ? 'i-heroicons-chevron-down'
                : 'i-heroicons-chevron-up'"
              @click="handleExpand(row.original, row)"
            >
              Details
            </UButton>
          </template>

          <template #edit-cell="{row}">
            <UDropdownMenu
              :items="getRowItems(row.original)"
              :content="{align: 'end'}"
              :ui="{ content: 'w-48'}"
            >
              <UButton
                trailing-icon="i-heroicons-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                size="md"
                aria-label="Edit user"
              >Edit</UButton>
            </UDropdownMenu>
          </template>

          <!-- Expanded cell content with smooth transition wrapper -->
          <template #expanded="{ row }" class="flex flex-col">
            <Transition
              appear
              enter-active-class="transition-all duration-100 ease-out"
              enter-from-class="opacity-0 -translate-y-3"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition-all duration-100 ease-in"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 -translate-y-3"
              @after-leave="finishCollapse(row)"
            >
              <div v-if="!closingRows.includes(row.original.id)" class="flex-row p-2">
                <div class="w-full flex flex-row gap-10">
                  <!-- Phone number -->
                  <div class="flex flex-1 items-center gap-4 rounded-lg bg-neutral-100 outline-1 outline-neutral-200 p-4">
                    <UIcon
                      name="i-heroicons-phone"
                      class="size-6 shrink-0 text-brand-500"
                    />
                    <div class="flex flex-col gap-1">
                      <span class="text-xs text-gray-500">
                        Phone Number
                      </span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ formatPhoneNumber(row.original.phoneNumber) }}
                      </span>
                    </div>
                  </div>

                  <!-- Account creation date -->
                  <div class="flex flex-1 items-center gap-4 rounded-lg bg-neutral-100 outline-1 outline-neutral-200 p-4">
                    <UIcon
                      name="i-heroicons-calendar"
                      class="size-6 shrink-0 text-brand-500"
                    />
                    <div class="flex flex-col gap-1">
                      <span class="text-xs text-gray-500">
                        Created Account
                      </span>

                      <span class="text-sm font-medium text-gray-900">
                        {{ formatDateTime(row.original.createdAt) }}
                      </span>
                    </div>
                  </div>

                  <!-- User last updated-->
                  <div class="flex flex-1 items-center gap-4 rounded-lg bg-neutral-100 outline-1 outline-neutral-200 p-4">
                      <UIcon
                        name="i-heroicons-calendar-days"
                        class="size-6 shrink-0 text-brand-500"
                      />
                      <div class="flex flex-col gap-1">
                        <span class="text-xs text-gray-500">
                          Last Updated
                        </span>

                        <span class="text-sm font-medium text-gray-900">
                          {{ formatDateTime(row.original.updatedAt) }}
                        </span>
                      </div>
                    </div>
                </div>

                <!-- Completed chapters -->
                <UCard variant="subtle" class="my-4">
                  <div class="space-y-3 text-black">
                    <h3 class="font-semibold">Completed Chapters</h3>
                    <ul 
                      v-if="row.original.completedChapterNames.length > 0" 
                      class="list-disc list-inside space-y-1 px-4 text-sm text-gray-700"
                    >
                      <li v-for="(chapterName, index) in row.original.completedChapterNames" :key="index">
                        {{ chapterName }}
                      </li>
                    </ul>
                    <div v-else class="text-sm text-gray-500 px-4">
                      No completed chapters.
                    </div>
                  </div>
                </UCard>

                <!-- Prayer requests -->
                <UCard 
                  v-if="canManagePrivateFieldsFor(row.original)"
                  variant="outline" 
                  class="lg:col-span-2">
                  <div class="space-y-3">
                    <h3 class="font-semibold text-black">Prayer Requests</h3>

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
                      class="space-y-3 bg-neutral-100"
                    >
                      <div
                        v-for="request in prayerRequests[row.original.id]"
                        :key="request.id"
                        class="rounded-lg border border-default p-4 text-black"
                      >
                        <p class="whitespace-pre-wrap">
                          {{ request.request }}
                        </p>
                        <p class="mt-2 text-xs text-gray-500">
                          Submitted:
                          {{ formatDateTime(request.submittedAt) }}
                        </p>
                      </div>
                    </div>

                    <p v-else class="text-sm text-gray-500 px-4">
                      No prayer requests.
                    </p>
                  </div>
                </UCard>

                <!-- Notes for users only (never on other admins) -->
                <AdminNotes
                  v-if="canManagePrivateFieldsFor(row.original)"
                  :user-id="row.original.id"
                  :user-name="row.original.name"
                />
              </div>
            </Transition>
          </template>
        </UTable>
      </div>
    </UCard>
    <UModal
      v-model:open="addOpen"
      title="Add User"
      description="Fill in every field to add a new user."
    >
      <template #body>
        <UForm id="add-user-form" :state="form" :validate="validate" class="space-y-4" @submit="addUser">
          <UFormField label="Name" name="name" required>
            <UInput v-model="form.name" placeholder="Full name" class="w-full" />
          </UFormField>
        
          <UFormField label="Email" name="email" required>
            <UInput v-model="form.email" type="email" placeholder="name@example.com" class="w-full" />
          </UFormField>
        
          <UFormField label="Phone Number" name="phoneNumber" required>
            <UInput v-model="form.phoneNumber" type="tel" placeholder="(555) 123-4567" class="w-full" />
          </UFormField>
        
          <UFormField label="Role" name="role" required>
            <USelect v-model="form.role" :items="roleOptions" placeholder="Select a role" class="w-full" />
          </UFormField>
        
          <UFormField label="Status" name="status" required>
            <USelect v-model="form.status" :items="statusOptions" placeholder="Select a status" class="w-full" />
          </UFormField>
        </UForm>
      </template>
    
      <template #footer>
        <div class="flex w-full justify-start gap-2">
          <UButton
            type="submit"
            form="add-user-form"
            label="Submit"
            :loading="addingUser"
            :disable="addingUser"
            class="bg-[#C8294F] hover:bg-[#a82142]"
          />
          <UButton color="neutral" variant="ghost" label="Cancel" @click="addOpen = false" />
        </div>
      </template>
    </UModal>
  </UContainer>
</template>