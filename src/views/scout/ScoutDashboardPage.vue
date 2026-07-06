<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { scoutsApi } from '@/api'
import type { ScoutDashboardData, ScoutPledge, ScoutLeaderboardEntry } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  LinkIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon,
  TrophyIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const loading = ref(true)
const error = ref<string | null>(null)
const dashboard = ref<ScoutDashboardData | null>(null)
const pledge = ref<ScoutPledge | null>(null)
const leaderboard = ref<ScoutLeaderboardEntry[]>([])
const copied = ref(false)
const acceptingPledge = ref(false)
const showNoteModal = ref(false)
const selectedInviteId = ref<string | null>(null)
const noteText = ref('')
const savingNote = ref(false)
const activeTab = ref<'recruits' | 'leaderboard'>('recruits')

// Check if scout needs to accept pledge based on auth store data
const needsToAcceptPledge = computed(() => {
  const scout = authStore.member?.scout
  if (!scout) return false
  return scout.status === 'inactive' || !scout.accepted_agreement_at
})

const inviteLink = computed(() => {
  return dashboard.value?.invite_url || `${window.location.origin}/join?ref=${inviteCode.value}`
})

const inviteCode = computed(() => {
  return dashboard.value?.scout?.invite_code || authStore.member?.scout?.invite_code || 'XXXXXX'
})

async function fetchPledge() {
  try {
    const pledgeRes = await scoutsApi.getPledge()
    if (pledgeRes.status && pledgeRes.data) {
      pledge.value = pledgeRes.data
    }
  } catch (e: any) {
    console.error('Failed to fetch pledge:', e)
  }
}

async function fetchDashboard() {
  try {
    const [dashboardRes, leaderboardRes] = await Promise.allSettled([
      scoutsApi.getDashboard(),
      scoutsApi.getLeaderboard()
    ])

    if (dashboardRes.status === 'fulfilled' && dashboardRes.value.status && dashboardRes.value.data) {
      dashboard.value = dashboardRes.value.data
    } else if (dashboardRes.status === 'rejected') {
      error.value = dashboardRes.reason?.response?.data?.message || 'Failed to load scout dashboard'
    } else if (dashboardRes.status === 'fulfilled' && !dashboardRes.value.status) {
      error.value = dashboardRes.value.message || 'Failed to load scout dashboard'
    }

    if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.status && leaderboardRes.value.data) {
      leaderboard.value = leaderboardRes.value.data
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load scout dashboard'
  }
}

async function initPage() {
  loading.value = true
  error.value = null

  if (needsToAcceptPledge.value) {
    // Scout hasn't accepted pledge yet - just fetch the pledge content
    await fetchPledge()
  } else {
    // Scout has accepted - fetch full dashboard
    await fetchDashboard()
  }

  loading.value = false
}

