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

const statusColors = {
  approved: 'text-green-500',
  pending: 'text-yellow-500',
  declined: 'text-red-500'
}

const statusBadgeColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800'
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
            <SparklesIcon class="h-16 w-16 text-indigo-600 mx-auto mb-4" />
            <h1 class="text-3xl font-bold text-gray-900">Welcome, Scout!</h1>
            <p class="mt-2 text-gray-600">
              You've been selected to help grow the Senpai community. Before you begin, please review and accept our Scout Pledge.
            </p>
          </div>

          <!-- Error for pledge acceptance -->
          <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
            {{ error }}
          </BaseAlert>

          <!-- Pledge Content -->
          <div class="bg-white rounded-xl shadow-sm p-6 sm:p-8 mb-6">
            <template v-if="pledge">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ pledge.title }}</h2>
              <p class="text-sm text-gray-500 mb-6">Version {{ pledge.version }}</p>

              <div class="prose prose-sm max-h-96 overflow-y-auto mb-6 p-4 bg-gray-50 rounded-lg">
                <div v-html="pledge.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')" />
              </div>
            </template>
            <template v-else>
              <h2 class="text-2xl font-bold text-gray-900 mb-4">Scout Pledge</h2>
              <div class="prose prose-sm p-4 bg-gray-50 rounded-lg">
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
          <div class="bg-indigo-50 rounded-lg p-6">
            <h3 class="font-semibold text-indigo-900 mb-3">What happens next?</h3>
            <ul class="text-sm text-indigo-700 space-y-2">
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
                You'll get a unique invite link to share with talented creatives
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
                Track who registers using your link and their application status
              </li>
              <li class="flex items-start">
                <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
                Build your scout score based on the quality of your referrals
              </li>
            </ul>
          </div>
        </div>
      </template>

      <!-- Full Dashboard (shown after pledge is accepted) -->
      <template v-else-if="dashboard">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center">
            <SparklesIcon class="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Scout Dashboard</h1>
              <p class="text-gray-600">Invite talented creatives to join the Senpai community.</p>
            </div>
          </div>
        </div>

        <!-- Invite Link Card -->
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
          <h2 class="font-semibold mb-2">Your Invite Link</h2>
          <p class="text-indigo-100 text-sm mb-4">
            Share this link with people you'd like to invite to Senpai.
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm truncate">
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
          <p class="text-indigo-200 text-xs mt-3">
            Your invite code: <span class="font-mono font-bold">{{ inviteCode }}</span>
          </p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-5">
            <div class="flex items-center">
              <UserGroupIcon class="h-7 w-7 text-gray-400" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900">{{ dashboard.stats.total_invited }}</p>
                <p class="text-xs text-gray-500">Invited</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-5">
            <div class="flex items-center">
              <LinkIcon class="h-7 w-7 text-blue-500" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900">{{ dashboard.stats.total_registered }}</p>
                <p class="text-xs text-gray-500">Registered</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-5">
            <div class="flex items-center">
              <CheckCircleIcon class="h-7 w-7 text-green-500" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900">{{ dashboard.stats.total_approved }}</p>
                <p class="text-xs text-gray-500">Approved</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-5">
            <div class="flex items-center">
              <ClockIcon class="h-7 w-7 text-yellow-500" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900">{{ dashboard.stats.pending_applications }}</p>
                <p class="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-5">
            <div class="flex items-center">
              <XCircleIcon class="h-7 w-7 text-red-500" />
              <div class="ml-3">
                <p class="text-xl font-bold text-gray-900">{{ dashboard.stats.total_declined }}</p>
                <p class="text-xs text-gray-500">Declined</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Scout Score -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Scout Score</h2>
            <span class="text-2xl font-bold text-indigo-600">
              {{ dashboard.stats.scout_score.toFixed(1) }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mb-4">
            Your scout score is based on the quality and approval rate of your invites.
            Approval rate: <strong>{{ dashboard.stats.approval_rate.toFixed(0) }}%</strong> ·
            Conversion rate: <strong>{{ dashboard.stats.conversion_rate.toFixed(0) }}%</strong>
          </p>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div
              class="bg-indigo-600 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${Math.min(dashboard.stats.scout_score * 20, 100)}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-500 mt-1">
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
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'recruits'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Your Recruits
            </button>
            <button
              @click="activeTab = 'leaderboard'"
              :class="[
                'py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'leaderboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Leaderboard
            </button>
          </nav>
        </div>

        <!-- Recruits Tab -->
        <div v-if="activeTab === 'recruits'" class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Your Recruits</h2>
          </div>

          <div v-if="!dashboard.recruits || dashboard.recruits.length === 0" class="p-6 text-center text-gray-500">
            No recruits yet. Share your link to start inviting!
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li
              v-for="recruit in dashboard.recruits"
              :key="recruit.invite_id"
              class="p-4"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <component
                    :is="statusIcons[recruit.application_status]"
                    :class="['h-5 w-5 mr-3', statusColors[recruit.application_status]]"
                  />
                  <div>
                    <p class="font-medium text-gray-900">{{ recruit.full_name || 'Unknown' }}</p>
                    <p class="text-sm text-gray-500">
                      {{ recruit.city }}, {{ recruit.country }} · {{ recruit.primary_skill }}
                    </p>
                    <p v-if="recruit.registered_at" class="text-xs text-gray-400">
                      Registered {{ new Date(recruit.registered_at).toLocaleDateString() }}
                    </p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <button
                    @click="openNoteModal(recruit.invite_id, recruit.scout_note)"
                    class="text-gray-400 hover:text-gray-600"
                    title="Add note"
                  >
                    <PencilIcon class="h-5 w-5" />
                  </button>
                  <span
                    :class="[
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                      statusBadgeColors[recruit.application_status]
                    ]"
                  >
                    {{ recruit.application_status }}
                  </span>
                </div>
              </div>
              <div v-if="recruit.scout_note" class="mt-2 ml-8 text-sm text-gray-600 italic">
                "{{ recruit.scout_note }}"
              </div>
            </li>
          </ul>
        </div>

        <!-- Leaderboard Tab -->
        <div v-if="activeTab === 'leaderboard'" class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center">
              <TrophyIcon class="h-6 w-6 text-yellow-500 mr-2" />
              <h2 class="text-lg font-semibold text-gray-900">Scout Leaderboard</h2>
            </div>
          </div>

          <div v-if="!leaderboard || leaderboard.length === 0" class="p-6 text-center text-gray-500">
            No leaderboard data available yet.
          </div>

          <ul v-else class="divide-y divide-gray-200">
            <li
              v-for="entry in leaderboard"
              :key="entry.member.id"
              :class="[
                'p-4 flex items-center justify-between',
                entry.member.id === authStore.member?.id ? 'bg-indigo-50' : ''
              ]"
            >
              <div class="flex items-center">
                <span
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4',
                    entry.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    entry.rank === 2 ? 'bg-gray-100 text-gray-700' :
                    entry.rank === 3 ? 'bg-orange-100 text-orange-700' :
                    'bg-gray-50 text-gray-500'
                  ]"
                >
                  {{ entry.rank }}
                </span>
                <div>
                  <p class="font-medium text-gray-900">
                    {{ entry.member.full_name }}
                    <span v-if="entry.member.id === authStore.member?.id" class="text-indigo-600">(You)</span>
                  </p>
                  <p class="text-sm text-gray-500">{{ entry.member.city }}, {{ entry.member.country }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-lg font-bold text-indigo-600">{{ entry.stats.scout_score.toFixed(1) }}</p>
                <p class="text-xs text-gray-500">
                  {{ entry.stats.total_approved }} approved · {{ entry.stats.approval_rate.toFixed(0) }}% rate
                </p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Tips -->
        <div class="mt-8 bg-indigo-50 rounded-lg p-6">
          <h3 class="font-semibold text-indigo-900 mb-3">Tips for Successful Recruiting</h3>
          <ul class="text-sm text-indigo-700 space-y-2">
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
              Invite creatives whose work you've personally seen and admire
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
              Focus on quality over quantity - your score reflects this
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
              Add notes about recruits to help admins during the review process
            </li>
            <li class="flex items-start">
              <CheckCircleIcon class="h-5 w-5 mr-2 shrink-0 text-indigo-500" />
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
    <Teleport to="body">
      <div
        v-if="showNoteModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        @click.self="showNoteModal = false"
      >
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="fixed inset-0 bg-black/50" />
          <div class="relative bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4">Add Scout Note</h2>
            <p class="text-sm text-gray-600 mb-4">
              Add context about this recruit to help admins during the review process.
            </p>

            <BaseTextarea
              v-model="noteText"
              placeholder="e.g., Met at Lagos tech meetup, excellent portfolio work..."
              :rows="4"
              :maxlength="500"
            />

            <div class="flex justify-end gap-3 mt-4">
              <BaseButton variant="outline" @click="showNoteModal = false">
                Cancel
              </BaseButton>
              <BaseButton @click="saveNote" :loading="savingNote">
                Save Note
              </BaseButton>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </AppLayout>
</template>
