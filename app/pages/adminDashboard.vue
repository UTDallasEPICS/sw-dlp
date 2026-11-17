<script setup lang="ts">
  //import { authClient } from '../utils/auth-client'

  interface User {
    id: string
    email: string
    name: string
    emailVerified: boolean
    image: boolean
    role: 'admin' | 'user'
    chapter: number | null 
    progress: number | null 
    blocked: boolean | null
  }

  const { data: users, pending, error } = await useFetch<User[]>('/api/users')

  const search = ref('')
  const statusFilter = ref('all')
  const roleFilter = ref('all')

  const statusItems = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Verified', value: 'verified' },
    { label: 'Non-verified', value: 'non-verified' }
  ]

  const roleItems = [
    { label: 'All Roles', value: 'all' },
    { label: 'Admin', value: 'admin' },
    { label: 'User', value: 'user' }
  ]

  const stats = computed(() => {
    const list = users.value ?? []
    return [
      { label: 'Total Users', value: list.length, icon: 'i-heroicons-users-20-solid', text: 'text-rose-600', bg: 'bg-rose-100' },
      { label: 'Verified', value: list.filter((user) => user.emailVerified).length, icon: 'i-heroicons-user-circle-20-solid',  text: 'text-green-600', bg: 'bg-green-100' },
      { label: 'Non-verified', value: list.filter((user) => !user.emailVerified).length, icon: 'i-heroicons-clock-20-solid', text: 'text-amber-600', bg: 'bg-amber-100' },
      { label: 'Admins', value: list.filter((user) => user.role === 'admin').length, icon: 'i-heroicons-user-group-20-solid', text: 'text-purple-600', bg: 'bg-purple-100' }
    ]
  })

  const filteredUsers = computed(() => {
    const q = search.value.toLowerCase()
    return (users.value ?? []).filter((user) => {
      const matchesSearch = !q || 
      user.name.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q) ||
      (user.chapter != null && `chapter ${user.chapter}`.includes(q))
      const matchesStatus = 
        statusFilter.value === 'all' || 
        (statusFilter.value === 'verified') === user.emailVerified
      const matchesRole = roleFilter.value === 'all' || roleFilter.value === user.role
      return matchesSearch && matchesStatus && matchesRole
    }) 
  })
/*
  const selectedFile = ref<File | null>(null)
  const imagePreview = ref<string>('')

  const isUploading = ref(false)
  const isModalOpen = ref(false)

  async function logout() {
    await authClient.signOut()
    await navigateTo('/auth', { external: true })
  }

  function getImageLink(user: User) {
    return user.image ? 'api/users/' + user.id + '/profile' : undefined
  }

  function handleImageUpload(event: Event) {
    const target = event.target as HTMLInputElement
    const files = target.files as FileList

    if (!files || files.length === 0) return

    const file = files[0]

    if (!file?.type.startsWith('image/')) {
      return
    }

    selectedFile.value = file

    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const openModal = () => {
    isModalOpen.value = true
  }

  const closeModal = () => {
    isModalOpen.value = false
  }

  async function updatePfp() {
    if (!selectedFile.value) return

    isUploading.value = true

    try {
      const formData = new FormData()
      formData.append('file', selectedFile.value)

      await $fetch('/api/users/upload', {
        method: 'POST',
        body: formData,
      })

      // Refresh users data to show updated profile picture
      await refreshNuxtData()

      // Reset state
      selectedFile.value = null
      imagePreview.value = ''
      isModalOpen.value = false
    } catch (error) {
      console.error('Upload failed:', error)
    } finally {
      isUploading.value = false
    }
  }*/
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
      
      <!--
      <div class="flex justify-between gap-4 md:items-center">
        <UModal :open="isModalOpen">
          <UButton
            color="success"
            variant="soft"
            @click="openModal"
            icon="i-heroicons-arrow-up-on-square-20-solid"
            label="Update Profile Picture"
          />

          <template #content>
            <div class="m-12 space-y-4">
              <h3 class="text-lg font-medium text-gray-900 dark:text-white">
                Update Prof
              </h3>

              <div v-if="imagePreview" class="flex justify-center">
                <UAvatar :src="imagePreview" size="3xl" />
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  class="file:bg-primary-50 file:text-brand4 hover:file:bg-primary-100 block w-full cursor-pointer text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:text-sm file:font-semibold"
                  @change="handleImageUpload"
                />
              </div>

              <div class="flex justify-end gap-2">
                <UButton variant="soft" @click="closeModal"> Cancel </UButton>
                <UButton
                  color="success"
                  :loading="isUploading"
                  :disabled="!selectedFile"
                  @click="updatePfp"
                >
                  Upload
                </UButton>
              </div>
            </div>
          </template>
        </UModal>
        <UButton
          color="error"
          variant="soft"
          icon="i-heroicons-arrow-right-on-rectangle-20-solid"
          label="Logout"
          @click="logout"
        />
      </div> 
      -->
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
          <thead class="bg-[#e0004d]/[0.03] text-gray-700">
            <tr>
              <th class="px-4 py-3 font-semibold">User</th>
              <th class="px-4 py-3 font-semibold">Email</th>
              <th class="px-4 py-3 font-semibold">Role</th>
              <th class="px-4 py-3 font-semibold">Status</th>
              <th class="px-4 py-3 font-semibold">Blocked</th>
              <th class="px-4 py-3 font-semibold">Chapter</th>
              <th class="px-4 py-3 font-semibold">Progress</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-for="user in filteredUsers" :key="user.id">
              <td class="px-4 py-2.5 font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
              <td class="px-4 py-2.5 text-gray-500">{{ user.email }}</td>
              <td class="px-4 py-2.5">
                <UBadge
                  :color="user.role === 'admin' ? 'secondary' : 'error'"
                  variant="subtle"
                  size="sm"
                >{{ user.role }}</UBadge>
              </td>
              <td class="px-4 py-2.5">
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="user.emailVerified ? 'success' : 'warning'"
                    variant="subtle"
                    size="sm"
                  >
                    {{ user.emailVerified ? 'verified' : 'non-verified' }}
                  </UBadge>
                  <UButton icon="i-heroicons-cog-6-tooth-20-solid" color="neutral" variant="ghost" size="xs"/>
                </div>
              </td>
              <td class="px-4 py-2.5">
                <UBadge
                 :color="user.blocked ? 'error' : 'neutral'"
                 variant="subtle"
                 size="sm">{{ user.blocked ? 'blocked' : 'not blocked' }}</UBadge>
              </td>
              <td class="px-4 py-2.5 font-medium text-[#c8294f]">
                {{ user.chapter != null ? `Chapter ${user.chapter}` : '-' }}
              </td>
              <td class="px-4 py-2.5">
                <div v-if="user.progress != null" class="flex items-center gap-3">
                  <div class="h-2 w-40 rounded-full bg-gray-200">
                    <div class="h-2 rounded-full bg-[#c8294f]" :style="{ width: user.progress + '%'}" />
                  </div>
                  <span class="text-sm font-semibold text-[#c8294f]">{{ user.progress }}%</span>
                </div>
                <span v-else class="text-gray-400">-</span>
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