async function acceptPledge() {
  acceptingPledge.value = true
  error.value = null
  try {
    const response = await scoutsApi.acceptPledge(true)
    if (response.status) {
      // Refresh auth store to update scout status
      await authStore.fetchCurrentMember()
      // Now fetch the full dashboard
      await fetchDashboard()
    } else {
      error.value = response.message || 'Failed to accept pledge'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to accept pledge'
  } finally {
    acceptingPledge.value = false
  }
}

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

function openNoteModal(inviteId: string, existingNote?: string) {
  selectedInviteId.value = inviteId
  noteText.value = existingNote || ''
  showNoteModal.value = true
}

async function saveNote() {
  if (!selectedInviteId.value) return

  savingNote.value = true
  try {
    const response = await scoutsApi.addNote(selectedInviteId.value, noteText.value)
    if (response.status) {
      showNoteModal.value = false
      await fetchDashboard()
    } else {
      error.value = response.message || 'Failed to save note'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to save note'
  } finally {
    savingNote.value = false
  }
}

const statusIcons = {
  approved: CheckCircleIcon,
  pending: ClockIcon,
  declined: XCircleIcon
}

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

// Monospace status codes — same "work log" signature used on the member
// Tasks pages and the admin Members/Applications views.
const statusCodeClasses = {
  approved: 'text-senpai-700',
  pending: 'text-amber-600',
  declined: 'text-red-500'
}
const statusCodeLabel = {
  approved: 'APPROVED',
  pending: 'PENDING',
  declined: 'DECLINED'
}

onMounted(initPage)
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <BaseAlert v-else-if="error && !needsToAcceptPledge" type="error" class="mb-6">
        {{ error }}
      </BaseAlert>

      <!-- Pledge Acceptance Screen (shown when scout hasn't accepted yet) -->
      <template v-else-if="needsToAcceptPledge">
        <div class="max-w-2xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-8">
            <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Scout pledge</p>
            <h1 class="text-3xl font-bold text-gray-900 mt-2">Welcome, Scout</h1>
            <p class="mt-2 text-gray-600">
              You've been selected to help grow the Senpai community. Before you begin, please review and accept our Scout Pledge.
            </p>
          </div>

          <!-- Error for pledge acceptance -->
          <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
            {{ error }}
          </BaseAlert>

          <!-- Pledge Content -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 mb-6">
            <template v-if="pledge">
              <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ pledge.title }}</h2>
              <p class="text-xs font-mono text-gray-400 mb-6">VERSION {{ pledge.version }}</p>

              <div class="prose prose-sm max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-xl">
                <div v-html="pledge.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')" />
              </div>
            </template>
            <template v-else>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Scout Pledge</h2>
              <div class="prose prose-sm p-4 bg-gray-50 rounded-xl">
                <p>As a Senpai Scout, I pledge to:</p>
                <ul>
                  <li><strong>Uphold Quality</strong> - Only invite creatives whose work I genuinely admire and believe would contribute positively to our community.</li>
                  <li><strong>Be Authentic</strong> - Build real connections, not just collect referrals. Quality matters more than quantity.</li>
                  <li><strong>Support Growth</strong> - Help my recruits navigate the community and set them up for success.</li>
                  <li><strong>Maintain Integrity</strong> - Never misrepresent the community or make promises I can't keep.</li>
                  <li><strong>Lead by Example</strong> - Embody the values of collaboration, creativity, and excellence that define Senpai.</li>
                </ul>
              </div>
            </template>

            <div class="mt-6">
              <BaseButton
                @click="acceptPledge"
                :loading="acceptingPledge"
                class="w-full"
                size="lg"
              >
                <CheckCircleIcon class="h-5 w-5 mr-2" />
                I Accept the Scout Pledge
              </BaseButton>
            </div>
          </div>

          <!-- What's Next -->
          <div class="bg-senpai-50 rounded-2xl p-6">
            <p class="text-[11px] font-mono uppercase tracking-widest text-senpai-700 mb-3">// What happens next</p>
            <ul class="text-sm text-senpai-800 space-y-2">
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
                You'll get a unique invite link to share with talented creatives
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
                Track who registers using your link and their application status
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
                Build your scout score based on the quality of your referrals
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Full Dashboard (shown after pledge is accepted) -->
      <template v-else-if="dashboard">
        <!-- Header -->
        <div class="mb-8 flex items-center gap-3">
          <SparklesIcon class="h-7 w-7 text-senpai-600 shrink-0" />
          <div>
            <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Scout console</p>
            <h1 class="text-2xl font-bold text-gray-900 mt-0.5">Scout Dashboard</h1>
          </div>
        </div>

        <!-- Invite Link — the signature moment: a terminal-style access key,
             quiet everywhere else on the page, bold exactly once here. -->
        <div class="bg-gray-900 rounded-2xl p-6 mb-8 text-white">
          <p class="text-[11px] font-mono uppercase tracking-widest text-senpai-400 mb-1">// Your invite link</p>
          <p class="text-gray-400 text-sm mb-4">
            Share this link with people you'd like to invite to Senpai.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 bg-white/10 rounded-lg px-4 py-3 font-mono text-sm text-senpai-100 truncate">
              {{ inviteLink }}
            </div>
            <BaseButton
              variant="secondary"
              @click="copyLink"
              class="shrink-0"
            >
              <ClipboardDocumentIcon class="h-5 w-5 mr-2" />
              {{ copied ? 'Copied!' : 'Copy Link' }}
            </BaseButton>
          </div>
          <p class="text-gray-500 text-xs mt-3 font-mono">
            CODE: <span class="text-senpai-400 font-bold">{{ inviteCode }}</span>
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center">
              <UserGroupIcon class="h-6 w-6 text-gray-400 shrink-0" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900 font-mono">{{ dashboard.stats.total_invited }}</p>
                <p class="text-xs text-gray-500">Invited</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center">
              <LinkIcon class="h-6 w-6 text-senpai-500 shrink-0" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900 font-mono">{{ dashboard.stats.total_registered }}</p>
                <p class="text-xs text-gray-500">Registered</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center">
              <CheckCircleIcon class="h-6 w-6 text-senpai-600 shrink-0" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900 font-mono">{{ dashboard.stats.total_approved }}</p>
                <p class="text-xs text-gray-500">Approved</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center">
              <ClockIcon class="h-6 w-6 text-amber-500 shrink-0" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900 font-mono">{{ dashboard.stats.pending_applications }}</p>
                <p class="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-center">
              <XCircleIcon class="h-6 w-6 text-red-400 shrink-0" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900 font-mono">{{ dashboard.stats.total_declined }}</p>
                <p class="text-xs text-gray-500">Declined</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Scout Score -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Scout score</p>
            <span class="text-2xl font-bold text-senpai-700 font-mono">
              {{ dashboard.stats.scout_score.toFixed(1) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Your score tracks toward your approval rate as you refer more people — a single early approval won't
            max it out, and a single decline won't tank it. It needs 5 registered recruits to fully reflect your rate.
            Approval rate: <strong>{{ dashboard.stats.approval_rate.toFixed(0) }}%</strong> ·
            Conversion rate: <strong>{{ dashboard.stats.conversion_rate.toFixed(0) }}%</strong>
          </p>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div
              class="bg-senpai-500 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(dashboard.stats.scout_score * 20, 100)}%` }"
            />
          </div>
          <div class="flex justify-between text-xs font-mono text-gray-400 mt-1.5">
            <span>0</span>
            <span>2.5</span>
            <span>5.0</span>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'recruits'"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'recruits'
                  ? 'border-senpai-600 text-senpai-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Your Recruits
            </button>
            <button
              @click="activeTab = 'leaderboard'"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'leaderboard'
                  ? 'border-senpai-600 text-senpai-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Leaderboard
            </button>
          </nav>
        </div>

        <!-- Recruits Tab -->
        <div v-if="activeTab === 'recruits'" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div v-if="!dashboard.recruits || dashboard.recruits.length === 0" class="p-10 text-center">
            <UserGroupIcon class="mx-auto h-10 w-10 text-gray-300" />
            <p class="mt-3 text-sm text-gray-500">No recruits yet. Share your link to start inviting!</p>
          </div>

          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="recruit in dashboard.recruits"
              :key="recruit.invite_id"
              class="p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center min-w-0">
                  <span class="h-9 w-9 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2 ring-gray-100 mr-3">
                    <img v-if="recruit.photo_url" :src="recruit.photo_url" :alt="recruit.full_name" class="h-full w-full object-cover" />
                    <span v-else class="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">{{ initials(recruit.full_name || '?') }}</span>
                  </span>
                  <component
                    :is="statusIcons[recruit.application_status]"
                    :class="['h-4 w-4 mr-2 shrink-0', statusCodeClasses[recruit.application_status]]"
                  />
                  <div class="min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ recruit.full_name || 'Unknown' }}</p>
                    <p class="text-sm text-gray-500 truncate">
                      {{ recruit.city }}, {{ recruit.country }} · {{ recruit.primary_skill }}
                    </p>
                    <p v-if="recruit.registered_at" class="text-xs font-mono text-gray-400 mt-0.5">
                      Registered {{ new Date(recruit.registered_at).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  <button
                    v-if="recruit.application_status !== 'declined'"
                    @click="openNoteModal(recruit.invite_id, recruit.scout_note)"
                    class="text-gray-400 hover:text-senpai-600"
                    title="Add note"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <span class="text-[11px] font-mono font-medium tracking-wide" :class="statusCodeClasses[recruit.application_status]">
                    {{ statusCodeLabel[recruit.application_status] }}
                  </span>
                </div>
              </div>
              <div v-if="recruit.application_status === 'declined' && recruit.decline_reason" class="mt-2 ml-8 text-sm text-red-600">
                Declined: "{{ recruit.decline_reason }}"
              </div>
              <div v-if="recruit.scout_note" class="mt-2 ml-8 text-sm text-gray-600 italic">
                Your note: "{{ recruit.scout_note }}"
              </div>
            </li>
          </ul>
        </div>

        <!-- Leaderboard Tab -->
        <div v-if="activeTab === 'leaderboard'" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div v-if="!leaderboard || leaderboard.length === 0" class="p-10 text-center">
            <TrophyIcon class="mx-auto h-10 w-10 text-gray-300" />
            <p class="mt-3 text-sm text-gray-500">No leaderboard data available yet.</p>
          </div>

          <ul v-else class="divide-y divide-gray-100">
            <li
              v-for="entry in leaderboard"
              :key="entry.member.id"
              :class="[
                'p-4 flex items-center justify-between gap-3',
                entry.member.id === authStore.member?.id ? 'bg-senpai-50/60' : ''
              ]"
            >
              <div class="flex items-center min-w-0">
                <span
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-sm mr-4 shrink-0',
                    entry.rank === 1 ? 'bg-amber-100 text-amber-700' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-400'
                  ]"
                >
                  {{ entry.rank }}
                </span>
                <span class="h-9 w-9 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2 ring-gray-100 mr-3">
                  <img v-if="entry.member.photo_url" :src="entry.member.photo_url" :alt="entry.member.full_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full flex items-center justify-center text-xs font-medium text-gray-500">{{ initials(entry.member.full_name) }}</span>
                </span>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">
                    {{ entry.member.full_name }}
                    <span v-if="entry.member.id === authStore.member?.id" class="text-senpai-600">(You)</span>
                  </p>
                  <p class="text-sm text-gray-500 truncate">{{ entry.member.city }}, {{ entry.member.country }}</p>
                </div>
              </div>
              <div class="text-right shrink-0">
                <p class="text-lg font-bold text-senpai-700 font-mono">{{ entry.stats.scout_score.toFixed(1) }}</p>
                <p class="text-xs text-gray-500">
                  {{ entry.stats.total_approved }} approved · {{ entry.stats.approval_rate.toFixed(0) }}% rate
                </p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Tips -->
        <div class="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
          <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Tips for successful recruiting</p>
          <ul class="text-sm text-gray-600 space-y-2">
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
              Invite creatives whose work you've personally seen and admire
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
              Focus on quality over quantity - your score reflects this
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
              Add notes about recruits to help admins during the review process
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-senpai-500" />
              Share the link via DM for a more personal touch
            </li>
          </ul>
        </div>
      </template>

      <!-- No dashboard data and not needing pledge -->
      <template v-else>
        <div class="text-center py-12">
          <SparklesIcon class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 class="text-lg font-medium text-gray-900">Unable to load scout dashboard</h2>
          <p class="text-gray-500 mt-2">Please try refreshing the page.</p>
          <BaseButton @click="initPage" class="mt-4">
            Retry
          </BaseButton>
        </div>
      </template>
    </div>

    <!-- Note Modal -->
    <BaseModal :show="showNoteModal" title="Add scout note" subtitle="Add context about this recruit to help admins during the review process." @close="showNoteModal = false">
      <BaseTextarea
        v-model="noteText"
        placeholder="e.g., Met at Lagos tech meetup, excellent portfolio work..."
        :rows="4"
        :maxlength="500"
      />
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="showNoteModal = false">Cancel</button>
        <BaseButton :loading="savingNote" @click="saveNote">Save Note</BaseButton>
      </template>
    </BaseModal>
  </AppLayout>
</template>
