<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminEngineApi, adminApi } from '@/api'
import type { Cohort, Pod, CohortMembership, Member, MembershipState, CohortDashboard, CohortMemberRow } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import {
  PlusIcon, ChevronRightIcon, RectangleStackIcon, UsersIcon,
  ClipboardDocumentListIcon, ArrowRightIcon, SparklesIcon, PencilIcon,
  ChatBubbleLeftRightIcon, MapPinIcon, ClockIcon, InboxArrowDownIcon,
  CheckCircleIcon, ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

interface CohortData {
  members: CohortMembership[]
  pods: Pod[]
  approved: Member[]
  dash: CohortDashboard | null
  loading: boolean
}

const loading = ref(true)
const cohorts = ref<Cohort[]>([])
const expandedId = ref<string | null>(null)
const data = reactive<Record<string, CohortData>>({})
const selected = reactive<Record<string, string[]>>({}) // cohortId -> membership ids
const targetPod = reactive<Record<string, string>>({}) // cohortId -> pod id
const busy = reactive<Record<string, boolean>>({})
const toast = ref('')

// Template-only accessors — every call site below is already guarded by
// `expandedId === c.id` + a loaded check, so the record entry is guaranteed
// to exist at render time; this just gives TS a non-undefined view of it.
function d(id: string): CohortData {
  return data[id]!
}
function sel(id: string): string[] {
  return selected[id] || []
}

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

async function loadCohorts() {
  const res = await adminEngineApi.listCohorts()
  cohorts.value = res.data ?? []
}
onMounted(async () => {
  try {
    await loadCohorts()
    if (cohorts.value[0]) toggleExpand(cohorts.value[0].id)
  } finally {
    loading.value = false
  }
})

async function loadCohortData(id: string) {
  data[id] = data[id] || { members: [], pods: [], approved: [], dash: null, loading: true }
  data[id].loading = true
  const [m, p, approved, dash] = await Promise.all([
    adminEngineApi.listCohortMembers(id),
    adminEngineApi.listPods(id),
    adminApi.getMembers({ status: 'approved', limit: 200 }),
    adminEngineApi.getCohortDashboard(id)
  ])
  data[id].members = m.data ?? []
  data[id].pods = p.data ?? []
  data[id].approved = approved.data ?? []
  data[id].dash = dash.data ?? null
  data[id].loading = false
  selected[id] = []
}

// ---- control-room helpers ----
// Rows come from the dashboard when it loaded and fall back to the plain
// membership list, so a dashboard failure degrades the extra columns rather
// than emptying the table.
function rows(cd: CohortData): CohortMemberRow[] {
  return cd.dash?.members ?? []
}
function pct(done: number, total: number) {
  return total > 0 ? Math.round((done / total) * 100) : 0
}
// Induction is judged on required tasks only — the same rule the backend uses
// to flip a member to 'inducted'.
function inductionLabel(r: CohortMemberRow) {
  if (r.induction_total === 0) return 'No track'
  return `${r.induction_done}/${r.induction_total}`
}
function shortDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
function sinceLabel(iso?: string | null) {
  if (!iso) return 'never'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'today'
  if (days === 1) return '1d ago'
  return `${days}d ago`
}
// 14 days with no activity is the idle threshold pinned in IMPACT_TRACKING.md.
function isIdle(iso?: string | null) {
  if (!iso) return true
  return Date.now() - new Date(iso).getTime() > 14 * 86400000
}

function toggleExpand(id: string) {
  if (expandedId.value === id) {
    expandedId.value = null
    return
  }
  expandedId.value = id
  if (!data[id]) loadCohortData(id)
}

function memberName(m: CohortMembership) {
  return m.member?.profile?.full_name || m.member?.email || m.member_id.slice(0, 8)
}
function podName(d: CohortData, podId?: string | null) {
  if (!podId) return null
  return d.pods.find((p) => p.id === podId)?.name ?? null
}
function acceptableFor(d: CohortData) {
  const ids = new Set(d.members.map((m) => m.member_id))
  return d.approved.filter((a) => !ids.has(a.id))
}
function unassignedCount(d: CohortData) {
  return d.members.filter((m) => !m.pod_id).length
}

const stateStyles: Record<string, string> = {
  accepted: 'bg-gray-100 text-gray-700',
  inducted: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  withdrawn: 'bg-red-100 text-red-700'
}
const stateOrder: MembershipState[] = ['accepted', 'inducted', 'active']
function nextState(m: CohortMembership): MembershipState | null {
  const i = stateOrder.indexOf(m.state)
  return i >= 0 && i < stateOrder.length - 1 ? (stateOrder[i + 1] ?? null) : null
}

// ---- selection ----
function isSelected(cid: string, mid: string) {
  return (selected[cid] || []).includes(mid)
}
function toggleSelect(cid: string, mid: string) {
  const arr = selected[cid] || (selected[cid] = [])
  const i = arr.indexOf(mid)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(mid)
}
function selectAll(cid: string, d: CohortData) {
  selected[cid] = d.members.map((m) => m.id)
}
function clearSelection(cid: string) {
  selected[cid] = []
}

// ---- actions ----
async function accept(cid: string, memberId: string) {
  busy[cid] = true
  try {
    await adminEngineApi.acceptIntoCohort(memberId)
    await loadCohortData(cid)
    flash('Member accepted')
  } finally {
    busy[cid] = false
  }
}
async function advanceState(cid: string, m: CohortMembership) {
  const ns = nextState(m)
  if (!ns) return
  await adminEngineApi.updateMembershipState(m.id, ns)
  await loadCohortData(cid)
  flash(`Marked ${ns}`)
}
async function bulkAssign(cid: string) {
  const pod = targetPod[cid]
  const ids = selected[cid] || []
  if (!pod || !ids.length) {
    flash('Pick a pod and at least one member')
    return
  }
  busy[cid] = true
  try {
    const res = await adminEngineApi.bulkAssignPod(pod, ids)
    await loadCohortData(cid)
    flash(`Assigned ${res.data?.assigned ?? ids.length} to pod`)
  } finally {
    busy[cid] = false
  }
}
async function autoAssign(cid: string) {
  busy[cid] = true
  try {
    const res = await adminEngineApi.autoAssignPods(cid)
    await loadCohortData(cid)
    flash(`Distributed ${res.data?.assigned ?? 0} member(s) across pods`)
  } catch (e: unknown) {
    flash((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not distribute')
  } finally {
    busy[cid] = false
  }
}
// ---- induction ceremony ----
const inductModal = ref(false)
const inductCohortId = ref('')
const inducting = ref(false)
function openInductModal(cid: string) {
  inductCohortId.value = cid
  inductModal.value = true
}
async function runInduction() {
  inducting.value = true
  try {
    const res = await adminEngineApi.runInduction(inductCohortId.value)
    await loadCohortData(inductCohortId.value)
    inductModal.value = false
    flash(`Inducted ${res.data?.inducted ?? 0} — ${res.data?.revealed ?? 0} Senpai IDs revealed`)
  } catch (e: unknown) {
    flash((e as { response?: { data?: { message?: string } } }).response?.data?.message || 'Could not run induction')
  } finally {
    inducting.value = false
  }
}
// Everyone still 'accepted' is inducted, finished or not — induction is a
// welcome, not an exam.
function pendingInduction(cd: CohortData) {
  return cd.dash?.accepted ?? 0
}

// ---- create cohort ----
const cohortModal = ref(false)
const savingCohort = ref(false)
const cohortForm = reactive({ name: '', description: '', induction_date: '' })
function openCohortModal() {
  cohortForm.name = ''
  cohortForm.description = ''
  cohortForm.induction_date = ''
  cohortModal.value = true
}
async function createCohort() {
  if (!cohortForm.name) return
  savingCohort.value = true
  try {
    await adminEngineApi.createCohort({
      name: cohortForm.name,
      description: cohortForm.description || undefined,
      induction_date: cohortForm.induction_date ? new Date(cohortForm.induction_date).toISOString() : undefined
    })
    cohortModal.value = false
    await loadCohorts()
    flash(`${cohortForm.name} created`)
  } finally {
    savingCohort.value = false
  }
}

// ---- edit cohort ----
const editCohortModal = ref(false)
const savingCohortEdit = ref(false)
const editingCohortId = ref('')
const cohortStatusOptions = [
  { value: 'forming', label: 'Forming' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' }
]
const editCohortForm = reactive({
  name: '',
  slug: '',
  sequence: 0,
  status: 'forming' as Cohort['status'],
  description: '',
  induction_date: ''
})
function openEditCohortModal(c: Cohort) {
  editingCohortId.value = c.id
  editCohortForm.name = c.name
  editCohortForm.slug = c.slug
  editCohortForm.sequence = c.sequence
  editCohortForm.status = c.status
  editCohortForm.description = c.description || ''
  editCohortForm.induction_date = c.induction_date ? c.induction_date.slice(0, 10) : ''
  editCohortModal.value = true
}
async function saveCohortEdit() {
  if (!editCohortForm.name || !editCohortForm.slug) return
  savingCohortEdit.value = true
  try {
    await adminEngineApi.updateCohort(editingCohortId.value, {
      name: editCohortForm.name,
      slug: editCohortForm.slug,
      sequence: editCohortForm.sequence,
      status: editCohortForm.status,
      description: editCohortForm.description || undefined,
      induction_date: editCohortForm.induction_date ? new Date(editCohortForm.induction_date).toISOString() : undefined
    })
    editCohortModal.value = false
    await loadCohorts()
    flash('Cohort updated')
  } finally {
    savingCohortEdit.value = false
  }
}

// ---- create / edit pod (one modal, two modes) ----
const podModal = ref(false)
const savingPod = ref(false)
const podCohortId = ref('')
const editingPodId = ref<string | null>(null)
const podForm = reactive({ name: '', description: '', whatsapp_invite_url: '', region: '', capacity: 16 })
function openPodModal(cid: string) {
  editingPodId.value = null
  podCohortId.value = cid
  podForm.name = ''
  podForm.description = ''
  podForm.whatsapp_invite_url = ''
  podForm.region = ''
  podForm.capacity = 16
  podModal.value = true
}
function openEditPodModal(cid: string, p: Pod) {
  editingPodId.value = p.id
  podCohortId.value = cid
  podForm.name = p.name
  podForm.description = p.description || ''
  podForm.whatsapp_invite_url = p.whatsapp_invite_url || ''
  podForm.region = p.region || ''
  podForm.capacity = p.capacity || 16
  podModal.value = true
}
async function savePod() {
  if (!podForm.name) return
  savingPod.value = true
  try {
    const payload = {
      name: podForm.name,
      description: podForm.description || undefined,
      whatsapp_invite_url: podForm.whatsapp_invite_url || undefined,
      region: podForm.region || undefined,
      capacity: podForm.capacity || undefined
    }
    if (editingPodId.value) {
      await adminEngineApi.updatePod(editingPodId.value, payload)
      flash('Pod updated')
    } else {
      await adminEngineApi.createPod(podCohortId.value, payload)
      flash('Pod created')
    }
    podModal.value = false
    await loadCohortData(podCohortId.value)
  } finally {
    savingPod.value = false
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Cohorts</h1>
          <p class="text-sm text-gray-500 mt-0.5">Each cohort holds its pods and members. Expand one to manage it.</p>
        </div>
        <BaseButton @click="openCohortModal"><PlusIcon class="h-4 w-4 mr-1" /> New cohort</BaseButton>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!cohorts.length" class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
        <p class="text-gray-600">No cohorts yet.</p>
        <BaseButton class="mt-4" @click="openCohortModal">Create your first cohort</BaseButton>
      </div>

      <!-- Cohort list -->
      <div v-else class="space-y-3">
        <div v-for="c in cohorts" :key="c.id" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <!-- Cohort header row -->
          <button class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 text-left" @click="toggleExpand(c.id)">
            <div class="flex items-center gap-3">
              <ChevronRightIcon class="h-5 w-5 text-gray-400 transition-transform" :class="expandedId === c.id ? 'rotate-90' : ''" />
              <div>
                <p class="font-semibold text-gray-900">{{ c.name }}</p>
                <p class="text-xs text-gray-500">
                  <span v-if="data[c.id] && d(c.id).dash">
                    {{ d(c.id).dash!.accepted + d(c.id).dash!.inducted + d(c.id).dash!.active }} of
                    {{ d(c.id).dash!.target_size }} · {{ d(c.id).pods.length }}
                    {{ d(c.id).pods.length === 1 ? 'pod' : 'pods' }}
                  </span>
                  <span v-else>Tap to manage</span>
                </p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span v-if="c.induction_date" class="text-xs text-gray-400">Induction {{ new Date(c.induction_date).toLocaleDateString() }}</span>
              <span class="text-xs px-2.5 py-1 rounded-full capitalize" :class="c.status === 'forming' ? 'bg-senpai-100 text-senpai-700' : 'bg-gray-100 text-gray-600'">{{ c.status }}</span>
              <button class="p-1.5 text-gray-400 hover:text-senpai-600 rounded-lg hover:bg-gray-100" title="Edit cohort" @click.stop="openEditCohortModal(c)">
                <PencilIcon class="h-4 w-4" />
              </button>
            </div>
          </button>

          <!-- Expanded -->
          <div v-if="expandedId === c.id" class="border-t border-gray-100">
            <div v-if="!data[c.id] || d(c.id).loading" class="flex justify-center py-10"><LoadingSpinner /></div>
            <div v-else class="p-5 space-y-8">
              <!-- Control room: is this intake on track? The old page showed
                   only inventory (who is in, which pod) and none of the
                   signals that can still be acted on while intake is open. -->
              <section v-if="d(c.id).dash">
                <p v-if="c.description" class="text-sm text-gray-600 mb-4 max-w-2xl">{{ c.description }}</p>

                <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                  <div class="bg-white px-4 py-3">
                    <p class="text-xs text-gray-500 flex items-center gap-1"><ClockIcon class="h-3.5 w-3.5" /> Intake closes</p>
                    <p class="text-xl font-bold tabular-nums mt-1"
                       :class="d(c.id).dash!.is_open ? 'text-gray-900' : 'text-gray-400'">
                      {{ d(c.id).dash!.is_open ? (d(c.id).dash!.days_left ?? '—') : 'Closed' }}
                      <span v-if="d(c.id).dash!.is_open && d(c.id).dash!.days_left != null" class="text-xs font-normal text-gray-500">{{ d(c.id).dash!.days_left === 1 ? 'day' : 'days' }}</span>
                    </p>
                  </div>
                  <div class="bg-white px-4 py-3">
                    <p class="text-xs text-gray-500 flex items-center gap-1"><UsersIcon class="h-3.5 w-3.5" /> Accepted</p>
                    <p class="text-xl font-bold text-gray-900 tabular-nums mt-1">
                      {{ d(c.id).dash!.accepted + d(c.id).dash!.inducted + d(c.id).dash!.active }}
                      <span class="text-xs font-normal text-gray-500">of {{ d(c.id).dash!.target_size }}</span>
                    </p>
                  </div>
                  <div class="bg-white px-4 py-3">
                    <p class="text-xs text-gray-500 flex items-center gap-1"><CheckCircleIcon class="h-3.5 w-3.5" /> Baseline captured</p>
                    <p class="text-xl font-bold tabular-nums mt-1"
                       :class="d(c.id).dash!.baseline_captured < d(c.id).members.length ? 'text-amber-600' : 'text-gray-900'">
                      {{ d(c.id).dash!.baseline_captured }}
                      <span class="text-xs font-normal text-gray-500">of {{ d(c.id).members.length }}</span>
                    </p>
                  </div>
                  <div class="bg-white px-4 py-3">
                    <p class="text-xs text-gray-500 flex items-center gap-1"><InboxArrowDownIcon class="h-3.5 w-3.5" /> Waiting on you</p>
                    <p class="text-xl font-bold tabular-nums mt-1"
                       :class="d(c.id).dash!.awaiting_review ? 'text-senpai-600' : 'text-gray-900'">
                      {{ d(c.id).dash!.awaiting_review }}
                      <span class="text-xs font-normal text-gray-500">{{ d(c.id).dash!.awaiting_review === 1 ? 'hand-in' : 'hand-ins' }}</span>
                    </p>
                  </div>
                </div>

                <!-- Front of the funnel. Both numbers live on other pages, so
                     without this the intake looks healthier than it is. -->
                <div class="flex flex-wrap items-center gap-x-5 gap-y-1 mt-3 text-xs text-gray-500">
                  <RouterLink to="/admin/applications" class="hover:text-senpai-600">
                    <span class="font-semibold text-gray-900">{{ d(c.id).dash!.pending_applications }}</span> awaiting review
                  </RouterLink>
                  <span><span class="font-semibold text-gray-900">{{ d(c.id).dash!.approved_not_in_cohort }}</span> approved, not placed</span>
                  <span><span class="font-semibold text-gray-900">{{ d(c.id).dash!.inducted + d(c.id).dash!.active }}</span> inducted</span>
                  <span v-if="!c.induction_date" class="text-amber-600 flex items-center gap-1">
                    <ExclamationTriangleIcon class="h-3.5 w-3.5" /> No induction date set
                  </span>
                </div>

                <!-- The ceremony. Nothing else confers a Senpai ID, so this
                     button is the only path from 'accepted' to a real member. -->
                <div v-if="pendingInduction(d(c.id))" class="mt-4 flex flex-wrap items-center gap-3 border border-senpai-200 bg-senpai-50 rounded-xl px-4 py-3">
                  <div class="flex-1 min-w-[16rem]">
                    <p class="text-sm font-medium text-gray-900">
                      {{ pendingInduction(d(c.id)) }}
                      {{ pendingInduction(d(c.id)) === 1 ? 'member is' : 'members are' }} waiting to be inducted
                    </p>
                    <p class="text-xs text-gray-600 mt-0.5">Run this on induction night — it reveals their Senpai IDs.</p>
                  </div>
                  <BaseButton :disabled="inducting" @click="openInductModal(c.id)">Run induction</BaseButton>
                </div>
              </section>

              <!-- Pods -->
              <section>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><RectangleStackIcon class="h-4 w-4 text-gray-400" /> Pods</h3>
                  <button class="text-sm text-senpai-600 font-medium hover:text-senpai-700" @click="openPodModal(c.id)">+ Add pod</button>
                </div>
                <div v-if="d(c.id).pods.length" class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    v-for="p in d(c.id).pods"
                    :key="p.id"
                    class="group text-left border border-gray-200 rounded-xl p-4 hover:border-senpai-400 hover:shadow-sm transition-colors"
                    @click="openEditPodModal(c.id, p)"
                  >
                    <div class="flex items-start justify-between">
                      <p class="font-medium text-gray-900">{{ p.name }}</p>
                      <div class="flex items-center gap-2 shrink-0">
                        <span class="text-xs text-gray-400">{{ d(c.id).members.filter((m) => m.pod_id === p.id).length }}/{{ p.capacity }}</span>
                        <PencilIcon class="h-3.5 w-3.5 text-gray-300 group-hover:text-senpai-500" />
                      </div>
                    </div>
                    <p v-if="p.description" class="text-xs text-gray-500 mt-1 line-clamp-2">{{ p.description }}</p>
                    <p v-if="p.region" class="flex items-center gap-1 text-xs text-gray-400 mt-2"><MapPinIcon class="h-3.5 w-3.5" /> {{ p.region }}</p>
                    <p v-if="p.whatsapp_invite_url" class="flex items-center gap-1 text-xs text-green-600 mt-1.5">
                      <ChatBubbleLeftRightIcon class="h-3.5 w-3.5" /> WhatsApp link added
                    </p>
                    <p v-else class="flex items-center gap-1 text-xs text-gray-400 mt-1.5 italic">
                      <ChatBubbleLeftRightIcon class="h-3.5 w-3.5" /> No WhatsApp link yet — click to add one
                    </p>
                  </button>
                </div>
                <p v-else class="text-sm text-gray-500">No pods yet — add a couple, then assign members.</p>
              </section>

              <!-- Members + pod assignment at scale -->
              <section>
                <div class="flex items-center justify-between mb-3">
                  <h3 class="flex items-center gap-2 text-sm font-semibold text-gray-900"><UsersIcon class="h-4 w-4 text-gray-400" /> Members</h3>
                  <button
                    v-if="d(c.id).pods.length && unassignedCount(d(c.id))"
                    class="text-sm text-senpai-600 font-medium hover:text-senpai-700 inline-flex items-center gap-1"
                    :disabled="busy[c.id]"
                    @click="autoAssign(c.id)"
                  >
                    <SparklesIcon class="h-4 w-4" /> Auto-distribute {{ unassignedCount(d(c.id)) }}
                  </button>
                </div>

                <div v-if="d(c.id).members.length" class="border border-gray-200 rounded-xl overflow-hidden">
                  <!-- bulk toolbar -->
                  <div v-if="sel(c.id).length" class="flex items-center gap-3 bg-senpai-50 px-4 py-2.5 text-sm">
                    <span class="font-medium text-senpai-800">{{ sel(c.id).length }} selected</span>
                    <select v-model="targetPod[c.id]" class="border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white">
                      <option value="">Choose pod…</option>
                      <option v-for="p in d(c.id).pods" :key="p.id" :value="p.id">{{ p.name }}</option>
                    </select>
                    <button class="px-3 py-1 bg-senpai-600 text-white rounded-lg font-medium hover:bg-senpai-700" :disabled="busy[c.id]" @click="bulkAssign(c.id)">Assign</button>
                    <button class="text-gray-500 hover:text-gray-700 ml-auto" @click="clearSelection(c.id)">Clear</button>
                  </div>

                  <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide text-left">
                      <tr>
                        <th class="px-4 py-2 w-10">
                          <input type="checkbox" class="rounded border-gray-300 text-senpai-600" :checked="sel(c.id).length === d(c.id).members.length && d(c.id).members.length > 0" @change="($event.target as HTMLInputElement).checked ? selectAll(c.id, d(c.id)) : clearSelection(c.id)" />
                        </th>
                        <th class="px-4 py-2 font-medium">Member</th>
                        <th class="px-4 py-2 font-medium">State</th>
                        <th class="px-4 py-2 font-medium">Induction</th>
                        <th class="px-4 py-2 font-medium">Baseline</th>
                        <th class="px-4 py-2 font-medium">Pod</th>
                        <th class="px-4 py-2 font-medium">Last active</th>
                        <th class="px-4 py-2 font-medium text-right"></th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                      <tr v-for="m in d(c.id).members" :key="m.id" class="hover:bg-gray-50">
                        <td class="px-4 py-2"><input type="checkbox" class="rounded border-gray-300 text-senpai-600" :checked="isSelected(c.id, m.id)" @change="toggleSelect(c.id, m.id)" /></td>
                        <td class="px-4 py-2">
                          <p class="font-medium text-gray-900">{{ memberName(m) }}</p>
                          <p class="text-xs text-gray-400">Joined {{ shortDate(m.accepted_at) }}</p>
                        </td>
                        <td class="px-4 py-2"><span class="text-xs px-2 py-0.5 rounded-full capitalize" :class="stateStyles[m.state]">{{ m.state }}</span></td>

                        <!-- Induction progress, required tasks only, with the
                             review backlog called out — nothing completes
                             without a reviewer accepting the hand-in. -->
                        <td class="px-4 py-2">
                          <template v-for="r in rows(d(c.id)).filter((x) => x.member_id === m.member_id)" :key="r.member_id">
                            <div class="flex items-center gap-2">
                              <div class="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div class="h-full bg-senpai-500" :style="{ width: pct(r.induction_done, r.induction_total) + '%' }" />
                              </div>
                              <span class="text-xs text-gray-600 tabular-nums">{{ inductionLabel(r) }}</span>
                            </div>
                            <p v-if="r.awaiting_review" class="text-xs text-senpai-600 mt-0.5">{{ r.awaiting_review }} to review</p>
                          </template>
                        </td>

                        <td class="px-4 py-2">
                          <template v-for="r in rows(d(c.id)).filter((x) => x.member_id === m.member_id)" :key="r.member_id">
                            <CheckCircleIcon v-if="r.baseline_captured" class="h-4 w-4 text-green-600" />
                            <span v-else class="text-xs text-amber-600">Missing</span>
                          </template>
                        </td>

                        <td class="px-4 py-2 text-gray-600">{{ podName(d(c.id), m.pod_id) || '—' }}</td>

                        <td class="px-4 py-2">
                          <template v-for="r in rows(d(c.id)).filter((x) => x.member_id === m.member_id)" :key="r.member_id">
                            <span class="text-xs" :class="isIdle(r.last_active_at) ? 'text-amber-600' : 'text-gray-500'">
                              {{ sinceLabel(r.last_active_at) }}
                            </span>
                          </template>
                        </td>

                        <td class="px-4 py-2 text-right">
                          <button v-if="nextState(m)" class="text-senpai-600 hover:text-senpai-700 text-xs font-medium inline-flex items-center gap-1" @click="advanceState(c.id, m)">Mark {{ nextState(m) }} <ArrowRightIcon class="h-3 w-3" /></button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-500">No members in this cohort yet.</p>

                <!-- accept approved members -->
                <div v-if="acceptableFor(d(c.id)).length" class="mt-3 bg-gray-50 rounded-xl p-3">
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Approved, not yet in a cohort</p>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="am in acceptableFor(d(c.id))" :key="am.id" class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm hover:border-senpai-400" :disabled="busy[c.id]" @click="accept(c.id, am.id)">
                      <PlusIcon class="h-3.5 w-3.5 text-senpai-600" /> {{ am.profile?.full_name || am.email }}
                    </button>
                  </div>
                </div>
              </section>

              <!-- Tasks link (tasks live on their own page) -->
              <RouterLink :to="`/admin/tasks?cohort=${c.id}`" class="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 hover:border-senpai-300">
                <span class="flex items-center gap-2 text-sm font-medium text-gray-900"><ClipboardDocumentListIcon class="h-4 w-4 text-gray-400" /> Manage this cohort's tasks</span>
                <ArrowRightIcon class="h-4 w-4 text-gray-400" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Induction ceremony confirmation -->
    <BaseModal :show="inductModal" title="Run induction" subtitle="This is the ceremony — it can't be undone." @close="inductModal = false">
      <p class="text-sm text-gray-600">
        Every member still waiting will be marked <strong>inducted</strong>, and their Senpai ID options
        will be revealed so they can claim a handle.
      </p>
      <p class="text-sm text-gray-600 mt-3">
        Members who haven't finished their induction tasks are included — their outstanding tasks stay
        assigned and still need completing.
      </p>
      <div class="flex justify-end gap-2 mt-6">
        <BaseButton variant="secondary" @click="inductModal = false">Cancel</BaseButton>
        <BaseButton :loading="inducting" @click="runInduction">Induct the cohort</BaseButton>
      </div>
    </BaseModal>

    <!-- Create cohort modal -->
    <BaseModal :show="cohortModal" title="New cohort" subtitle="Just give it a name — we handle the rest." @close="cohortModal = false">
      <div class="space-y-4">
        <BaseInput v-model="cohortForm.name" label="Name" placeholder="Cohort Beta" />
        <BaseTextarea v-model="cohortForm.description" label="Description" :rows="2" placeholder="What's this cohort about? (optional)" />
        <BaseInput v-model="cohortForm.induction_date" type="date" label="Induction date (optional)" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="cohortModal = false">Cancel</button>
        <BaseButton :loading="savingCohort" @click="createCohort">Create cohort</BaseButton>
      </template>
    </BaseModal>

    <!-- Edit cohort modal -->
    <BaseModal :show="editCohortModal" title="Edit cohort" subtitle="Update details, status, and induction date." @close="editCohortModal = false">
      <div class="space-y-4">
        <BaseInput v-model="editCohortForm.name" label="Name" />
        <BaseInput v-model="editCohortForm.slug" label="Slug" />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="editCohortForm.sequence" type="number" label="Sequence" />
          <BaseSelect v-model="editCohortForm.status" :options="cohortStatusOptions" label="Status" />
        </div>
        <BaseTextarea v-model="editCohortForm.description" label="Description" :rows="2" placeholder="What's this cohort about? (optional)" />
        <BaseInput v-model="editCohortForm.induction_date" type="date" label="Induction date (optional)" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="editCohortModal = false">Cancel</button>
        <BaseButton :loading="savingCohortEdit" @click="saveCohortEdit">Save changes</BaseButton>
      </template>
    </BaseModal>

    <!-- Create / edit pod modal -->
    <BaseModal
      :show="podModal"
      :title="editingPodId ? 'Edit pod' : 'New pod'"
      :subtitle="editingPodId ? 'Update this pod\'s details and invite link.' : 'A small peer group within the cohort.'"
      @close="podModal = false"
    >
      <div class="space-y-4">
        <BaseInput v-model="podForm.name" label="Name" placeholder="Pod 1 — The Builders" />
        <BaseTextarea v-model="podForm.description" label="Description" :rows="2" placeholder="This pod's character or focus (optional)" />
        <div class="grid grid-cols-2 gap-4">
          <BaseInput v-model="podForm.region" label="Region / timezone" placeholder="WAT (optional)" />
          <BaseInput v-model="podForm.capacity" type="number" label="Capacity" />
        </div>
        <BaseInput v-model="podForm.whatsapp_invite_url" label="WhatsApp invite link" placeholder="https://chat.whatsapp.com/… (optional)" />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="podModal = false">Cancel</button>
        <BaseButton :loading="savingPod" @click="savePod">{{ editingPodId ? 'Save changes' : 'Create pod' }}</BaseButton>
      </template>
    </BaseModal>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AdminLayout>
</template>
