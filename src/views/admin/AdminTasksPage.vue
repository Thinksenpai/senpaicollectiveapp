<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminEngineApi, adminApi, engineApi, skillsApi } from '@/api'
import type {
  Cohort, Pod, CohortMembership, Task, TaskAssignment, Member,
  CreateTaskPayload, TaskKind, HandinType, Program,
  TaskComment, AssignmentComment, AssignmentStatus, Skill, Circle, TaskSubmission
} from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import SubmissionHistory from '@/components/member/SubmissionHistory.vue'
import ReviewFormModal from '@/components/reviews/ReviewFormModal.vue'
import {
  PlusIcon, CheckCircleIcon, XMarkIcon, ChatBubbleLeftIcon,
  CalendarIcon, ArrowUturnLeftIcon, PencilIcon, TrashIcon, XCircleIcon, StarIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const cohorts = ref<Cohort[]>([])
const selectedCohortId = ref('')
const tasks = ref<Task[]>([])
const pods = ref<Pod[]>([])
const members = ref<CohortMembership[]>([])
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}
function memberName(m: CohortMembership) {
  return m.member?.profile?.full_name || m.member?.email || m.member_id.slice(0, 8)
}
function assigneeName(m?: { profile?: { full_name?: string }; email?: string } | null, fallbackId?: string) {
  return m?.profile?.full_name || m?.email || fallbackId?.slice(0, 8) || 'Unknown'
}
function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}
function formatDate(d?: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
// How much of the open board this task still has free. Deliberately separate
// from the progress bar: slots taken and work completed are different numbers,
// and reading one as the other makes a half-claimed task look finished.
// Counts claims only — being handed the task by an admin doesn't use up a
// slot on the open board.
function slotsLabel(t: Task): string {
  const taken = t.claim_count ?? 0
  if (!t.claim_cap) return `${taken} claimed`
  return taken >= t.claim_cap ? 'full' : `${taken}/${t.claim_cap} claimed`
}
function isOverdue(t: Task) {
  return !!t.due_at && new Date(t.due_at) < new Date() && (t.completed_count ?? 0) < (t.assignment_count ?? 0)
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

async function loadCohorts() {
  const res = await adminEngineApi.listCohorts()
  cohorts.value = res.data ?? []
  const fromQuery = route.query.cohort as string | undefined
  if (fromQuery && cohorts.value.some((c) => c.id === fromQuery)) selectedCohortId.value = fromQuery
}
// Scope sentinels. ALL is the default and the only honest view: a circle task
// created while a cohort was selected carries that cohort_id, so it is absent
// from GLOBAL and buried in the cohort — which is how open work went missing.
const ALL = '__all__'
const GLOBAL = '__global__' // circle tracks + their tasks (cohort_id IS NULL)
const isAll = computed(() => selectedCohortId.value === ALL)
const isGlobal = computed(() => selectedCohortId.value === GLOBAL)
const inCohortView = computed(() => !isAll.value && !isGlobal.value)

async function loadTasks() {
  if (!selectedCohortId.value) return
  if (!inCohortView.value) {
    const t = await adminEngineApi.listTasks(isAll.value ? 'all' : undefined)
    tasks.value = t.data ?? []
    pods.value = []
    members.value = []
    return
  }
  const [t, p, m] = await Promise.all([
    adminEngineApi.listTasks(selectedCohortId.value),
    adminEngineApi.listPods(selectedCohortId.value),
    adminEngineApi.listCohortMembers(selectedCohortId.value)
  ])
  tasks.value = t.data ?? []
  pods.value = p.data ?? []
  members.value = m.data ?? []
}

function cohortName(id?: string | null) {
  return id ? cohorts.value.find((c) => c.id === id)?.name : null
}

// Where a task lives, for the scope column in the all-tasks view.
function taskHome(t: Task): string {
  if (t.project_id) return 'Project'
  return cohortName(t.cohort_id) ?? 'Collective-wide'
}

// Assigning needs people. In a cohort view that's the cohort's roster; outside
// one there is no roster, so fall back to every approved member rather than
// showing an empty picker (which is what the global view used to do).
const allMembers = ref<Member[]>([])
const memberOptions = computed(() =>
  inCohortView.value
    ? members.value.map((m) => ({ value: m.member_id, label: memberName(m) }))
    : allMembers.value.map((m) => ({ value: m.id, label: m.profile?.full_name || m.email }))
)

// The task form's "Program" picker and task-row labels need every program
// that exists — not just the ones for whichever cohort/global view you
// currently have selected. Loaded once, independent of that toggle.
async function loadAllPrograms() {
  const [cohortPrograms, circleTracks] = await Promise.all([
    Promise.all(cohorts.value.map((c) => adminEngineApi.listCohortPrograms(c.id))),
    engineApi.listCircleTracks()
  ])
  programs.value = [...cohortPrograms.flatMap((r) => r.data ?? []), ...(circleTracks.data ?? [])]
}

async function loadCircles() {
  const res = await engineApi.listCircles()
  circles.value = res.data ?? []
}

// Deep links from the Programs page: ?program=<id> opens the create-task
// modal pre-filled for that program (routing to the right cohort/global
// view first); ?task=<id> opens that task's detail slide-over directly.
async function handleDeepLinks() {
  const programId = route.query.program as string | undefined
  const taskId = route.query.task as string | undefined
  // Both land in the all-tasks view: it is the one scope guaranteed to
  // contain the target, whatever cohort it does or doesn't belong to.
  if (programId) {
    const res = await engineApi.getProgram(programId)
    const program = res.data?.program
    if (program) {
      selectedCohortId.value = ALL
      await loadTasks()
      openTaskModal()
      taskForm.program_id = programId
      taskForm.cohort_id = program.cohort_id || ''
    }
  } else if (taskId) {
    selectedCohortId.value = ALL
    await loadTasks()
    const found = tasks.value.find((t) => t.id === taskId)
    if (found) openDetail(found)
  }
}

onMounted(async () => {
  try {
    await loadCohorts()
    await Promise.all([loadAllPrograms(), loadCircles(), loadAllMembers()])
    if (route.query.program || route.query.task) {
      loading.value = false
      await handleDeepLinks()
      return
    }
    if (!selectedCohortId.value) selectedCohortId.value = ALL
    await loadTasks()
  } finally {
    loading.value = false
  }
})

async function loadAllMembers() {
  const res = await adminApi.getMembers({ status: 'approved', limit: 500 })
  allMembers.value = res.data ?? []
}
watch(selectedCohortId, async (id, old) => {
  if (id && id !== old) {
    loading.value = true
    try {
      await loadTasks()
    } finally {
      loading.value = false
    }
  }
})

// ---- create task ----
const taskModal = ref(false)
const savingTask = ref(false)
const taskFormError = ref('')
const taskFormErrors = reactive<{ title?: string; description?: string }>({})
const editingTaskId = ref<string | null>(null)
const editingTaskSlug = ref('')
const taskForm = reactive({
  title: '', description: '',
  // Explicit, not inherited from whichever scope happens to be selected —
  // silently stamping the current cohort is what hid circle tasks.
  cohort_id: '',
  program_id: '', kind: 'custom' as TaskKind,
  handin_type: 'link' as HandinType, external_url: '',
  is_required: false, show_submissions: true, status: 'published' as 'draft' | 'published',
  due_at: '', available_at: '',
  // Role/claiming layer
  skill_id: '' as string, circle: '', reviewer_id: '' as string,
  claimable: false, claim_cap: '' as string
})
// Assign-on-create — only shown when creating a new task, not editing.
const assignOnCreate = reactive({ type: 'none' as 'none' | 'cohort' | 'pod' | 'individual' | 'global', id: '' })
// Programs (e.g. Induction) are ordered series with a completion state —
// a task either belongs to one, or stands alone. This replaced "tracks".
const programs = ref<Program[]>([])
const programOptions = computed(() => [
  { value: '', label: 'None — standalone task' },
  ...programs.value.map((p) => ({ value: p.id, label: p.name }))
])
function programName(id?: string | null) {
  return programs.value.find((p) => p.id === id)?.name
}

// Skills catalog — the role a task exercises (counts toward verification later).
const skills = ref<Skill[]>([])
skillsApi.getSkills().then((res) => { skills.value = res.data ?? [] }).catch(() => {})
const skillOptions = computed(() => [
  { value: '', label: 'None — no role tag' },
  ...skills.value.map((s) => ({ value: String(s.id), label: s.name }))
])
// Circles come from the circles table rather than a hardcoded list: a new
// circle then appears here on its own, and the slug can never be mistyped
// into existence (migration 023 made task.circle_id a real foreign key).
const circles = ref<Circle[]>([])
const circleOptions = computed(() => [
  { value: '', label: 'None' },
  ...circles.value.map((c) => ({
    value: c.slug,
    label: c.status === 'active' ? c.name : `${c.name} (${c.status})`
  }))
])

const kindOptions = ['reflection', 'portfolio', 'build', 'publish', 'research', 'custom'].map((k) => ({ value: k, label: (k[0] ?? '').toUpperCase() + k.slice(1) }))
const handinOptions = [
  { value: 'none', label: 'Mark as done (no hand-in)' },
  { value: 'link', label: 'A link' },
  { value: 'text', label: 'Written text' },
  { value: 'file', label: 'A file' },
  { value: 'external_form', label: 'External form' }
]
function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
}
function openTaskModal() {
  editingTaskId.value = null
  taskForm.title = ''
  taskForm.description = ''
  taskForm.cohort_id = inCohortView.value ? selectedCohortId.value : ''
  taskForm.program_id = ''
  taskForm.kind = 'custom'
  taskForm.handin_type = 'link'
  taskForm.external_url = ''
  taskForm.is_required = false
  taskForm.show_submissions = true
  taskForm.status = 'published'
  taskForm.due_at = ''
  taskForm.available_at = ''
  taskForm.skill_id = ''
  taskForm.circle = ''
  taskForm.reviewer_id = ''
  taskForm.claimable = false
  taskForm.claim_cap = ''
  assignOnCreate.type = 'none'
  assignOnCreate.id = ''
  taskFormError.value = ''
  taskFormErrors.title = undefined
  taskFormErrors.description = undefined
  taskModal.value = true
}
function openEditTaskModal(t: Task) {
  editingTaskId.value = t.id
  editingTaskSlug.value = t.slug
  taskForm.title = t.title
  taskForm.description = t.description
  taskForm.cohort_id = t.cohort_id || ''
  taskForm.program_id = t.program_id || ''
  taskForm.kind = t.kind
  taskForm.handin_type = t.handin_type
  taskForm.external_url = t.external_url || ''
  taskForm.is_required = t.is_required
  taskForm.show_submissions = t.show_submissions
  taskForm.status = t.status === 'archived' ? 'draft' : t.status
  taskForm.due_at = t.due_at ? t.due_at.slice(0, 10) : ''
  taskForm.available_at = t.available_at ? t.available_at.slice(0, 10) : ''
  taskForm.skill_id = t.skill_id ? String(t.skill_id) : ''
  taskForm.circle = t.circle || ''
  taskForm.reviewer_id = t.reviewer_id || ''
  taskForm.claimable = t.claimable
  taskForm.claim_cap = t.claim_cap ? String(t.claim_cap) : ''
  taskFormError.value = ''
  taskFormErrors.title = undefined
  taskFormErrors.description = undefined
  taskModal.value = true
}
function validateTaskForm(): boolean {
  taskFormErrors.title = taskForm.title.trim() ? undefined : 'Title is required'
  taskFormErrors.description = taskForm.description.trim() ? undefined : 'Description is required'
  return !taskFormErrors.title && !taskFormErrors.description
}
async function saveTask() {
  taskFormError.value = ''
  if (!validateTaskForm()) return
  savingTask.value = true
  try {
    const chosenProgram = programs.value.find((p) => p.id === taskForm.program_id)
    const payload: CreateTaskPayload = {
      title: taskForm.title,
      slug: editingTaskId.value ? editingTaskSlug.value : `${slugify(taskForm.title)}-${Math.random().toString(36).slice(2, 6)}`,
      description: taskForm.description,
      kind: taskForm.kind,
      // Legacy column, derived — programs replaced tracks (blueprint v3).
      track: chosenProgram?.kind === 'induction' ? 'induction' : 'building',
      program_id: taskForm.program_id || undefined,
      handin_type: taskForm.handin_type,
      external_url: taskForm.handin_type === 'external_form' ? taskForm.external_url || undefined : undefined,
      cohort_id: taskForm.cohort_id || undefined,
      is_required: taskForm.is_required,
      show_submissions: taskForm.show_submissions,
      status: taskForm.status,
      due_at: taskForm.due_at ? new Date(taskForm.due_at).toISOString() : undefined,
      available_at: taskForm.available_at ? new Date(taskForm.available_at).toISOString() : undefined,
      skill_id: taskForm.skill_id ? Number(taskForm.skill_id) : undefined,
      circle: taskForm.circle || undefined,
      reviewer_id: taskForm.reviewer_id || undefined,
      claimable: taskForm.claimable,
      claim_cap: taskForm.claimable && taskForm.claim_cap ? Number(taskForm.claim_cap) : undefined,
      audience: 'open'
    }
    if (editingTaskId.value) {
      const res = await adminEngineApi.updateTask(editingTaskId.value, payload)
      if (detailTask.value && res.data) detailTask.value = res.data
      flash('Task updated')
    } else {
      const created = await adminEngineApi.createTask(payload)
      let assignedNote = ''
      if (assignOnCreate.type !== 'none' && created.data) {
        const assignPayload =
          assignOnCreate.type === 'cohort'
            ? { target_type: 'cohort' as const, target_id: taskForm.cohort_id }
            : assignOnCreate.type === 'global'
              ? { target_type: 'global' as const }
              : { target_type: assignOnCreate.type, target_id: assignOnCreate.id }
        if (assignOnCreate.type === 'cohort' || assignOnCreate.type === 'global' || assignOnCreate.id) {
          const res = await adminEngineApi.assignTask(created.data.id, assignPayload)
          assignedNote = ` and assigned to ${res.data?.assigned ?? 0} member(s)`
        }
      }
      flash(`Task created${assignedNote}`)
    }
    taskModal.value = false
    await loadTasks()
  } catch (e: unknown) {
    taskFormError.value = (e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to save task'
  } finally {
    savingTask.value = false
  }
}

// ---- assign ----
const assignTask = ref<Task | null>(null)
const assigning = ref(false)
const assignForm = reactive({ type: 'cohort', id: '' })
async function openAssign(t: Task) {
  // "The whole cohort" only means something for a task that has one.
  assignForm.type = t.cohort_id ? 'cohort' : 'individual'
  assignForm.id = ''
  assignTask.value = t
  // Outside a cohort view the pod list isn't loaded — fetch this task's own.
  if (t.cohort_id && !inCohortView.value) {
    pods.value = (await adminEngineApi.listPods(t.cohort_id)).data ?? []
  }
}
const assignTargetOptions = computed(() => [
  ...(assignTask.value?.cohort_id ? [{ value: 'cohort', label: `The whole cohort — ${cohortName(assignTask.value.cohort_id) ?? ''}` }] : []),
  ...(assignTask.value?.cohort_id ? [{ value: 'pod', label: 'A specific pod' }] : []),
  { value: 'individual', label: 'One member' },
  { value: 'global', label: 'Everyone in the collective' }
])
async function doAssign() {
  if (!assignTask.value) return
  const payload =
    assignForm.type === 'cohort'
      ? { target_type: 'cohort' as const, target_id: assignTask.value.cohort_id ?? '' }
      : assignForm.type === 'global'
        ? { target_type: 'global' as const }
        : { target_type: assignForm.type as 'pod' | 'individual', target_id: assignForm.id }
  if ((assignForm.type === 'pod' || assignForm.type === 'individual') && !assignForm.id) {
    flash('Pick a target')
    return
  }
  assigning.value = true
  try {
    const res = await adminEngineApi.assignTask(assignTask.value.id, payload)
    const wasDetail = detailTask.value?.id === assignTask.value.id
    assignTask.value = null
    flash(`Assigned to ${res.data?.assigned ?? 0} member(s)`)
    await loadTasks()
    if (wasDetail) await loadRoster()
  } finally {
    assigning.value = false
  }
}

// ---- task detail (clickable row -> full view) ----
const detailTask = ref<Task | null>(null)
const detailLoading = ref(false)
const rosterRows = ref<TaskAssignment[]>([])
const taskComments = ref<TaskComment[]>([])
const newTaskComment = ref('')
const postingTaskComment = ref(false)

const assignmentStyles: Record<string, string> = {
  assigned: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-800',
  submitted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800'
}

async function loadRoster() {
  if (!detailTask.value) return
  const res = await adminEngineApi.getRoster(detailTask.value.id)
  rosterRows.value = res.data ?? []
}
async function openDetail(t: Task) {
  detailTask.value = t
  detailLoading.value = true
  rosterRows.value = []
  taskComments.value = []
  expandedAssignmentId.value = null
  try {
    const [roster, comments] = await Promise.all([
      adminEngineApi.getRoster(t.id),
      engineApi.getTaskComments(t.id)
    ])
    rosterRows.value = roster.data ?? []
    taskComments.value = comments.data ?? []
  } finally {
    detailLoading.value = false
  }
}
function closeDetail() {
  detailTask.value = null
}
async function postTaskComment() {
  if (!detailTask.value || !newTaskComment.value.trim()) return
  postingTaskComment.value = true
  try {
    await engineApi.postTaskComment(detailTask.value.id, newTaskComment.value.trim())
    taskComments.value = (await engineApi.getTaskComments(detailTask.value.id)).data ?? []
    newTaskComment.value = ''
  } finally {
    postingTaskComment.value = false
  }
}

// ---- per-assignment review + private comments ----
const expandedAssignmentId = ref<string | null>(null)
const assignmentComments = reactive<Record<string, AssignmentComment[]>>({})
const newAssignmentComment = reactive<Record<string, string>>({})
const reviewingId = ref<string | null>(null)

async function toggleAssignment(a: TaskAssignment) {
  if (expandedAssignmentId.value === a.id) {
    expandedAssignmentId.value = null
    return
  }
  expandedAssignmentId.value = a.id
  if (!assignmentComments[a.id]) {
    const res = await engineApi.getAssignmentComments(a.id)
    assignmentComments[a.id] = res.data ?? []
  }
  await loadHistory(a.id)
}

// Reviewing is restricted to the task's named reviewer, not admins generally —
// the backend enforces the same rule, so showing the button to anyone else
// would only produce a rejection.
const canRateDetail = computed(() =>
  !!detailTask.value?.reviewer_id && detailTask.value.reviewer_id === authStore.member?.id
)
const rateModal = ref(false)
const rateTarget = ref<TaskAssignment | null>(null)
function openRate(a: TaskAssignment) {
  rateTarget.value = a
  rateModal.value = true
}

// Earlier attempts, so a reviewer can see whether a resubmission actually
// addressed what they returned it for.
const submissionHistory = reactive<Record<string, TaskSubmission[]>>({})
async function loadHistory(assignmentId: string) {
  submissionHistory[assignmentId] = (await engineApi.getSubmissionHistory(assignmentId)).data ?? []
}
async function postAssignmentComment(a: TaskAssignment) {
  const body = (newAssignmentComment[a.id] || '').trim()
  if (!body) return
  await engineApi.postAssignmentComment(a.id, body)
  assignmentComments[a.id] = (await engineApi.getAssignmentComments(a.id)).data ?? []
  newAssignmentComment[a.id] = ''
}
async function review(a: TaskAssignment, status: AssignmentStatus) {
  reviewingId.value = a.id
  try {
    await adminEngineApi.reviewAssignment(a.id, status)
    await loadRoster()
    await loadTasks()
    if (detailTask.value) {
      const fresh = tasks.value.find((t) => t.id === detailTask.value!.id)
      if (fresh) detailTask.value = fresh
    }
    flash(status === 'completed' ? 'Marked complete' : 'Returned for changes')
  } finally {
    reviewingId.value = null
  }
}

const deletingTask = ref(false)
async function deleteTask(t: Task) {
  if (!confirm(`Delete "${t.title}"? This removes it and every member's submission on it — this can't be undone.`)) return
  deletingTask.value = true
  try {
    await adminEngineApi.deleteTask(t.id)
    closeDetail()
    await loadTasks()
    flash('Task deleted')
  } finally {
    deletingTask.value = false
  }
}

const unassigningId = ref<string | null>(null)
async function unassign(a: TaskAssignment) {
  if (!confirm(`Remove ${assigneeName(a.member, a.member_id)} from this task?`)) return
  unassigningId.value = a.id
  try {
    await adminEngineApi.unassignTask(a.id)
    if (expandedAssignmentId.value === a.id) expandedAssignmentId.value = null
    await loadRoster()
    await loadTasks()
    if (detailTask.value) {
      const fresh = tasks.value.find((t) => t.id === detailTask.value!.id)
      if (fresh) detailTask.value = fresh
    }
    flash('Removed from task')
  } finally {
    unassigningId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
          <p class="text-sm text-gray-500 mt-0.5">Build the work members do — pre-induction and beyond.</p>
        </div>
        <BaseButton @click="openTaskModal"><PlusIcon class="h-4 w-4 mr-1" /> New task</BaseButton>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <!-- scope selector -->
        <div class="mb-6 flex items-center gap-3 flex-wrap">
          <span class="text-sm text-gray-500">Showing</span>
          <div class="min-w-[220px]">
            <BaseSelect
              v-model="selectedCohortId"
              :options="[
                { value: ALL, label: 'All tasks' },
                ...cohorts.map((c) => ({ value: c.id, label: c.name })),
                { value: GLOBAL, label: 'Collective-wide only (no cohort)' }
              ]"
            />
          </div>
          <RouterLink to="/admin/programs" class="text-sm font-medium text-senpai-600 hover:text-senpai-700">
            Programs &rarr;
          </RouterLink>
        </div>

        <div v-if="tasks.length" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide text-left">
              <tr>
                <th class="px-5 py-2.5 font-medium">Task</th>
                <th v-if="isAll" class="px-5 py-2.5 font-medium">Where</th>
                <th class="px-5 py-2.5 font-medium">Assigned to</th>
                <th class="px-5 py-2.5 font-medium">Due</th>
                <th class="px-5 py-2.5 font-medium">Progress</th>
                <th class="px-5 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="t in tasks" :key="t.id" class="hover:bg-gray-50 cursor-pointer" @click="openDetail(t)">
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-medium text-gray-900">{{ t.title }}</span>
                    <span v-if="t.is_required" class="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600 shrink-0">Required</span>
                    <!-- Open-board state: without this an admin can't tell a
                         claimable task from a directly assigned one. -->
                    <span v-if="t.claimable" class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-900 text-white shrink-0">
                      Open · {{ slotsLabel(t) }}
                    </span>
                    <span v-if="t.circle" class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 shrink-0">{{ t.circle }}</span>
                    <span v-if="t.skill_name" class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-senpai-50 text-senpai-700 shrink-0">{{ t.skill_name }}</span>
                  </div>
                  <p class="text-xs text-gray-400 mt-0.5 capitalize">{{ programName(t.program_id) ? programName(t.program_id) + ' · ' : '' }}{{ t.kind }} · {{ t.handin_type.replace('_', ' ') }}</p>
                </td>
                <td v-if="isAll" class="px-5 py-3">
                  <span class="text-xs text-gray-500">{{ taskHome(t) }}</span>
                </td>
                <td class="px-5 py-3" @click.stop>
                  <div v-if="t.assigned_to?.length" class="flex flex-wrap gap-1 max-w-[220px]">
                    <span v-for="label in t.assigned_to" :key="label" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{{ label }}</span>
                  </div>
                  <button v-else class="text-xs text-senpai-600 font-medium hover:text-senpai-700" @click="openAssign(t)">Assign…</button>
                </td>
                <td class="px-5 py-3">
                  <span
                    v-if="t.due_at"
                    class="inline-flex items-center gap-1 text-xs"
                    :class="isOverdue(t) ? 'text-red-600 font-medium' : 'text-gray-500'"
                  >
                    <CalendarIcon class="h-3.5 w-3.5" /> {{ formatDate(t.due_at) }}
                  </span>
                  <span v-else class="text-xs text-gray-300">—</span>
                </td>
                <td class="px-5 py-3">
                  <div class="flex items-center gap-2 w-28">
                    <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full bg-senpai-500 rounded-full"
                        :style="{ width: (t.assignment_count ? ((t.completed_count ?? 0) / t.assignment_count) * 100 : 0) + '%' }"
                      />
                    </div>
                    <span class="text-xs text-gray-500 shrink-0">{{ t.completed_count ?? 0 }}/{{ t.assignment_count ?? 0 }}</span>
                  </div>
                </td>
                <td class="px-5 py-3">
                  <span
                    class="text-xs px-2 py-0.5 rounded-full capitalize"
                    :class="t.status === 'published' ? 'bg-green-50 text-green-700' : t.status === 'draft' ? 'bg-gray-100 text-gray-500' : 'bg-gray-50 text-gray-400'"
                  >{{ t.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>
        <div v-else class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <p class="text-gray-500 text-sm">{{ isAll ? 'No tasks yet.' : 'No tasks in this scope yet.' }}</p>
          <BaseButton class="mt-4" @click="openTaskModal">Create the first task</BaseButton>
        </div>
      </template>
    </div>

    <!-- Create / edit task modal -->
    <BaseModal
      :show="taskModal"
      :title="editingTaskId ? 'Edit task' : 'New task'"
      :subtitle="editingTaskId ? 'Update what this task asks for.' : 'Something for members to do.'"
      @close="taskModal = false"
    >
      <div class="space-y-4">
        <BaseAlert v-if="taskFormError" type="error">{{ taskFormError }}</BaseAlert>
        <BaseInput v-model="taskForm.title" label="Title" placeholder="Upgrade your portfolio" :error="taskFormErrors.title" required />
        <BaseTextarea v-model="taskForm.description" label="Description" :rows="3" placeholder="What should they do, and what does done look like?" :error="taskFormErrors.description" required />
        <BaseSelect
          v-model="taskForm.cohort_id"
          :options="[{ value: '', label: 'No cohort — collective-wide (circle work, open board)' }, ...cohorts.map((c) => ({ value: c.id, label: c.name }))]"
          label="Belongs to"
        />
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <BaseSelect v-model="taskForm.program_id" :options="programOptions" label="Program" />
          <BaseSelect v-model="taskForm.kind" :options="kindOptions" label="Kind" />
          <BaseSelect v-model="taskForm.handin_type" :options="handinOptions" label="Hand-in" />
        </div>
        <BaseInput v-if="taskForm.handin_type === 'external_form'" v-model="taskForm.external_url" label="External form URL" placeholder="https://forms.gle/…" />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="taskForm.available_at" type="date" label="Available from (optional)" />
          <BaseInput v-model="taskForm.due_at" type="date" label="Due date (optional)" />
        </div>
        <label class="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="taskForm.is_required" class="rounded border-gray-300 text-senpai-600 focus:ring-senpai-500" />
          Required to complete induction
        </label>
        <label class="flex items-start gap-2 text-sm text-gray-700">
          <input type="checkbox" v-model="taskForm.show_submissions" class="mt-0.5 rounded border-gray-300 text-senpai-600 focus:ring-senpai-500" />
          <span>
            Everyone on this task can see each other's hand-ins
            <span class="block text-xs text-gray-400">
              On by default. Turn off for work where seeing the other answers first would spoil it — hand-ins then stay between each member and their reviewer.
            </span>
          </span>
        </label>

        <!-- Role/claiming layer: the skill this work exercises + the open board -->
        <div class="pt-4 border-t border-gray-100 space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="taskForm.skill_id" :options="skillOptions" label="Role (skill this task exercises)" />
            <BaseSelect v-model="taskForm.circle" :options="circleOptions" label="Circle (optional)" />
          </div>
          <BaseSelect
            v-model="taskForm.reviewer_id"
            :options="[{ value: '', label: 'You (default)' }, ...memberOptions]"
            label="Reviewer — who reviews the submission"
          />
          <div class="flex items-center gap-4">
            <label class="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" v-model="taskForm.claimable" class="rounded border-gray-300 text-senpai-600 focus:ring-senpai-500" />
              Claimable — anyone can pull this from the open board
            </label>
            <BaseInput v-if="taskForm.claimable" v-model="taskForm.claim_cap" type="number" placeholder="No limit" label="Claim slots" class="w-32" />
          </div>
        </div>

        <div v-if="!editingTaskId" class="pt-4 border-t border-gray-100 space-y-3">
          <BaseSelect
            v-model="assignOnCreate.type"
            label="Assign to (optional)"
            :options="[
              { value: 'none', label: taskForm.claimable ? `Don't assign — let members claim it` : `Don't assign yet` },
              ...(taskForm.cohort_id ? [
                { value: 'cohort', label: 'The whole cohort' },
                { value: 'pod', label: 'A specific pod' }
              ] : []),
              { value: 'individual', label: 'One member' },
              { value: 'global', label: 'Everyone in the collective' }
            ]"
          />
          <BaseSelect v-if="assignOnCreate.type === 'pod'" v-model="assignOnCreate.id" :options="pods.map((p) => ({ value: p.id, label: p.name }))" label="Pod" placeholder="Select a pod" />
          <BaseSelect v-if="assignOnCreate.type === 'individual'" v-model="assignOnCreate.id" :options="memberOptions" label="Member" placeholder="Select a member" />
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="taskModal = false">Cancel</button>
        <BaseButton :loading="savingTask" @click="saveTask">{{ editingTaskId ? 'Save changes' : 'Create task' }}</BaseButton>
      </template>
    </BaseModal>

    <!-- Assign modal -->
    <BaseModal :show="!!assignTask" :title="`Assign · ${assignTask?.title ?? ''}`" subtitle="Who should get this task?" @close="assignTask = null">
      <div class="space-y-4">
        <BaseSelect v-model="assignForm.type" :options="assignTargetOptions" label="Target" />
        <BaseSelect v-if="assignForm.type === 'pod'" v-model="assignForm.id" :options="pods.map((p) => ({ value: p.id, label: p.name }))" label="Pod" placeholder="Select a pod" />
        <BaseSelect v-if="assignForm.type === 'individual'" v-model="assignForm.id" :options="memberOptions" label="Member" placeholder="Select a member" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="assignTask = null">Cancel</button>
        <BaseButton :loading="assigning" @click="doAssign">Assign</BaseButton>
      </template>
    </BaseModal>

    <!-- Task detail slide-over (Jira/Linear-style: description, roster, review, comments) -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="translate-x-full"
    >
      <div v-if="detailTask" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-gray-900/40" @click="closeDetail" />
        <div class="relative w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl">
          <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wide capitalize">{{ programName(detailTask.program_id) ? programName(detailTask.program_id) + ' · ' : '' }}{{ detailTask.kind }}</p>
              <h2 class="text-lg font-semibold text-gray-900 mt-0.5">{{ detailTask.title }}</h2>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="p-1.5 text-gray-400 hover:text-senpai-600 rounded-lg hover:bg-gray-100" title="Edit task" @click="openEditTaskModal(detailTask)">
                <PencilIcon class="h-4 w-4" />
              </button>
              <button class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete task" :disabled="deletingTask" @click="deleteTask(detailTask)">
                <TrashIcon class="h-4 w-4" />
              </button>
              <button class="text-gray-400 hover:text-gray-600 p-1" @click="closeDetail"><XMarkIcon class="h-5 w-5" /></button>
            </div>
          </div>

          <div v-if="detailLoading" class="flex justify-center py-16"><LoadingSpinner /></div>
          <div v-else class="px-6 py-5 space-y-8">
            <!-- description + meta -->
            <section>
              <p class="text-sm text-gray-700 whitespace-pre-wrap">{{ detailTask.description }}</p>
              <div class="flex flex-wrap items-center gap-3 mt-3 text-xs">
                <span v-if="detailTask.is_required" class="px-2 py-0.5 rounded-full bg-red-50 text-red-600">Required</span>
                <span v-if="detailTask.due_at" class="inline-flex items-center gap-1 text-gray-500"><CalendarIcon class="h-3.5 w-3.5" /> Due {{ formatDate(detailTask.due_at) }}</span>
                <span class="text-gray-400">{{ detailTask.completed_count ?? 0 }}/{{ detailTask.assignment_count ?? 0 }} completed</span>
                <button class="ml-auto px-3 py-1.5 rounded-lg bg-senpai-600 text-white font-medium hover:bg-senpai-700" @click="openAssign(detailTask)">Assign more</button>
              </div>
            </section>

            <!-- How this task is set up. All of this was already stored and
                 none of it was shown, so an open task with a role requirement
                 looked identical to an ordinary assigned one. -->
            <section>
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Setup</h3>
              <!-- gap-px over a grey background draws the hairlines. Always an
                   even number of cells, so the last row never leaves a gap. -->
              <dl class="grid grid-cols-2 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Open board</dt>
                  <dd v-if="detailTask.claimable" class="mt-1.5">
                    <div v-if="detailTask.claim_cap" class="flex items-center gap-2">
                      <div class="flex gap-1">
                        <span
                          v-for="i in detailTask.claim_cap"
                          :key="i"
                          class="h-1.5 w-5 rounded-full"
                          :class="i <= (detailTask.claim_count ?? 0) ? 'bg-gray-900' : 'bg-gray-200'"
                        />
                      </div>
                      <span class="text-sm text-gray-900">{{ detailTask.claim_count ?? 0 }}/{{ detailTask.claim_cap }}</span>
                    </div>
                    <p v-else class="text-sm text-gray-900">
                      {{ detailTask.claim_count ?? 0 }} claimed <span class="text-gray-400">· no limit</span>
                    </p>
                    <p class="text-xs text-gray-400 mt-0.5">Members claim this themselves</p>
                  </dd>
                  <dd v-else class="mt-1.5 text-sm text-gray-500">Not on the open board</dd>
                </div>

                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Role required</dt>
                  <dd v-if="detailTask.skill_name" class="mt-1.5">
                    <span class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-senpai-50 text-senpai-700">{{ detailTask.skill_name }}</span>
                    <p class="text-xs text-gray-400 mt-1">Counts toward verifying this skill</p>
                  </dd>
                  <dd v-else class="mt-1.5 text-sm text-gray-500">None — anyone can take it</dd>
                </div>

                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Circle</dt>
                  <dd v-if="detailTask.circle" class="mt-1.5">
                    <span class="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-100 text-gray-700 capitalize">{{ detailTask.circle }}</span>
                  </dd>
                  <dd v-else class="mt-1.5 text-sm text-gray-500">None</dd>
                </div>

                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Reviewer</dt>
                  <dd v-if="detailTask.reviewer_name" class="mt-1.5 text-sm text-gray-900">
                    {{ detailTask.reviewer_name }}
                    <p class="text-xs text-gray-400 mt-0.5">Only they can rate the finished work</p>
                  </dd>
                  <dd v-else class="mt-1.5 text-sm text-amber-600">
                    Unnamed
                    <p class="text-xs text-amber-500 mt-0.5">Nobody can rate this work</p>
                  </dd>
                </div>

                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Belongs to</dt>
                  <dd class="mt-1.5 text-sm text-gray-900">
                    {{ taskHome(detailTask) }}
                    <p v-if="programName(detailTask.program_id)" class="text-xs text-gray-400 mt-0.5">{{ programName(detailTask.program_id) }}</p>
                  </dd>
                </div>

                <div class="bg-white px-4 py-3">
                  <dt class="text-[10px] font-mono uppercase tracking-widest text-gray-400">Hand-ins</dt>
                  <dd class="mt-1.5 text-sm text-gray-900">
                    {{ detailTask.show_submissions ? 'Shared' : 'Private' }}
                    <p class="text-xs text-gray-400 mt-0.5">
                      {{ detailTask.show_submissions ? 'Everyone on the task sees each other\'s' : 'Between each member and their reviewer' }}
                    </p>
                  </dd>
                </div>
              </dl>
            </section>

            <!-- roster -->
            <section>
              <h3 class="text-sm font-semibold text-gray-900 mb-1">Roster</h3>
              <p class="text-xs text-gray-400 mb-3">Open a row to see what they handed in and review it.</p>
              <p v-if="!rosterRows.length" class="text-sm text-gray-500 py-2">
                {{ detailTask.claimable ? 'Nobody has claimed this yet.' : 'No one assigned yet.' }}
              </p>
              <div v-else class="border border-gray-200 rounded-xl divide-y divide-gray-100">
                <div v-for="a in rosterRows" :key="a.id">
                  <div class="flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50" @click="toggleAssignment(a)">
                    <span class="text-sm text-gray-800 flex items-center gap-2 min-w-0">
                      <span
                        class="h-7 w-7 rounded-full overflow-hidden shrink-0 ring-2"
                        :class="a.member?.profile?.is_og_member ? 'ring-senpai-300' : 'ring-gray-100'"
                      >
                        <img v-if="a.member?.profile?.photo_url" :src="a.member.profile.photo_url" :alt="assigneeName(a.member, a.member_id)" class="h-full w-full object-cover" />
                        <span v-else class="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-500">{{ initials(assigneeName(a.member, a.member_id)) }}</span>
                      </span>
                      <CheckCircleIcon v-if="a.status === 'completed'" class="h-4 w-4 text-green-500 shrink-0" />
                      <span class="truncate">{{ assigneeName(a.member, a.member_id) }}</span>
                      <!-- Who came to the work themselves vs who was sent it. -->
                      <span
                        v-if="a.assigned_via === 'claim'"
                        class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-900 text-white shrink-0"
                      >Claimed</span>
                    </span>
                    <div class="flex items-center gap-2 shrink-0">
                      <span class="text-xs px-2 py-0.5 rounded-full capitalize" :class="assignmentStyles[a.status]">{{ a.status.replace('_', ' ') }}</span>
                      <ChatBubbleLeftIcon class="h-3.5 w-3.5 text-gray-300" />
                      <button class="text-gray-300 hover:text-red-500 p-0.5" title="Unassign" :disabled="unassigningId === a.id" @click.stop="unassign(a)">
                        <XCircleIcon class="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <!-- expanded: submission + review + private comments -->
                  <div v-if="expandedAssignmentId === a.id" class="px-4 pb-4 bg-gray-50 space-y-3">
                    <div v-if="a.link_url || a.body || a.file_url" class="text-sm bg-white border border-gray-200 rounded-lg p-3">
                      <a v-if="a.link_url" :href="a.link_url" target="_blank" class="text-senpai-600 hover:underline break-all">{{ a.link_url }}</a>
                      <a v-if="a.file_url" :href="a.file_url" target="_blank" class="text-senpai-600 hover:underline break-all block">{{ a.file_url }}</a>
                      <p v-if="a.body" class="text-gray-700 whitespace-pre-wrap">{{ a.body }}</p>
                    </div>
                    <p v-else class="text-xs text-gray-400 italic">No submission yet.</p>

                    <div v-if="(submissionHistory[a.id]?.length ?? 0) > 1">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Earlier attempts</p>
                      <SubmissionHistory :submissions="submissionHistory[a.id] ?? []" hide-latest />
                    </div>

                    <div v-if="a.status === 'submitted'" class="flex items-center gap-2">
                      <button class="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50" :disabled="reviewingId === a.id" @click="review(a, 'completed')">
                        <CheckCircleIcon class="h-3.5 w-3.5" /> Approve
                      </button>
                      <button class="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 disabled:opacity-50" :disabled="reviewingId === a.id" @click="review(a, 'returned')">
                        <ArrowUturnLeftIcon class="h-3.5 w-3.5" /> Return for changes
                      </button>
                    </div>

                    <!-- Approving says the work is done; only a review scores it,
                         and only a review builds the member's record. The two used
                         to live on different screens, so approved work routinely
                         counted for nothing. -->
                    <div
                      v-if="a.status === 'completed'"
                      class="flex items-start gap-2 rounded-lg border border-senpai-200 bg-senpai-50 px-3 py-2"
                    >
                      <div class="min-w-0 flex-1">
                        <p class="text-xs font-medium text-senpai-800">Score this work</p>
                        <p v-if="canRateDetail" class="text-[11px] text-senpai-700 mt-0.5">
                          Approving marked it done. Only a review counts it toward
                          {{ detailTask?.skill_name ? `verifying ${detailTask.skill_name}` : 'their record' }}.
                        </p>
                        <p v-else class="text-[11px] text-senpai-700 mt-0.5">
                          Only {{ detailTask?.reviewer_name || 'the named reviewer' }} can review this work.
                        </p>
                      </div>
                      <button
                        v-if="canRateDetail"
                        class="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-senpai-600 text-white font-medium hover:bg-senpai-700"
                        @click="openRate(a)"
                      >
                        <StarIcon class="h-3.5 w-3.5" /> Review
                      </button>
                    </div>

                    <div class="pt-1">
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Private thread with {{ assigneeName(a.member, a.member_id) }}</p>
                      <div v-if="assignmentComments[a.id]?.length" class="space-y-2 mb-2">
                        <div v-for="c in assignmentComments[a.id]" :key="c.id" class="text-sm bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <p class="text-xs text-gray-400 mb-0.5">{{ assigneeName(c.member, c.member_id) }} · {{ timeAgo(c.created_at) }}</p>
                          <p class="text-gray-700">{{ c.body }}</p>
                        </div>
                      </div>
                      <div class="flex items-center gap-2">
                        <input
                          v-model="newAssignmentComment[a.id]"
                          type="text"
                          placeholder="Reply…"
                          class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-senpai-400"
                          @keyup.enter="postAssignmentComment(a)"
                        />
                        <button class="text-sm text-senpai-600 font-medium hover:text-senpai-700" @click="postAssignmentComment(a)">Send</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- shared Q&A thread -->
            <section>
              <h3 class="text-sm font-semibold text-gray-900 mb-1">Discussion</h3>
              <p class="text-xs text-gray-400 mb-3">A shared thread — anyone assigned can ask questions or help each other here.</p>
              <div v-if="taskComments.length" class="space-y-2 mb-3">
                <div v-for="c in taskComments" :key="c.id" class="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  <p class="text-xs text-gray-400 mb-0.5">{{ assigneeName(c.member, c.member_id) }} · {{ timeAgo(c.created_at) }}</p>
                  <p class="text-gray-700 whitespace-pre-wrap">{{ c.body }}</p>
                </div>
              </div>
              <p v-else class="text-sm text-gray-400 italic mb-3">No questions yet.</p>
              <div class="flex items-center gap-2">
                <input
                  v-model="newTaskComment"
                  type="text"
                  placeholder="Ask or answer a question…"
                  class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-senpai-400"
                  @keyup.enter="postTaskComment"
                />
                <BaseButton :loading="postingTaskComment" @click="postTaskComment">Post</BaseButton>
              </div>
            </section>
          </div>
        </div>
      </div>
    </transition>

    <ReviewFormModal
      v-if="rateTarget"
      :show="rateModal"
      source-type="task"
      :source-id="rateTarget.id"
      :ratee-id="rateTarget.member_id"
      :ratee-name="assigneeName(rateTarget.member, rateTarget.member_id)"
      :job-role-id="detailTask?.job_role_id"
      :fallback-skill-id="detailTask?.skill_id"
      :fallback-skill-name="detailTask?.skill_name"
      @close="rateModal = false"
      @submitted="flash('Review submitted')"
    />

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AdminLayout>
</template>
