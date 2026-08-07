<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminEngineApi, engineApi } from '@/api'
import type { Program, Cohort, Task } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import { PlusIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

const cohorts = ref<Cohort[]>([])
const cohortName = (id?: string | null) => cohorts.value.find((c) => c.id === id)?.name

// The flat list of everything that actually exists — Induction, cohort
// series, and circle tracks alike. No fabricated placeholders for things
// that haven't been created.
const programs = ref<Program[]>([])
const taskCounts = ref<Record<string, number>>({})
async function loadPrograms() {
  const [cohortPrograms, circleTracks] = await Promise.all([
    Promise.all(cohorts.value.map((c) => adminEngineApi.listCohortPrograms(c.id))),
    engineApi.listCircleTracks()
  ])
  const fromCohorts = cohortPrograms.flatMap((r) => r.data ?? [])
  programs.value = [...fromCohorts, ...(circleTracks.data ?? [])]
  const counts: Record<string, number> = {}
  await Promise.all(
    programs.value.map(async (p) => {
      const res = await engineApi.getProgram(p.id)
      counts[p.id] = res.data?.tasks?.length ?? 0
    })
  )
  taskCounts.value = counts
}

function programMeta(p: Program): string {
  const parts: string[] = []
  parts.push(p.kind === 'induction' ? 'Induction' : 'Series')
  if (p.circle) parts.push(`${p.circle} circle`)
  else if (p.cohort_id) parts.push(cohortName(p.cohort_id) || 'cohort')
  parts.push(`${taskCounts.value[p.id] ?? 0} task${taskCounts.value[p.id] === 1 ? '' : 's'}`)
  return parts.join(' · ')
}

// ---- create a program: either for a cohort, or a global circle track ----
const createModal = ref(false)
const savingProgram = ref(false)
const createError = ref('')
const createForm = reactive({ name: '', description: '', scope: 'cohort' as 'cohort' | 'circle', cohortId: '', circle: 'content' })
function openCreateModal() {
  createForm.name = ''
  createForm.description = ''
  createForm.scope = 'cohort'
  createForm.cohortId = cohorts.value[0]?.id ?? ''
  createForm.circle = 'content'
  createError.value = ''
  createModal.value = true
}
async function saveProgram() {
  createError.value = ''
  if (!createForm.name.trim()) {
    createError.value = 'Give it a name.'
    return
  }
  savingProgram.value = true
  try {
    if (createForm.scope === 'cohort') {
      if (!createForm.cohortId) {
        createError.value = 'Pick a cohort.'
        return
      }
      const res = await adminEngineApi.createProgram(createForm.cohortId, {
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined
      })
      if (!res.status) {
        createError.value = res.message || 'Failed to create program'
        return
      }
    } else {
      await adminEngineApi.createCircleTrack({
        name: createForm.name.trim(),
        circle: createForm.circle,
        description: createForm.description.trim() || undefined
      })
    }
    createModal.value = false
    flash('Program created')
    await loadPrograms()
  } catch (e: unknown) {
    createError.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to create program'
  } finally {
    savingProgram.value = false
  }
}

// ---- rename ----
const editingId = ref<string | null>(null)
const editForm = reactive({ name: '', description: '' })
const editBusy = ref(false)
function startEdit(p: Program) {
  editingId.value = p.id
  editForm.name = p.name
  editForm.description = p.description || ''
}
async function saveEdit() {
  if (!editingId.value || !editForm.name.trim()) return
  editBusy.value = true
  try {
    await adminEngineApi.updateProgram(editingId.value, {
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined
    })
    editingId.value = null
    await loadPrograms()
    flash('Updated')
  } finally {
    editBusy.value = false
  }
}

// ---- detail: its ordered tasks, each a real link into the Tasks page ----
const detailProgram = ref<Program | null>(null)
const detailTasks = ref<Task[]>([])
const detailLoading = ref(false)
async function openProgram(p: Program) {
  detailProgram.value = p
  detailLoading.value = true
  try {
    const res = await engineApi.getProgram(p.id)
    detailTasks.value = res.data?.tasks ?? []
  } finally {
    detailLoading.value = false
  }
}
function closeProgram() {
  detailProgram.value = null
  detailTasks.value = []
}

onMounted(async () => {
  try {
    cohorts.value = (await adminEngineApi.listCohorts()).data ?? []
    await loadPrograms()
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
          <p class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-2">Structured on-ramps</p>
          <h1 class="text-4xl font-black text-gray-900 leading-[1.3]">Programs</h1>
          <p class="text-gray-500 mt-2 max-w-md">Every ordered task series — Induction, cohort series, circle tracks — in one place.</p>
        </div>
        <BaseButton class="shrink-0" @click="openCreateModal"><PlusIcon class="h-4 w-4 mr-1.5" /> New program</BaseButton>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!programs.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p class="text-sm text-gray-500">No programs yet.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="p in programs" :key="p.id" class="border border-gray-200 rounded-xl p-5 flex flex-col">
          <template v-if="editingId === p.id">
            <div class="space-y-2">
              <BaseInput v-model="editForm.name" label="Name" />
              <BaseInput v-model="editForm.description" label="Description (optional)" />
              <div class="flex items-center gap-3">
                <BaseButton size="sm" :loading="editBusy" @click="saveEdit">Save</BaseButton>
                <button class="text-sm text-gray-500 hover:text-gray-700" @click="editingId = null">Cancel</button>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex items-start justify-between gap-2 mb-2">
              <p class="font-semibold text-gray-900">{{ p.name }}</p>
              <button class="text-xs font-medium text-gray-400 hover:text-gray-700 shrink-0" @click="startEdit(p)">Rename</button>
            </div>
            <p v-if="p.description" class="text-sm text-gray-500 mb-4 flex-1">{{ p.description }}</p>
            <p v-else class="flex-1"></p>
            <p class="text-[11px] font-mono text-gray-400 uppercase mb-4">{{ programMeta(p) }}</p>
            <button class="text-sm font-semibold text-senpai-600 hover:text-senpai-700 inline-flex items-center gap-1 self-start" @click="openProgram(p)">
              View tasks <ArrowRightIcon class="h-3.5 w-3.5" />
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Create program -->
    <BaseModal :show="createModal" title="New program" @close="createModal = false">
      <div class="space-y-4">
        <BaseAlert v-if="createError" type="error">{{ createError }}</BaseAlert>
        <BaseSelect
          v-model="createForm.scope"
          label="Scope"
          :options="[
            { value: 'cohort', label: 'A specific cohort' },
            { value: 'circle', label: 'Global — a circle track' }
          ]"
        />
        <BaseSelect v-if="createForm.scope === 'cohort'" v-model="createForm.cohortId" :options="cohorts.map((c) => ({ value: c.id, label: c.name }))" label="Cohort" />
        <BaseSelect
          v-if="createForm.scope === 'circle'"
          v-model="createForm.circle"
          :options="[
            { value: 'content', label: 'Content Circle' },
            { value: 'product', label: 'Product Circle' },
            { value: 'growth', label: 'Growth Circle' }
          ]"
          label="Circle"
        />
        <BaseInput v-model="createForm.name" label="Name" placeholder="Writing Series" required />
        <BaseTextarea v-model="createForm.description" label="Description (optional)" :rows="3" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="createModal = false">Cancel</button>
        <BaseButton :loading="savingProgram" @click="saveProgram">Create</BaseButton>
      </template>
    </BaseModal>

    <!-- Program detail: ordered tasks, each a real link into the Tasks page -->
    <BaseModal :show="!!detailProgram" :title="detailProgram?.name || ''" @close="closeProgram">
      <div v-if="detailLoading" class="flex justify-center py-8"><LoadingSpinner /></div>
      <div v-else class="space-y-4">
        <p v-if="detailProgram?.description" class="text-sm text-gray-600">{{ detailProgram.description }}</p>
        <div class="border border-gray-200 divide-y divide-gray-100 rounded-lg overflow-hidden">
          <RouterLink
            v-for="(t, i) in detailTasks"
            :key="t.id"
            :to="`/admin/tasks?task=${t.id}`"
            class="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors"
          >
            <span class="text-xs font-mono text-gray-300 w-4 shrink-0">{{ i + 1 }}</span>
            <p class="text-sm text-gray-900 flex-1 min-w-0 truncate">{{ t.title }}</p>
            <span v-if="t.skill_name" class="text-[10px] font-mono uppercase text-senpai-600 shrink-0">{{ t.skill_name }}</span>
            <ArrowRightIcon class="h-3.5 w-3.5 text-gray-300 shrink-0" />
          </RouterLink>
          <p v-if="!detailTasks.length" class="text-sm text-gray-400 text-center py-6">No tasks yet.</p>
        </div>
        <RouterLink
          v-if="detailProgram"
          :to="`/admin/tasks?program=${detailProgram.id}`"
          class="inline-flex items-center gap-1.5 text-sm font-semibold text-senpai-600 hover:text-senpai-700"
        >
          <PlusIcon class="h-4 w-4" /> Add a task on the Tasks page
        </RouterLink>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="closeProgram">Close</button>
      </template>
    </BaseModal>

    <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
  </AdminLayout>
</template>
