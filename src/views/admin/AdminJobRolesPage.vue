<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useReviewsStore } from '@/stores/reviews'
import { useSkillsStore } from '@/stores/skills'
import type { JobRole } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import { PlusIcon } from '@heroicons/vue/24/outline'

const reviewsStore = useReviewsStore()
const skillsStore = useSkillsStore()

const loading = ref(true)
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

const skillOptions = computed(() => skillsStore.skills.map((s) => ({ value: s.id, label: s.name })))

// ---- create / edit modal (shared form) ----
const modalOpen = ref(false)
const editingRole = ref<JobRole | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  name: '',
  description: '',
  isActive: true,
  skillIds: [] as number[],
  required: {} as Record<number, boolean>
})

function openCreate() {
  editingRole.value = null
  form.name = ''
  form.description = ''
  form.isActive = true
  form.skillIds = []
  form.required = {}
  formError.value = ''
  modalOpen.value = true
}

function openEdit(role: JobRole) {
  editingRole.value = role
  form.name = role.name
  form.description = role.description || ''
  form.isActive = role.is_active
  form.skillIds = (role.skills || []).map((s) => s.skill_id)
  form.required = {}
  for (const s of role.skills || []) form.required[s.skill_id] = s.required
  formError.value = ''
  modalOpen.value = true
}

async function save() {
  formError.value = ''
  if (!form.name.trim()) {
    formError.value = 'Give the role a name.'
    return
  }
  if (!form.skillIds.length) {
    formError.value = 'A role needs at least one skill in its recipe.'
    return
  }
  saving.value = true
  try {
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      skills: form.skillIds.map((id) => ({ skill_id: id, required: form.required[id] ?? true }))
    }
    const result = editingRole.value
      ? await reviewsStore.updateJobRole(editingRole.value.id, { ...payload, is_active: form.isActive })
      : await reviewsStore.createJobRole(payload)
    if (!result.success) {
      formError.value = result.error || 'Failed to save job role'
      return
    }
    modalOpen.value = false
    flash(editingRole.value ? 'Job role updated' : 'Job role created')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([reviewsStore.fetchJobRoles(), skillsStore.fetchSkills()])
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-start justify-between gap-4 mb-8">
        <div>
          <p class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-2">Earned, not self-assigned</p>
          <h1 class="text-4xl font-black text-gray-900 leading-[1.3]">Job Roles</h1>
          <p class="text-gray-500 mt-2 max-w-md">Admin-curated titles, each a recipe of required skills. A member is verified as a role once they're verified in every required skill.</p>
        </div>
        <BaseButton class="shrink-0" @click="openCreate"><PlusIcon class="h-4 w-4 mr-1.5" /> New role</BaseButton>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!reviewsStore.jobRoles.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p class="text-sm text-gray-500">No job roles yet.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="role in reviewsStore.jobRoles" :key="role.id" class="border border-gray-200 rounded-xl p-5 flex flex-col">
          <div class="flex items-start justify-between gap-2 mb-2">
            <p class="font-semibold text-gray-900">{{ role.name }}</p>
            <button class="text-xs font-medium text-gray-400 hover:text-gray-700 shrink-0" @click="openEdit(role)">Edit</button>
          </div>
          <p v-if="role.description" class="text-sm text-gray-500 mb-4 flex-1">{{ role.description }}</p>
          <p v-else class="flex-1"></p>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <span
              v-for="s in role.skills"
              :key="s.skill_id"
              class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
              :class="s.required ? 'bg-senpai-50 text-senpai-700' : 'bg-gray-100 text-gray-600'"
            >
              {{ s.skill_name }}<span v-if="!s.required" class="ml-1 text-gray-400">(bonus)</span>
            </span>
          </div>
          <span v-if="!role.is_active" class="text-[11px] font-mono text-gray-400 uppercase">Inactive</span>
        </div>
      </div>
    </div>

    <BaseModal :show="modalOpen" :title="editingRole ? 'Edit job role' : 'New job role'" @close="modalOpen = false">
      <div class="space-y-4">
        <BaseAlert v-if="formError" type="error">{{ formError }}</BaseAlert>
        <BaseInput v-model="form.name" label="Name" placeholder="Systems Architect" required />
        <BaseTextarea v-model="form.description" label="Description (optional)" :rows="3" />
        <BaseMultiSelect v-model="form.skillIds" :options="skillOptions" label="Recipe skills" placeholder="Select skills" required />
        <div v-if="form.skillIds.length" class="space-y-2 border border-gray-200 rounded-lg p-3">
          <p class="text-xs font-medium text-gray-500 uppercase tracking-wide">Required vs. bonus</p>
          <BaseCheckbox
            v-for="id in form.skillIds"
            :key="id"
            :model-value="form.required[id] ?? true"
            :label="skillsStore.getSkillName(id)"
            description="Required skills gate role verification. Bonus skills are informative only."
            @update:model-value="(v) => (form.required[id] = v)"
          />
        </div>
        <BaseCheckbox v-if="editingRole" v-model="form.isActive" label="Active" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="modalOpen = false">Cancel</button>
        <BaseButton :loading="saving" @click="save">{{ editingRole ? 'Save' : 'Create' }}</BaseButton>
      </template>
    </BaseModal>

    <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
  </AdminLayout>
</template>
