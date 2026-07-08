<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import { useJobsStore } from '@/stores/jobs'
import { engineApi } from '@/api'
import type { MemberDashboard, TaskAssignment, MemberEnrichment, AssignmentComment } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import WelcomeModal from '@/components/member/WelcomeModal.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  UserCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  HeartIcon,
  CheckCircleIcon,
  ClockIcon,
  IdentificationIcon,
  LockClosedIcon,
  ChatBubbleLeftRightIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/vue/24/outline'
import { SENPAI_MANIFESTO } from '@/content/manifesto'

const authStore = useAuthStore()
const membersStore = useMembersStore()
const jobsStore = useJobsStore()

// Check if user has seen the welcome modal
const WELCOME_MODAL_KEY = 'senpai_welcome_seen'
const showWelcomeModal = ref(false)

const memberFirstName = computed(() => {
  return authStore.member?.profile?.full_name?.split(' ')[0] || 'Member'
})

const memberSince = computed(() => {
  if (!authStore.member?.created_at) return ''
  return new Date(authStore.member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Random daily value from manifesto
const dailyValue = computed(() => {
  const today = new Date().getDay()
  return SENPAI_MANIFESTO.values[today % SENPAI_MANIFESTO.values.length]
})

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

// Community stats from stores
const totalMembers = computed(() => membersStore.pagination?.total || null)
const openJobs = computed(() => jobsStore.pagination?.total || null)

// ---- Engine: cohort, tasks, onboarding (added to the existing dashboard) ----
const engine = ref<MemberDashboard | null>(null)
const acceptingTerms = ref(false)
const drafts = reactive<Record<string, { link: string; body: string }>>({})
const submitting = reactive<Record<string, boolean>>({})
const expanded = reactive<Record<string, boolean>>({})
const resubmitting = reactive<Record<string, boolean>>({})
const assignmentComments = reactive<Record<string, AssignmentComment[]>>({})
const loadingComments = reactive<Record<string, boolean>>({})
const newComment = reactive<Record<string, string>>({})

const needsTerms = computed(() => !!engine.value && !engine.value.guidelines_accepted)
const enrichmentComplete = computed(() => !!engine.value?.enrichment_complete)
const senpai = computed(() => engine.value?.senpai_id ?? null)
const senpaiAddress = computed(() => (senpai.value?.handle ? `${senpai.value.handle}@senpaicollective.com` : ''))
const inducted = computed(() => engine.value?.membership?.state === 'inducted' || engine.value?.membership?.state === 'active')
const openTasks = computed(() => (engine.value?.tasks ?? []).filter((t) => t.status !== 'completed'))
const doneTasks = computed(() => (engine.value?.tasks ?? []).filter((t) => t.status === 'completed'))

async function loadEngine() {
  try {
    const res = await engineApi.getDashboard()
    const data = res.data ?? null
    for (const a of data?.tasks ?? []) {
      drafts[a.task_id] = { link: a.link_url ?? '', body: a.body ?? '' }
    }
    engine.value = data
  } catch {
    engine.value = null
  }
}

// Profile completeness — computed live from what's actually filled in, instead
// of the stale value stored at registration (which never updates afterwards).
const enrichment = ref<MemberEnrichment | null>(null)
async function loadEnrichment() {
  try {
    const res = await engineApi.getEnrichment()
    enrichment.value = res.data ?? null
  } catch {
    enrichment.value = null
  }
}

const profileCompleteness = computed(() => {
  const p = authStore.member?.profile
  const e = enrichment.value
  const checks = [
    !!p?.photo_url,
    !!p?.bio,
    !!p?.recent_work,
    !!p?.unique_view,
    !!p?.portfolio_url,
    !!(p?.additional_links && p.additional_links.length > 0),
    !!e?.goal,
    !!e?.timezone,
    !!e?.date_of_birth,
    !!e?.work_status,
    !!e?.school_status,
    !!e?.mbti,
    !!e?.job_title,
    !!e?.weekly_commitment_hours,
    !!e?.languages
  ]
  const filled = checks.filter(Boolean).length
  return Math.round((filled / checks.length) * 100)
})

onMounted(() => {
  membersStore.fetchDashboard()
  membersStore.fetchMembers({ limit: 1 })
  jobsStore.fetchJobs({ limit: 1 })
  loadEngine()
  loadEnrichment()

  // Show welcome modal if user hasn't seen it
  const hasSeenWelcome = localStorage.getItem(WELCOME_MODAL_KEY)
  if (!hasSeenWelcome) {
    showWelcomeModal.value = true
  }
})

function handleWelcomeClose() {
  showWelcomeModal.value = false
  localStorage.setItem(WELCOME_MODAL_KEY, 'true')
}

async function acceptTerms() {
  acceptingTerms.value = true
  try {
    await engineApi.acceptGuidelines()
    await loadEngine()
  } finally {
    acceptingTerms.value = false
  }
}

function formatDate(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function daysUntil(d?: string | null) {
  if (!d) return null
  const diff = Math.ceil((new Date(d).getTime() - Date.now()) / 86400000)
  return diff > 0 ? diff : null
}
function toggle(a: TaskAssignment) {
  if (!drafts[a.task_id]) drafts[a.task_id] = { link: a.link_url ?? '', body: a.body ?? '' }
  expanded[a.id] = !expanded[a.id]
  if (expanded[a.id] && hasBeenSubmitted(a) && !assignmentComments[a.id]) loadAssignmentComments(a)
}
// The hand-in input is only editable when there's nothing submitted yet, when
// the task was returned for changes, or when the member explicitly asks to
// resubmit — otherwise a submitted answer reads as read-only, "in review".
function hasBeenSubmitted(a: TaskAssignment) {
  return !!a.submitted_at
}
function isInputActive(a: TaskAssignment) {
  return a.status === 'returned' || !hasBeenSubmitted(a) || !!resubmitting[a.id]
}
async function submitTask(a: TaskAssignment) {
  const handin = a.task?.handin_type ?? 'link'
  const draft = drafts[a.task_id] ?? { link: '', body: '' }
  const payload: { link_url?: string; body?: string } = {}
  if (handin === 'link' || handin === 'file' || handin === 'external_form') payload.link_url = draft.link || undefined
  if (handin === 'text') payload.body = draft.body || undefined
  submitting[a.task_id] = true
  try {
    await engineApi.submitTask(a.task_id, payload)
    resubmitting[a.id] = false
    await loadEngine()
  } finally {
    submitting[a.task_id] = false
  }
}
async function loadAssignmentComments(a: TaskAssignment) {
  loadingComments[a.id] = true
  try {
    const res = await engineApi.getAssignmentComments(a.id)
    assignmentComments[a.id] = res.data ?? []
  } finally {
    loadingComments[a.id] = false
  }
}
async function postComment(a: TaskAssignment) {
  const body = (newComment[a.id] || '').trim()
  if (!body) return
  await engineApi.postAssignmentComment(a.id, body)
  assignmentComments[a.id] = (await engineApi.getAssignmentComments(a.id)).data ?? []
  newComment[a.id] = ''
}
function commentAuthor(c: AssignmentComment) {
  return c.member?.profile?.full_name || c.member?.email || 'Member'
}
function commentTimeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
</script>

<template>
  <AppLayout>
    <!-- Welcome Modal for first-time users -->
    <WelcomeModal
      v-if="showWelcomeModal && !needsTerms"
      :member-name="memberFirstName"
      @close="handleWelcomeClose"
    />

    <!-- Required terms + guidelines gate (first login) -->
    <BaseModal :show="needsTerms" :dismissable="false" title="Welcome to the collective" subtitle="Two minutes before you begin.">
      <div class="space-y-4 text-sm text-gray-600 leading-relaxed">
        <p>You've been accepted. Before you start, our shared agreement — the things that keep this place worth being in:</p>
        <ul class="space-y-2">
          <li class="flex gap-2"><CheckCircleIcon class="h-5 w-5 text-senpai-500 shrink-0" /> Show up and contribute. No spectators — everyone here builds, helps, or shares.</li>
          <li class="flex gap-2"><CheckCircleIcon class="h-5 w-5 text-senpai-500 shrink-0" /> Lift the people around you. We rise together or not at all.</li>
          <li class="flex gap-2"><CheckCircleIcon class="h-5 w-5 text-senpai-500 shrink-0" /> Keep what's shared here in confidence. Trust is the whole asset.</li>
          <li class="flex gap-2"><CheckCircleIcon class="h-5 w-5 text-senpai-500 shrink-0" /> Do the work honestly. Your reputation here is real.</li>
        </ul>
        <RouterLink to="/guidelines" target="_blank" class="inline-flex items-center text-senpai-600 hover:text-senpai-700 font-medium">
          Read the full Community Guidelines <ArrowRightIcon class="h-4 w-4 ml-1" />
        </RouterLink>
      </div>
      <template #footer>
        <button
          class="w-full py-2.5 bg-senpai-600 text-white rounded-lg font-medium hover:bg-senpai-700 disabled:opacity-50"
          :disabled="acceptingTerms"
          @click="acceptTerms"
        >
          {{ acceptingTerms ? 'One moment…' : 'I understand and agree' }}
        </button>
      </template>
    </BaseModal>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="mb-8">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ greeting }}, {{ memberFirstName }}.
            </h1>
            <p class="mt-2 text-lg text-gray-600">
              You are Senpai. What will you build today?
            </p>
          </div>
          <div class="hidden sm:block text-right">
            <p class="text-sm text-gray-500">Member since</p>
            <p class="font-medium text-gray-900">{{ memberSince }}</p>
          </div>
        </div>
      </div>

      <!-- Today's Reminder — always at the top -->
      <div class="mb-8 bg-gray-900 rounded-2xl p-6 text-white">
        <div class="flex items-start gap-4">
          <div class="shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <LightBulbIcon class="h-6 w-6" />
          </div>
          <div>
            <p class="text-sm text-gray-400 mb-1">Today's Reminder</p>
            <h3 class="text-lg font-semibold mb-2">{{ dailyValue?.name || 'Daily Value' }}</h3>
            <p class="text-gray-300 text-sm">{{ dailyValue?.insight || 'Focus on growth and collaboration' }}</p>
          </div>
        </div>
      </div>

      <!-- Scout Invitation Banner -->
      <div
        v-if="membersStore.dashboard?.pending_scout_invitation"
        class="mb-8 bg-gradient-to-r from-senpai-600 to-senpai-500 rounded-2xl p-6 text-white"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <SparklesIcon class="h-8 w-8 mr-4" />
            <div>
              <h3 class="font-semibold text-lg">You've been invited to become a Scout!</h3>
              <p class="text-senpai-100">Help grow the community and build the next generation.</p>
            </div>
          </div>
          <RouterLink
            to="/scout"
            class="inline-flex items-center px-4 py-2 bg-white text-senpai-600 rounded-lg font-medium hover:bg-senpai-50 transition-colors"
          >
            Learn More
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </RouterLink>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - 2/3 width -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Your Cohort — celebratory -->
          <div v-if="engine?.membership" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="relative px-6 pt-8 pb-6 text-center overflow-hidden">
              <!-- confetti -->
              <svg class="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
                <circle cx="34" cy="34" r="4" fill="#1D9E75" />
                <rect x="70" y="20" width="8" height="8" rx="1.5" fill="#378ADD" transform="rotate(20 74 24)" />
                <circle cx="118" cy="22" r="3" fill="#EF9F27" />
                <rect x="300" y="26" width="7" height="7" rx="1.5" fill="#D4537E" transform="rotate(-25 303 29)" />
                <circle cx="350" cy="40" r="4" fill="#7F77DD" />
                <rect x="372" y="78" width="8" height="8" rx="1.5" fill="#1D9E75" transform="rotate(15 376 82)" />
                <circle cx="22" cy="92" r="3.5" fill="#D4537E" />
                <rect x="44" y="120" width="7" height="7" rx="1.5" fill="#EF9F27" transform="rotate(35 47 123)" />
                <circle cx="360" cy="120" r="3.5" fill="#378ADD" />
                <rect x="150" y="14" width="6" height="6" rx="1.5" fill="#7F77DD" transform="rotate(-15 153 17)" />
                <circle cx="250" cy="18" r="3" fill="#1D9E75" />
                <rect x="20" y="60" width="6" height="6" rx="1.5" fill="#EF9F27" transform="rotate(40 23 63)" />
              </svg>
              <div class="relative">
                <div class="text-5xl leading-none select-none">🎉</div>
                <p class="mt-3 text-xs font-medium uppercase tracking-wider text-senpai-600">You're officially in</p>
                <p class="font-bold text-2xl text-gray-900 mt-0.5">{{ engine.cohort?.name || 'Your cohort' }}</p>
                <span class="inline-block mt-3 text-xs px-2.5 py-1 rounded-full bg-senpai-100 text-senpai-700 capitalize">{{ engine.membership.state }}</span>
                <p v-if="engine.cohort?.description" class="mt-3 text-sm text-gray-500 max-w-md mx-auto">{{ engine.cohort.description }}</p>
              </div>
            </div>
            <div class="border-t border-gray-100 p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <!-- Induction -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Induction</p>
                <p v-if="engine.cohort?.induction_date" class="text-sm text-gray-900 flex items-center gap-1.5">
                  <ClockIcon class="h-4 w-4 text-senpai-600" />
                  <span v-if="daysUntil(engine.cohort.induction_date)">in {{ daysUntil(engine.cohort.induction_date) }} days</span>
                  <span v-else>{{ formatDate(engine.cohort.induction_date) }}</span>
                </p>
                <p v-else class="text-sm text-gray-400">Date to be announced</p>
              </div>
              <!-- Senpai ID -->
              <div>
                <p class="text-xs text-gray-500 mb-1">Senpai ID</p>
                <p v-if="senpaiAddress" class="text-sm font-mono text-gray-900 break-all">{{ senpaiAddress }}</p>
                <p v-else class="text-sm text-gray-400 flex items-center gap-1.5"><LockClosedIcon class="h-4 w-4" /> Revealed at induction</p>
              </div>
              <!-- Pod — visible as soon as it's assigned, not gated behind induction -->
              <div v-if="engine.pod" class="sm:col-span-2 pt-2 border-t border-gray-100">
                <div class="flex items-center justify-between">
                  <p class="text-sm text-gray-900 flex items-center gap-1.5"><ChatBubbleLeftRightIcon class="h-4 w-4 text-senpai-600" /> {{ engine.pod.name }}</p>
                  <a v-if="engine.pod.whatsapp_invite_url" :href="engine.pod.whatsapp_invite_url" target="_blank" rel="noopener noreferrer" class="text-sm text-green-700 font-medium hover:underline inline-flex items-center gap-1">Join WhatsApp <ArrowTopRightOnSquareIcon class="h-4 w-4" /></a>
                </div>
                <p v-if="engine.pod.description" class="text-sm text-gray-500 mt-1">{{ engine.pod.description }}</p>
              </div>
              <div v-else-if="engine.membership && !inducted" class="sm:col-span-2 pt-2 border-t border-gray-100">
                <p class="text-sm text-gray-400 flex items-center gap-1.5"><ChatBubbleLeftRightIcon class="h-4 w-4" /> Pod not assigned yet — we'll place you soon</p>
              </div>
            </div>
          </div>

          <!-- Complete your profile prompt -->
          <RouterLink
            v-if="engine && !enrichmentComplete && engine.guidelines_accepted"
            to="/profile/edit"
            class="flex items-center gap-4 bg-white rounded-2xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group"
          >
            <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-senpai-200 transition-colors">
              <IdentificationIcon class="h-6 w-6 text-senpai-600" />
            </div>
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Complete your member profile</h3>
              <p class="text-sm text-gray-500">A few questions that help us place you in the right pod.</p>
            </div>
            <ArrowRightIcon class="h-5 w-5 text-gray-400 shrink-0" />
          </RouterLink>

          <!-- Take Action -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Take Action</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <RouterLink to="/members" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <UsersIcon class="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Find Collaborators</h3>
                    <p class="text-sm text-gray-500">Connect with other builders</p>
                  </div>
                </div>
              </RouterLink>

              <RouterLink to="/jobs" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <BriefcaseIcon class="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Find Opportunities</h3>
                    <p class="text-sm text-gray-500">Jobs from the collective</p>
                  </div>
                </div>
              </RouterLink>

              <RouterLink to="/profile/edit" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <UserCircleIcon class="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Update Profile</h3>
                    <p class="text-sm text-gray-500">Show what you're building</p>
                  </div>
                </div>
              </RouterLink>

              <RouterLink to="/profile" class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <RocketLaunchIcon class="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">View Profile</h3>
                    <p class="text-sm text-gray-500">See how others see you</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- Your Tasks (own section, under Take Action) -->
          <div v-if="openTasks.length || doneTasks.length">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Your Tasks</h2>
              <span v-if="doneTasks.length" class="text-sm text-gray-400">{{ doneTasks.length }} done</span>
            </div>
            <div class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              <!-- Open tasks -->
              <div v-for="a in openTasks" :key="a.id" class="px-5 py-4">
                <div class="flex items-start gap-3">
                  <button class="mt-0.5 h-5 w-5 rounded-full border-2 border-gray-300 shrink-0 flex items-center justify-center" @click="toggle(a)">
                    <span v-if="a.status === 'submitted'" class="h-2 w-2 rounded-full bg-blue-500" />
                  </button>
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center justify-between gap-2">
                      <button class="text-left font-medium text-gray-900 hover:text-senpai-700 truncate" @click="toggle(a)">{{ a.task?.title }}</button>
                      <div class="flex items-center gap-2 shrink-0">
        <span v-if="a.task?.is_required" class="text-[11px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">Required</span>
                        <span v-if="a.status === 'submitted'" class="text-[11px] text-blue-600">In review</span>
                        <span v-else-if="a.status === 'returned'" class="text-[11px] text-red-600">Needs changes</span>
                      </div>
                    </div>
                    <p class="text-sm text-gray-500 mt-0.5">{{ a.task?.description }}</p>
                    <p v-if="a.task?.due_at" class="text-xs text-gray-400 mt-1 flex items-center gap-1"><ClockIcon class="h-3.5 w-3.5" /> Due {{ formatDate(a.task.due_at) }}</p>
                    <div v-if="expanded[a.id]" class="mt-3">
                      <p v-if="a.status === 'returned' && a.review_note" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-3">{{ a.review_note }}</p>

                      <!-- Read-only: already submitted, in review, not currently resubmitting -->
                      <div v-if="hasBeenSubmitted(a) && !isInputActive(a)" class="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p v-if="a.link_url" class="text-sm"><a :href="a.link_url" target="_blank" rel="noopener noreferrer" class="text-senpai-600 hover:underline break-all">{{ a.link_url }}</a></p>
                        <p v-if="a.body" class="text-sm text-gray-700 whitespace-pre-wrap">{{ a.body }}</p>
                        <button class="mt-2 text-xs text-gray-500 hover:text-gray-800 font-medium" @click="resubmitting[a.id] = true">Resubmit</button>
                      </div>

                      <!-- Editable: no submission yet, returned for changes, or explicitly resubmitting -->
                      <template v-else>
                        <textarea v-if="a.task?.handin_type === 'text'" v-model="drafts[a.task_id]!.body" rows="3" placeholder="Write your response…" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500" />
                        <a v-else-if="a.task?.handin_type === 'external_form' && a.task?.external_url" :href="a.task.external_url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm text-senpai-600 font-medium mb-2">Open the form <ArrowTopRightOnSquareIcon class="h-4 w-4" /></a>
                        <input v-else-if="a.task?.handin_type !== 'none'" v-model="drafts[a.task_id]!.link" type="url" placeholder="https://…" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500" />
                        <button class="mt-3 px-4 py-2 bg-senpai-600 text-white rounded-lg text-sm font-medium hover:bg-senpai-700 disabled:opacity-50" :disabled="submitting[a.task_id]" @click="submitTask(a)">
                          {{ submitting[a.task_id] ? 'Submitting…' : hasBeenSubmitted(a) ? 'Resubmit' : a.task?.handin_type === 'none' || a.task?.handin_type === 'external_form' ? 'Mark as done' : 'Submit' }}
                        </button>
                      </template>

                      <!-- Comment thread with admins — only relevant once something's been submitted -->
                      <div v-if="hasBeenSubmitted(a)" class="mt-4 pt-3 border-t border-gray-100">
                        <p class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Comments</p>
                        <div v-if="loadingComments[a.id]" class="text-xs text-gray-400">Loading…</div>
                        <div v-else-if="assignmentComments[a.id]?.length" class="space-y-2 mb-2">
                          <div v-for="c in assignmentComments[a.id]" :key="c.id" class="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                            <p class="text-xs text-gray-400 mb-0.5">{{ commentAuthor(c) }} · {{ commentTimeAgo(c.created_at) }}</p>
                            <p class="text-gray-700 whitespace-pre-wrap">{{ c.body }}</p>
                          </div>
                        </div>
                        <p v-else class="text-xs text-gray-400 italic mb-2">No comments yet.</p>
                        <div class="flex items-center gap-2">
                          <input
                            v-model="newComment[a.id]"
                            type="text"
                            placeholder="Reply…"
                            class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-senpai-400"
                            @keyup.enter="postComment(a)"
                          />
                          <button class="text-sm text-senpai-600 font-medium hover:text-senpai-700" @click="postComment(a)">Send</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Completed tasks — clearly done -->
              <div v-for="a in doneTasks" :key="a.id" class="px-5 py-4 flex items-center gap-3 bg-green-50/40">
                <CheckCircleIcon class="h-5 w-5 text-green-500 shrink-0" />
                <span class="text-sm text-gray-500 line-through truncate flex-1">{{ a.task?.title }}</span>
                <span class="text-[11px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Done</span>
              </div>
            </div>
          </div>

          <!-- What You're Here For -->
          <div class="bg-gray-50 rounded-2xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Remember Why You're Here</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AcademicCapIcon class="h-6 w-6 text-senpai-600" />
                </div>
                <h3 class="font-medium text-gray-900 mb-1">Information</h3>
                <p class="text-sm text-gray-500">Access knowledge that's usually gatekept</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="h-6 w-6 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900 mb-1">Structure</h3>
                <p class="text-sm text-gray-500">Frameworks to turn ambition into action</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UsersIcon class="h-6 w-6 text-senpai-600" />
                </div>
                <h3 class="font-medium text-gray-900 mb-1">People</h3>
                <p class="text-sm text-gray-500">Builders who get it and push you forward</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - 1/3 width -->
        <div class="space-y-6">
          <!-- Profile Card -->
          <div v-if="authStore.member?.profile" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="bg-gray-900 px-6 py-4">
              <p class="text-sm text-gray-400">Your Profile</p>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-senpai-100 rounded-full flex items-center justify-center">
                  <span class="text-xl font-bold text-senpai-600">
                    {{ memberFirstName.charAt(0) }}
                  </span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ authStore.member.profile.full_name }}</h3>
                  <p class="text-sm text-gray-500">{{ authStore.member.profile.primary_skill?.name || 'Creative' }}</p>
                </div>
              </div>

              <!-- Profile Completeness -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-gray-600">Profile Strength</span>
                  <span class="font-medium text-senpai-600">{{ profileCompleteness }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div
                    class="bg-senpai-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${profileCompleteness}%` }"
                  />
                </div>
              </div>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Experience</span>
                  <span class="text-gray-900 capitalize">{{ authStore.member.profile.experience_level || 'Not set' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Location</span>
                  <span class="text-gray-900">{{ authStore.member.profile.city }}, {{ authStore.member.profile.country }}</span>
                </div>
              </div>

              <RouterLink
                v-if="profileCompleteness < 100"
                to="/profile/edit"
                class="mt-4 block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Complete Your Profile
              </RouterLink>
            </div>
          </div>

          <!-- Scout Dashboard Card -->
          <div v-if="authStore.isScout" class="bg-gradient-to-br from-senpai-50 to-senpai-100 rounded-2xl p-6 border border-senpai-200">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-senpai-500 rounded-xl flex items-center justify-center">
                <SparklesIcon class="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900">Scout Dashboard</h3>
                <p class="text-xs text-gray-600">Grow the community</p>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-4">
              You're a Scout! Invite talented creatives and help build the next generation.
            </p>
            <RouterLink
              to="/scout"
              class="inline-flex items-center justify-center w-full py-2.5 px-4 bg-senpai-500 text-white rounded-lg text-sm font-medium hover:bg-senpai-600 transition-colors"
            >
              Open Scout Dashboard
              <ArrowRightIcon class="h-4 w-4 ml-2" />
            </RouterLink>
          </div>

          <!-- The Pledge Reminder -->
          <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-4">
              <HeartIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Your Pledge</h3>
            </div>
            <div class="space-y-2 text-sm text-gray-600 italic">
              <p>I pledge to grow — every single day.</p>
              <p>I pledge to build — things that matter.</p>
              <p>I pledge to lift — those coming behind me.</p>
            </div>
            <RouterLink
              to="/manifesto"
              class="mt-4 inline-flex items-center text-sm text-senpai-600 hover:text-senpai-700 font-medium"
            >
              Read full manifesto
              <ArrowRightIcon class="h-3 w-3 ml-1" />
            </RouterLink>
          </div>

          <!-- Community Stats -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">The Collective</h3>
            <div class="space-y-4">
              <RouterLink to="/members" class="flex items-center justify-between -mx-2 px-2 py-1 rounded-lg hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon class="h-4 w-4 text-blue-600" />
                  </div>
                  <span class="text-sm text-gray-600">Members</span>
                </div>
                <span class="font-semibold text-gray-900">{{ totalMembers ?? '—' }}</span>
              </RouterLink>
              <RouterLink to="/jobs" class="flex items-center justify-between -mx-2 px-2 py-1 rounded-lg hover:bg-gray-50">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-sm text-gray-600">Open Jobs</span>
                </div>
                <span class="font-semibold text-gray-900">{{ openJobs ?? '—' }}</span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
