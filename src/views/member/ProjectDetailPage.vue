<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { engineApi, membersApi, skillsApi } from '@/api'
import type { Project, ProjectMember, Task, ProjectStatus, TaskAssignment, TaskKind, HandinType, Activity, Skill, JobRole, ProjectInvite } from '@/types'
import ReviewFormModal from '@/components/reviews/ReviewFormModal.vue'
import { reviewsApi } from '@/api'
import ActivityFeed from '@/components/common/ActivityFeed.vue'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { ArrowLeftIcon, LinkIcon, RocketLaunchIcon, PlusIcon, XMarkIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'
import ProjectTaskRoster from '@/components/member/ProjectTaskRoster.vue'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const project = ref<Project | null>(null)
const tasks = ref<Task[]>([])
const error = ref('')
const busy = ref(false)
// Joining-as role for the seat — feeds the member's record (phase 2 ratings).
const joinSkillId = ref('')
const allSkills = ref<Skill[]>([])
skillsApi.getSkills().then((res) => { allSkills.value = res.data ?? [] }).catch(() => {})
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

const roster = ref<TaskAssignment[]>([])
const activity = ref<Activity[]>([])
const pendingInvites = ref<ProjectInvite[]>([])

async function load() {
  const res = await engineApi.getProject(route.params.id as string)
  project.value = res.data?.project ?? null
  tasks.value = res.data?.tasks ?? []
  // The work roster and activity are team-only (or admin) — a 403 just means "not yours to see".
  try {
    const r = await engineApi.getProjectRoster(route.params.id as string)
    roster.value = r.data ?? []
  } catch {
    roster.value = []
  }
  try {
    const act = await engineApi.getProjectActivity(route.params.id as string)
    activity.value = act.data ?? []
  } catch {
    activity.value = []
  }
  // Pending invites are only visible to whoever can send them.
  if (project.value && (isCreator.value || authStore.isAdmin)) {
    try {
      const inv = await reviewsApi.getProjectInvites(project.value.id)
      pendingInvites.value = (inv.data || []).filter((i) => i.status === 'pending')
    } catch {
      pendingInvites.value = []
    }
  }
}

// Assignments grouped under their task for the Work section.
const rosterByTask = computed(() => {
  const map: Record<string, TaskAssignment[]> = {}
  for (const a of roster.value) {
    ;(map[a.task_id] ||= []).push(a)
  }
  return map
})

onMounted(async () => {
  try {
    await load()
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Project not found'
  } finally {
    loading.value = false
  }
})

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

const isCreator = computed(() => project.value?.created_by === authStore.member?.id)
const isOnTeam = computed(() => (project.value?.team || []).some((t) => t.member_id === authStore.member?.id))
const canManage = computed(() => isCreator.value || authStore.isAdmin)

const statusCode: Record<ProjectStatus, { label: string; cls: string }> = {
  proposed: { label: 'PROPOSED', cls: 'text-amber-600' },
  active: { label: 'BUILDING', cls: 'text-senpai-700' },
  shipped: { label: 'SHIPPED', cls: 'text-senpai-700' },
  parked: { label: 'PARKED', cls: 'text-gray-400' }
}

async function join() {
  busy.value = true
  try {
    const res = await engineApi.joinProject(project.value!.id, joinSkillId.value ? Number(joinSkillId.value) : undefined)
    flash(res.status ? "You're on the team" : res.message || 'Failed to join')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to join')
  } finally {
    busy.value = false
  }
}
async function leave() {
  if (!confirm('Leave this project team?')) return
  busy.value = true
  try {
    await engineApi.leaveProject(project.value!.id)
    flash('Left the team')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to leave')
  } finally {
    busy.value = false
  }
}
async function park() {
  if (!confirm('Park this project? It can be reactivated later.')) return
  busy.value = true
  try {
    await engineApi.updateProjectStatus(project.value!.id, 'parked')
    flash('Parked')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to park')
  } finally {
    busy.value = false
  }
}
async function reactivate() {
  busy.value = true
  try {
    await engineApi.updateProjectStatus(project.value!.id, 'active')
    flash('Back to building')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to reactivate')
  } finally {
    busy.value = false
  }
}

// ---- add/remove teammates directly (creator/admin) — not everyone waits
// around for someone to self-join; whoever's running the project can just
// pull the person they want onto the team. ----
const addMemberModal = ref(false)
const memberSearch = ref('')
const memberResults = ref<{ id: string; full_name: string; photo_url?: string }[]>([])
const searchingMembers = ref(false)
let memberSearchTimeout: ReturnType<typeof setTimeout>
function openAddMember() {
  memberSearch.value = ''
  memberResults.value = []
  addMemberModal.value = true
}
async function searchMembers() {
  if (!memberSearch.value.trim()) { memberResults.value = []; return }
  searchingMembers.value = true
  try {
    const res = await membersApi.getMembers({ search: memberSearch.value.trim(), limit: 8 })
    const onTeamIds = new Set((project.value?.team || []).map((t) => t.member_id))
    memberResults.value = (res.data || [])
      .filter((m) => !onTeamIds.has(m.id))
      .map((m) => {
        const raw = m as any
        const profile = raw.profile
        return {
          id: raw.id,
          full_name: raw.full_name || profile?.full_name || '',
          photo_url: raw.photo_url || profile?.photo_url
        }
      })
  } finally {
    searchingMembers.value = false
  }
}
function onMemberSearchInput() {
  clearTimeout(memberSearchTimeout)
  memberSearchTimeout = setTimeout(searchMembers, 300)
}
async function addMember(memberId: string, name: string) {
  busy.value = true
  try {
    const res = await engineApi.addTeamMember(project.value!.id, memberId)
    flash(res.status ? `${name} added to the team` : res.message || 'Failed to add teammate')
    if (res.status) addMemberModal.value = false
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to add teammate')
  } finally {
    busy.value = false
  }
}
async function removeMember(memberId: string, name: string) {
  if (!confirm(`Remove ${name} from the team?`)) return
  busy.value = true
  try {
    await engineApi.removeTeamMember(project.value!.id, memberId)
    flash(`${name} removed`)
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to remove teammate')
  } finally {
    busy.value = false
  }
}

// ---- invite a specific member to a seat, with a role attached, instead of
// adding them directly — they get a real choice to accept or decline. ----
const inviteModal = ref(false)
const inviteSearch = ref('')
const inviteResults = ref<{ id: string; full_name: string; photo_url?: string }[]>([])
const searchingInvitees = ref(false)
const invitee = ref<{ id: string; full_name: string } | null>(null)
const inviteJobRoleId = ref<number | null>(null)
const inviteNote = ref('')
const inviting = ref(false)
const jobRoles = ref<JobRole[]>([])
let inviteSearchTimeout: ReturnType<typeof setTimeout>
function openInvite() {
  inviteSearch.value = ''
  inviteResults.value = []
  invitee.value = null
  inviteJobRoleId.value = null
  inviteNote.value = ''
  inviteModal.value = true
  if (!jobRoles.value.length) reviewsApi.listJobRoles().then((res) => { jobRoles.value = res.data || [] })
}
async function searchInvitees() {
  if (!inviteSearch.value.trim()) { inviteResults.value = []; return }
  searchingInvitees.value = true
  try {
    const res = await membersApi.getMembers({ search: inviteSearch.value.trim(), limit: 8 })
    const onTeamIds = new Set((project.value?.team || []).map((t) => t.member_id))
    const alreadyInvitedIds = new Set(pendingInvites.value.map((i) => i.member_id))
    inviteResults.value = (res.data || [])
      .filter((m) => !onTeamIds.has(m.id) && !alreadyInvitedIds.has(m.id))
      .map((m) => {
        const raw = m as any
        return { id: raw.id, full_name: raw.full_name || raw.profile?.full_name || '', photo_url: raw.photo_url || raw.profile?.photo_url }
      })
  } finally {
    searchingInvitees.value = false
  }
}
function onInviteSearchInput() {
  clearTimeout(inviteSearchTimeout)
  inviteSearchTimeout = setTimeout(searchInvitees, 300)
}
function pickInvitee(m: { id: string; full_name: string }) {
  invitee.value = m
  inviteResults.value = []
  inviteSearch.value = m.full_name
}
async function sendInvite() {
  if (!invitee.value) return
  inviting.value = true
  try {
    const res = await reviewsApi.inviteToProject(project.value!.id, {
      member_id: invitee.value.id,
      job_role_id: inviteJobRoleId.value ?? undefined,
      note: inviteNote.value.trim() || undefined
    })
    flash(res.status ? `Invite sent to ${invitee.value.full_name}` : res.message || 'Failed to send invite')
    if (res.status) inviteModal.value = false
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to send invite')
  } finally {
    inviting.value = false
  }
}

// ---- peer tasks: teammates create, assign, and review each other's work ----
const addTaskModal = ref(false)
const addingTask = ref(false)
const addTaskError = ref('')
const taskForm = ref({
  title: '',
  description: '',
  kind: 'build' as TaskKind,
  handin_type: 'link' as HandinType,
  due_at: '',
  assignee_ids: [] as string[]
})
const kindOptions = ['build', 'research', 'publish', 'portfolio', 'custom'].map((k) => ({ value: k, label: (k[0] ?? '').toUpperCase() + k.slice(1) }))
const handinOptions = [
  { value: 'none', label: 'Mark as done (no hand-in)' },
  { value: 'link', label: 'A link' },
  { value: 'text', label: 'Written text' },
  { value: 'file', label: 'A file' }
]
function openAddTask() {
  taskForm.value = { title: '', description: '', kind: 'build', handin_type: 'link', due_at: '', assignee_ids: [] }
  addTaskError.value = ''
  addTaskModal.value = true
}
function toggleAssignee(memberId: string) {
  const i = taskForm.value.assignee_ids.indexOf(memberId)
  if (i >= 0) taskForm.value.assignee_ids.splice(i, 1)
  else taskForm.value.assignee_ids.push(memberId)
}
async function submitAddTask() {
  addTaskError.value = ''
  if (!taskForm.value.title.trim()) { addTaskError.value = 'Give the task a title.'; return }
  if (!taskForm.value.description.trim()) { addTaskError.value = 'Say what done looks like.'; return }
  addingTask.value = true
  try {
    const res = await engineApi.createProjectTask(project.value!.id, {
      title: taskForm.value.title,
      description: taskForm.value.description,
      kind: taskForm.value.kind,
      handin_type: taskForm.value.handin_type,
      due_at: taskForm.value.due_at ? new Date(taskForm.value.due_at).toISOString() : undefined,
      assignee_ids: taskForm.value.assignee_ids.length ? taskForm.value.assignee_ids : undefined
    })
    if (res.status) {
      addTaskModal.value = false
      flash('Task created and assigned')
      await load()
    } else {
      addTaskError.value = res.message || 'Failed to create task'
    }
  } catch (e: any) {
    addTaskError.value = e.response?.data?.message || 'Failed to create task'
  } finally {
    addingTask.value = false
  }
}
const reviewingId = ref<string | null>(null)
async function peerReview(a: TaskAssignment, status: 'completed' | 'returned') {
  reviewingId.value = a.id
  try {
    const res = await engineApi.peerReviewAssignment(a.id, status)
    flash(res.status ? (status === 'completed' ? 'Marked complete' : 'Returned for changes') : res.message || 'Review failed')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Review failed')
  } finally {
    reviewingId.value = null
  }
}

// ---- rate a teammate once the project has shipped ----
const rateModal = ref(false)
const rateTarget = ref<ProjectMember | null>(null)
function openRateTeammate(tm: ProjectMember) {
  rateTarget.value = tm
  rateModal.value = true
}

// ---- ship ----
const shipModal = ref(false)
const shipping = ref(false)
const shipError = ref('')
const outcomeUrl = ref('')
async function ship() {
  shipError.value = ''
  if (!outcomeUrl.value.trim()) {
    shipError.value = 'The outcome link is the whole point of shipping — add one.'
    return
  }
  shipping.value = true
  try {
    const res = await engineApi.updateProjectStatus(project.value!.id, 'shipped', outcomeUrl.value.trim())
    if (res.status) {
      shipModal.value = false
      flash('Shipped 🎉')
      await load()
    } else {
      shipError.value = res.message || 'Failed to ship'
    }
  } catch (e: any) {
    shipError.value = e.response?.data?.message || 'Failed to ship'
  } finally {
    shipping.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterLink to="/projects" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to Projects
      </RouterLink>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!project" class="text-center py-12 bg-white rounded-2xl border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Project not found</h3>
        <p class="mt-2 text-gray-600">{{ error }}</p>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-6 items-start">
        <!-- Main column -->
        <div class="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
          <div class="flex items-start justify-between gap-3 pb-6 border-b border-gray-200">
            <div class="min-w-0">
              <h1 class="text-2xl font-bold text-gray-900">{{ project.title }}</h1>
              <p class="text-sm text-gray-500 mt-1">
                Proposed by {{ project.creator?.profile?.full_name || 'a member' }} ·
                <span class="font-mono text-xs">{{ new Date(project.created_at).toLocaleDateString() }}</span>
              </p>
            </div>
            <span class="text-xs font-mono font-medium tracking-wide shrink-0" :class="statusCode[project.status].cls">
              {{ statusCode[project.status].label }}
            </span>
          </div>

          <div class="py-6" :class="tasks.length || (project.status === 'shipped' && project.outcome_url) ? 'border-b border-gray-200' : ''">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">The problem</h2>
            <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ project.problem_statement }}</p>
          </div>

          <div v-if="project.status === 'shipped' && project.outcome_url" class="py-6" :class="tasks.length ? 'border-b border-gray-200' : ''">
            <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">What shipped</h2>
            <a
              :href="project.outcome_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-senpai-400 hover:text-senpai-700 transition-colors"
            >
              <LinkIcon class="h-4 w-4" /> {{ project.outcome_url }}
            </a>
            <p v-if="project.shipped_at" class="text-xs font-mono text-gray-400 mt-2">Shipped {{ new Date(project.shipped_at).toLocaleDateString() }}</p>
          </div>

          <div v-if="tasks.length || (isOnTeam && project.status === 'active')" class="pt-6">
            <div class="flex items-center justify-between mb-3">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">The work</h2>
              <button
                v-if="isOnTeam && project.status === 'active'"
                class="inline-flex items-center gap-1 text-sm font-medium text-senpai-600 hover:text-senpai-700"
                @click="openAddTask"
              >
                <PlusIcon class="h-4 w-4" /> Add task
              </button>
            </div>

            <p v-if="!tasks.length" class="text-sm text-gray-500">
              No tasks yet — break the problem down and assign the first piece.
            </p>

            <div v-else class="space-y-3">
              <div v-for="t in tasks" :key="t.id" class="border border-gray-200 rounded-xl overflow-hidden">
                <!-- Every task in the project opens the full task page — any teammate can
                     view the work, comment, and (if they're not the assignee) review it. -->
                <RouterLink :to="`/tasks/${t.id}`" class="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between gap-3">
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate hover:text-senpai-700">{{ t.title }}</p>
                    <p class="text-[11px] font-mono text-gray-400 uppercase">
                      {{ t.kind }}<span v-if="t.due_at"> · due {{ new Date(t.due_at).toLocaleDateString() }}</span>
                    </p>
                  </div>
                  <span class="text-xs font-mono text-gray-400 shrink-0">{{ t.completed_count ?? 0 }}/{{ t.assignment_count ?? 0 }}</span>
                </RouterLink>

                <!-- who's on it, their submission, and peer review — visible to the whole team -->
                <ProjectTaskRoster
                  v-if="rosterByTask[t.id]?.length"
                  :assignments="rosterByTask[t.id] ?? []"
                  :is-on-team="isOnTeam"
                  :current-member-id="authStore.member?.id"
                  :reviewing-id="reviewingId"
                  @review="peerReview"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
          <!-- Team -->
          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center justify-between mb-3">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Team</p>
              <span class="text-xs font-mono text-gray-400">{{ project.team_count }}/{{ project.team_cap }}</span>
            </div>
            <ul class="space-y-2.5">
              <li v-for="tm in project.team" :key="tm.id" class="flex items-center gap-2.5 group">
                <span class="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2" :class="tm.member?.profile?.is_og_member ? 'ring-senpai-300' : 'ring-gray-100'">
                  <img v-if="tm.member?.profile?.photo_url" :src="tm.member.profile.photo_url" :alt="tm.member?.profile?.full_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full flex items-center justify-center text-[10px] font-medium text-gray-500">{{ initials(tm.member?.profile?.full_name || '?') }}</span>
                </span>
                <div class="min-w-0 flex-1">
                  <RouterLink :to="`/members/${tm.member_id}`" class="text-sm font-medium text-gray-900 hover:text-senpai-700 truncate block">
                    {{ tm.member?.profile?.full_name || 'Member' }}
                  </RouterLink>
                  <p v-if="tm.member_id === project.created_by" class="text-[10px] font-mono text-senpai-600">CREATOR</p>
                </div>
                <button
                  v-if="project.status === 'shipped' && isOnTeam && tm.member_id !== authStore.member?.id"
                  class="text-[10px] font-mono font-medium text-senpai-600 hover:text-senpai-700 shrink-0"
                  @click="openRateTeammate(tm)"
                >RATE</button>
                <button
                  v-if="canManage && tm.member_id !== project.created_by"
                  class="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title="Remove from team"
                  @click="removeMember(tm.member_id, tm.member?.profile?.full_name || 'Member')"
                ><XMarkIcon class="h-4 w-4" /></button>
              </li>
            </ul>
            <div v-if="canManage && project.status === 'active' && project.team_count < project.team_cap" class="mt-3 flex gap-2">
              <button
                class="flex-1 inline-flex items-center justify-center gap-1 text-sm font-medium text-senpai-600 hover:text-senpai-700 border border-dashed border-senpai-200 rounded-lg py-2"
                @click="openAddMember"
              ><PlusIcon class="h-4 w-4" /> Add</button>
              <button
                class="flex-1 inline-flex items-center justify-center gap-1 text-sm font-medium text-senpai-600 hover:text-senpai-700 border border-dashed border-senpai-200 rounded-lg py-2"
                @click="openInvite"
              ><EnvelopeIcon class="h-4 w-4" /> Invite</button>
            </div>

            <div v-if="pendingInvites.length" class="mt-4 pt-4 border-t border-gray-100 space-y-2">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Pending invites</p>
              <div v-for="i in pendingInvites" :key="i.id" class="text-xs text-gray-500 flex items-center justify-between gap-2">
                <span class="truncate">{{ i.member_name || 'A member' }}<span v-if="i.job_role_name"> · {{ i.job_role_name }}</span></span>
                <span class="text-gray-300 font-mono shrink-0">SENT</span>
              </div>
            </div>
          </div>

          <!-- Activity — what happened on this project, not just what happened to me. -->
          <div v-if="isOnTeam || authStore.isAdmin" class="bg-white rounded-2xl border border-gray-200 p-5">
            <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Activity</p>
            <ActivityFeed :activities="activity" empty-text="No activity yet." />
          </div>

          <!-- Actions — task/team actions lead; wrapping up a project is a
               deliberately quieter, secondary action, not the default thing
               your eye lands on. -->
          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Actions</p>

            <p v-if="project.status === 'proposed'" class="text-sm text-gray-500">
              Waiting for admin approval — once it's live, members can join the team.
            </p>

            <div v-else-if="project.status === 'active'" class="flex flex-col gap-2">
              <template v-if="!isOnTeam && project.team_count < project.team_cap">
                <!-- The seat's role: what you join this team AS — feeds your record -->
                <select v-model="joinSkillId" class="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700">
                  <option value="">Joining as… (optional role)</option>
                  <option v-for="s in allSkills" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
                </select>
                <BaseButton class="w-full" :loading="busy" @click="join">Join the team</BaseButton>
              </template>
              <p v-else-if="!isOnTeam" class="text-sm text-gray-500">The team is full.</p>

              <template v-if="canManage">
                <div class="pt-3 mt-1 border-t border-gray-100 space-y-2">
                  <p class="text-[10px] font-mono uppercase tracking-widest text-gray-300">Wrap up</p>
                  <BaseButton variant="outline" class="w-full" @click="shipModal = true">
                    <RocketLaunchIcon class="h-4 w-4 mr-2" /> Ship it
                  </BaseButton>
                  <button class="text-sm text-gray-400 hover:text-gray-600" :disabled="busy" @click="park">Park this project</button>
                </div>
              </template>
              <button v-if="isOnTeam && !isCreator" class="text-sm text-gray-400 hover:text-red-600" :disabled="busy" @click="leave">Leave the team</button>
            </div>

            <BaseButton v-if="project.status === 'parked' && canManage" class="w-full" :loading="busy" @click="reactivate">Reactivate</BaseButton>
            <p v-if="project.status === 'shipped'" class="text-sm text-senpai-700">
              Shipped — this one's on the record. 🎉
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Add member modal (creator/admin) -->
    <BaseModal :show="addMemberModal" title="Add a teammate" subtitle="Pull someone onto the team directly — they don't have to find and join it themselves." @close="addMemberModal = false">
      <div class="space-y-3">
        <BaseInput v-model="memberSearch" label="Search members" placeholder="Search by name…" @input="onMemberSearchInput" />
        <p v-if="searchingMembers" class="text-sm text-gray-400">Searching…</p>
        <ul v-else-if="memberResults.length" class="divide-y divide-gray-100 border border-gray-200 rounded-xl">
          <li v-for="m in memberResults" :key="m.id" class="px-3 py-2 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="h-7 w-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img v-if="m.photo_url" :src="m.photo_url" :alt="m.full_name" class="h-full w-full object-cover" />
                <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(m.full_name) }}</span>
              </span>
              <span class="text-sm text-gray-800 truncate">{{ m.full_name }}</span>
            </div>
            <button class="text-sm font-medium text-senpai-600 hover:text-senpai-700 shrink-0" :disabled="busy" @click="addMember(m.id, m.full_name)">Add</button>
          </li>
        </ul>
        <p v-else-if="memberSearch.trim()" class="text-sm text-gray-400">No members found.</p>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="addMemberModal = false">Close</button>
      </template>
    </BaseModal>

    <!-- Invite modal (creator/admin) -->
    <BaseModal :show="inviteModal" title="Invite a teammate" subtitle="They'll see this in their invites and can accept or decline." @close="inviteModal = false">
      <div class="space-y-3">
        <div class="relative">
          <BaseInput v-model="inviteSearch" label="Search members" placeholder="Search by name…" @input="onInviteSearchInput" />
          <ul v-if="inviteResults.length" class="absolute z-10 mt-1 w-full divide-y divide-gray-100 border border-gray-200 rounded-xl bg-white shadow-lg max-h-48 overflow-auto">
            <li v-for="m in inviteResults" :key="m.id" class="px-3 py-2 flex items-center gap-2.5 cursor-pointer hover:bg-gray-50" @click="pickInvitee(m)">
              <span class="h-7 w-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img v-if="m.photo_url" :src="m.photo_url" :alt="m.full_name" class="h-full w-full object-cover" />
                <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(m.full_name) }}</span>
              </span>
              <span class="text-sm text-gray-800 truncate">{{ m.full_name }}</span>
            </li>
          </ul>
          <p v-else-if="searchingInvitees" class="text-sm text-gray-400 mt-1">Searching…</p>
        </div>
        <template v-if="invitee">
          <BaseSelect v-model="inviteJobRoleId" :options="jobRoles.map((r) => ({ value: r.id, label: r.name }))" label="Role (optional)" placeholder="No specific role" />
          <BaseTextarea v-model="inviteNote" label="Note (optional)" :rows="2" placeholder="Why you're pulling them in…" />
        </template>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="inviteModal = false">Cancel</button>
        <BaseButton :loading="inviting" :disabled="!invitee" @click="sendInvite">Send invite</BaseButton>
      </template>
    </BaseModal>

    <!-- Add task modal (teammates only) -->
    <BaseModal
      :show="addTaskModal"
      title="Add a task"
      subtitle="Break the work down and put names on it — the team reviews each other."
      @close="addTaskModal = false"
    >
      <div class="space-y-4">
        <BaseAlert v-if="addTaskError" type="error">{{ addTaskError }}</BaseAlert>
        <BaseInput v-model="taskForm.title" label="Title" placeholder="Draft the landing copy" required />
        <BaseTextarea v-model="taskForm.description" label="What does done look like?" :rows="3" required />
        <div class="grid grid-cols-2 gap-4">
          <BaseSelect v-model="taskForm.kind" :options="kindOptions" label="Kind" />
          <BaseSelect v-model="taskForm.handin_type" :options="handinOptions" label="Hand-in" />
        </div>
        <BaseInput v-model="taskForm.due_at" type="date" label="Due date (optional)" />
        <div>
          <p class="text-sm font-medium text-gray-700 mb-2">Assign to <span class="text-gray-400 font-normal">(nobody selected = the whole team)</span></p>
          <div class="space-y-2">
            <label v-for="tm in project?.team" :key="tm.member_id" class="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                class="rounded border-gray-300 text-senpai-600 focus:ring-senpai-500"
                :checked="taskForm.assignee_ids.includes(tm.member_id)"
                @change="toggleAssignee(tm.member_id)"
              />
              <span class="h-6 w-6 rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img v-if="tm.member?.profile?.photo_url" :src="tm.member.profile.photo_url" :alt="tm.member?.profile?.full_name" class="h-full w-full object-cover" />
                <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(tm.member?.profile?.full_name || '?') }}</span>
              </span>
              <span class="text-sm text-gray-800">{{ tm.member?.profile?.full_name || 'Member' }}</span>
            </label>
          </div>
        </div>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="addTaskModal = false">Cancel</button>
        <BaseButton :loading="addingTask" @click="submitAddTask">Create & assign</BaseButton>
      </template>
    </BaseModal>

    <!-- Ship modal -->
    <BaseModal :show="shipModal" title="Ship this project" subtitle="Shipped means there's something real to show. Link it." @close="shipModal = false">
      <div class="space-y-4">
        <BaseAlert v-if="shipError" type="error">{{ shipError }}</BaseAlert>
        <BaseInput v-model="outcomeUrl" label="Outcome link" placeholder="https://... (the live thing, repo, or write-up)" required />
        <p class="text-xs text-gray-500">This goes on every team member's record — "a Senpai member built this."</p>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="shipModal = false">Cancel</button>
        <BaseButton :loading="shipping" @click="ship">Ship it</BaseButton>
      </template>
    </BaseModal>

    <ReviewFormModal
      v-if="rateTarget"
      :show="rateModal"
      source-type="project"
      :source-id="project!.id"
      :ratee-id="rateTarget.member_id"
      :ratee-name="rateTarget.member?.profile?.full_name"
      :job-role-id="rateTarget.job_role_id"
      @close="rateModal = false"
      @submitted="() => flash('Review submitted')"
    />

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AppLayout>
</template>
