<script setup lang="ts">
  interface AdminNote {
    id: string
    note: string
    createdAt: string
    updatedAt: string
  }

  const props = defineProps<{
    userId: string
    userName?: string
  }>()

  const toast = useToast()

  const historyOpen = ref(false)
  const addOpen = ref(false)

  // ---- Note History ----
  const notes = ref<AdminNote[]>([])
  const notesLoading = ref(false)
  const notesError = ref(false)

  async function loadNotes() {
    notesLoading.value = true
    notesError.value = false
    try {
      notes.value = await $fetch<AdminNote[]>(`/api/notes/user/${encodeURIComponent(props.userId)}`)
    } catch {
      notesError.value = true
    } finally {
      notesLoading.value = false
    }
  }

  // Load fresh notes every time the history opens; drop any half-finished edit when it closes
  watch(historyOpen, (open) => {
    if (open) {
      loadNotes()
    } else {
      cancelEdit()
    }
  })

  // ---- Add ----
  const newNote = ref('')
  const saving = ref(false)
  const addError = ref('')

  async function addNote() {
    const text = newNote.value.trim()
    if (!text || saving.value) return

    saving.value = true
    addError.value = ''
    try {
      await $fetch('/api/notes', {
        method: 'POST',
        body: { userId: props.userId, note: text },
      })
      newNote.value = ''
      addOpen.value = false
      toast.add({ title: 'Note saved', color: 'success' })
    } catch {
      addError.value = 'Could not save the note. Please try again.'
    } finally {
      saving.value = false
    }
  }

  // ---- Edit ----
  const editingId = ref<string | null>(null)
  const editText = ref('')
  const editError = ref('')
  const savingEdit = ref(false)

  function startEdit(note: AdminNote) {
    editingId.value = note.id
    editText.value = note.note
    editError.value = ''
  }

  function cancelEdit() {
    editingId.value = null
    editText.value = ''
    editError.value = ''
  }

  async function saveEdit(note: AdminNote) {
    const text = editText.value.trim()
    if (!text || savingEdit.value) return

    savingEdit.value = true
    editError.value = ''
    try {
      const updated = await $fetch<AdminNote>(`/api/notes/${encodeURIComponent(note.id)}`, {
        method: 'PATCH',
        body: { note: text },
      })
      const index = notes.value.findIndex((n) => n.id === note.id)
      if (index !== -1) notes.value[index] = updated
      cancelEdit()
    } catch {
      editError.value = 'Could not save your changes. Please try again.'
    } finally {
      savingEdit.value = false
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
  }

  const historyTitle = computed(() =>
    props.userName ? `Notes history: ${props.userName}` : 'Notes history'
  )
</script>

<template>
  <div class="mt-4 lg:col-span-2">
    <UCard variant="subtle">
      <div class="space-y-3">
        <div>
          <h3 class="font-semibold text-gray-900">Notes</h3>
          <p class="text-sm text-gray-900">Only admins can see these notes.</p>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3">
          <UButton
            color="neutral"
            variant="outline"
            icon="i-lucide-history"
            label="View Notes History"
            @click="historyOpen = true"
          />
          <UButton
            icon="i-lucide-plus"
            label="Add Notes"
            class="bg-[#C8294F] hover:bg-[#a82142]"
            @click="addOpen = true"
          />
        </div>
      </div>
    </UCard>

    <!-- Notes history: big, scrollable, notes can be edited -->
    <UModal
      v-model:open="historyOpen"
      scrollable
      :title="historyTitle"
      description="Newest notes first. Select Edit to change a note."
      :ui="{ content: 'max-w-3xl', footer: 'justify-end' }"
    >
      <template #body>
        <p v-if="notesLoading" class="text-sm text-gray-500">Loading notes…</p>

        <UAlert
          v-else-if="notesError"
          color="error"
          variant="subtle"
          title="Could not load notes"
        />

        <p v-else-if="notes.length === 0" class="text-sm text-gray-500">No notes yet.</p>

        <div v-else class="space-y-3">
          <div v-for="n in notes" :key="n.id" class="border-default rounded-lg border p-4">
            <!-- Editing -->
            <template v-if="editingId === n.id">
              <UTextarea v-model="editText" :rows="4" autoresize class="w-full" />
              <p v-if="editError" class="mt-2 text-sm text-red-600">{{ editError }}</p>
              <div class="mt-3 flex justify-end gap-2">
                <UButton color="neutral" variant="outline" label="Cancel" @click="cancelEdit" />
                <UButton
                  label="Save"
                  :loading="savingEdit"
                  :disabled="!editText.trim()"
                  @click="saveEdit(n)"
                />
              </div>
            </template>

            <!-- Reading -->
            <template v-else>
              <p class="whitespace-pre-wrap">{{ n.note }}</p>
              <div class="mt-3 flex items-center justify-between gap-3">
                <p class="text-xs text-gray-500">
                  {{ formatDate(n.createdAt) }}
                  <span v-if="n.updatedAt !== n.createdAt">
                    · edited {{ formatDate(n.updatedAt) }}
                  </span>
                </p>
                <UButton
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  icon="i-lucide-pencil"
                  label="Edit"
                  @click="startEdit(n)"
                />
              </div>
            </template>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Add note -->
    <UModal
      v-model:open="addOpen"
      title="Add note"
      :description="`Private note${userName ? ` about ${userName}` : ''}. Only admins can see it.`"
      :ui="{ footer: 'justify-end' }"
    >
      <template #body>
        <UTextarea
          v-model="newNote"
          :rows="5"
          autoresize
          placeholder="Write your note here…"
          class="w-full"
        />
        <p v-if="addError" class="mt-2 text-sm text-red-600">{{ addError }}</p>
      </template>

      <template #footer>
        <UButton color="neutral" variant="outline" label="Cancel" @click="addOpen = false" />
        <UButton
          label="Save note"
          class="bg-[#C8294F] hover:bg-[#a82142]"
          :loading="saving"
          :disabled="!newNote.trim()"
          @click="addNote"
        />
      </template>
    </UModal>
  </div>
</template>