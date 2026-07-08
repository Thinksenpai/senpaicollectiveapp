<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { adminEngineApi, engineApi } from '@/api'
import type { MemberEngineStatus, MemberEnrichment } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import ProfileDisplay from '@/components/member/ProfileDisplay.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  ExclamationTriangleIcon,
  SparklesIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)

const showDeactivateModal = ref(false)
const deactivateReason = ref('')
const promotingToScout = ref(false)
const removingScout = ref(false)
const grantingCommunityLead = ref(false)
const revokingCommunityLead = ref(false)

const statusCodeClasses: Record<string, string> = {
  pending: 'text-amber-600',
  approved: 'text-senpai-700',
  declined: 'text-red-500',
  deactivated: 'text-gray-400'
}
const statusCodeLabel: Record<string, string> = {
  pending: 'PENDING',
  approved: 'APPROVED',
  declined: 'DECLINED',
  deactivated: 'OFF'
}
const roleBadge: Record<string, string> = {
  admin: 'bg-red-50 text-red-700',
  scout: 'bg-amber-50 text-amber-700'
}
const specialRoles = computed(() =>
  (adminStore.currentMember?.member.roles || []).filter((r) => r.name === 'admin' || r.name === 'scout')
)

// Cohort/pod placement — same roster endpoint the Members list uses.
const rosterEntry = ref<MemberEngineStatus | null>(null)
async function loadRoster() {
  try {
    const res = await adminEngineApi.memberRoster()
    rosterEntry.value = (res.data ?? []).find((r) => r.member_id === route.params.id) ?? null
  } catch {
    rosterEntry.value = null
  }
}

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

// Profiles are fully visible across the collective — admins see the exact
// same enrichment data (MBTI, goal, school/work status, logistics) a peer
// sees in the directory, not a trimmed-down summary.
const enrichment = ref<MemberEnrichment | null>(null)
async function loadEnrichment() {
  try {
    const res = await engineApi.getMemberEnrichment(route.params.id as string)
    enrichment.value = res.data ?? null
  } catch {
    enrichment.value = null
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([adminStore.fetchMember(route.params.id as string), loadRoster(), loadEnrichment()])
  loading.value = false
})

const workLabels: Record<string, string> = {
  student: 'Student', employed: 'Employed', freelance: 'Freelance',
  founder: 'Founder, building', between_roles: 'Between roles', other: 'Other'
}
const schoolLabels: Record<string, string> = {
  not_student: 'Not a student', undergrad: 'Undergrad', postgrad: 'Postgrad',
  bootcamp: 'Bootcamp', graduated: 'Graduated'
}
const schoolLine = computed(() => {
  const e = enrichment.value
  if (!e?.school_status || e.school_status === 'not_student') return ''
  const label = schoolLabels[e.school_status] || e.school_status
  return e.school_name ? `${label}, ${e.school_name}` : label
})
const workLine = computed(() => {
  const e = enrichment.value
  if (!e?.work_status) return ''
  const base = workLabels[e.work_status] || e.work_status
  return e.weekly_commitment_hours ? `${base} · ${e.weekly_commitment_hours} hrs/week` : base
})
const birthdayLine = computed(() => {
  const dob = enrichment.value?.date_of_birth
  if (!dob) return ''
  return `Born ${new Date(dob).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
})
const logisticsLine = computed(() => {
  const e = enrichment.value
  return [e?.timezone, e?.languages, birthdayLine.value].filter(Boolean).join(' · ')
})

// Real profile view — the same ProfileDisplay component used everywhere else
// in the app (directory, own profile), so admins see the actual profile
// instead of a bespoke, less complete summary.
const profileSubtitle = computed(() => {
  const p = adminStore.currentMember?.member.profile
  const role = p?.primary_skill?.name
  const location = [p?.city, p?.country].filter(Boolean).join(', ')
  return [role, location].filter(Boolean).join(' · ')
})
const profileMemberSince = computed(() => {
  const created = adminStore.currentMember?.member.created_at
  if (!created) return ''
  return `Member since ${new Date(created).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
})
const profileLinks = computed(() => {
  const p = adminStore.currentMember?.member.profile
  const links: { label: string; url: string }[] = []
  if (p?.portfolio_url) links.push({ label: 'Portfolio', url: p.portfolio_url })
  for (const l of p?.additional_links || []) {
    const url = typeof l === 'string' ? l : l.url
    const label = typeof l === 'string' ? 'Link' : l.label || 'Link'
    if (url) links.push({ label, url })
  }
  return links
})

async function handleDeactivate() {
  if (!deactivateReason.value.trim()) {
    error.value = 'Please provide a reason for deactivation'
    return
  }

  actionLoading.value = true
  error.value = null

  const result = await adminStore.deactivateMember(
    route.params.id as string,
    deactivateReason.value
  )

  if (result.success) {
    showDeactivateModal.value = false
    router.push('/admin/members')
  } else {
    error.value = result.error || 'Failed to deactivate member'
  }

  actionLoading.value = false
}

async function handlePromoteToScout() {
  promotingToScout.value = true
  error.value = null

  const result = await adminStore.promoteToScout(route.params.id as string)

  if (result.success) {
    // Refresh member data to show updated roles
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to promote member to scout'
  }

  promotingToScout.value = false
}

async function handleRemoveScout() {
  if (!confirm('Remove Scout access from this member?')) return
  removingScout.value = true
  error.value = null
  const result = await adminStore.removeScout(route.params.id as string)
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to remove scout access'
  }
  removingScout.value = false
}

async function handleGrantCommunityLead() {
  grantingCommunityLead.value = true
  error.value = null
  const result = await adminStore.grantCommunityLead(route.params.id as string)
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to grant community lead'
  }
  grantingCommunityLead.value = false
}

async function handleRevokeCommunityLead() {
  if (!confirm('Revoke Community Lead access from this member?')) return
  revokingCommunityLead.value = true
  error.value = null
  const result = await adminStore.revokeCommunityLead(route.params.id as string)
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to revoke community lead'
  }
  revokingCommunityLead.value = false
}

const reactivating = ref(false)
async function handleReactivate() {
  reactivating.value = true
  error.value = null
  const result = await adminStore.reactivateMember(route.params.id as string)
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to reactivate member'
  }
  reactivating.value = false
}

const approving = ref(false)
async function handleApprove() {
  approving.value = true
  error.value = null
  const result = await adminStore.approveApplication(route.params.id as string)
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to approve application'
  }
  approving.value = false
}

const declining = ref(false)
async function handleDecline() {
  const reason = prompt('Decline reason (sent in their email, optional):')
  if (reason === null) return
  declining.value = true
  error.value = null
  const result = await adminStore.declineApplication(route.params.id as string, reason || 'Not specified')
  if (result.success) {
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to decline application'
  }
  declining.value = false
}

const isScout = () => {
  return adminStore.currentMember?.member?.roles?.some(r => r.name === 'scout') ||
         adminStore.currentMember?.member?.scout != null
}
const isCommunityLead = () => {
  return adminStore.currentMember?.member?.roles?.some(r => r.name === 'community_lead') ?? false
}
const isMemberAdmin = () => {
  return adminStore.currentMember?.member?.roles?.some(r => r.name === 'admin') ?? false
}

const stateBadge: Record<string, string> = {
  accepted: 'bg-gray-100 text-gray-700',
  inducted: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  withdrawn: 'bg-red-100 text-red-700'
}
function lastActive(iso?: string | null) {
  if (!iso) return 'Never'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
</script>

<template>
  <AdminLayout back-to="/admin/members" back-label="Back to Members">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!adminStore.currentMember" class="text-center py-12 bg-white rounded-lg">
        <h3 class="text-lg font-medium text-gray-900">Member not found</h3>
        <RouterLink
          to="/admin/members"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Members
        </RouterLink>
      </div>

      <!-- Member Detail -->
      <template v-else>
        <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
          {{ error }}
        </BaseAlert>

        <div class="flex flex-col lg:flex-row gap-6 items-start">
          <!-- Main column -->
          <div class="flex-1 min-w-0 w-full space-y-6">
            <!-- The real profile — same component used in the directory and own-profile view -->
            <div class="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
              <ProfileDisplay
                :full-name="adminStore.currentMember.member.profile?.full_name"
                :photo-url="adminStore.currentMember.member.profile?.photo_url"
                :is-o-g-member="adminStore.currentMember.member.profile?.is_og_member"
                :roles="adminStore.currentMember.member.roles"
                :mbti="enrichment?.mbti || undefined"
                :subtitle="profileSubtitle"
                :experience-label="experienceLevelLabels[adminStore.currentMember.member.profile?.experience_level || 'none']"
                :member-since="profileMemberSince"
                :goal="enrichment?.goal || undefined"
                :bio="adminStore.currentMember.member.profile?.bio"
                :school-line="schoolLine"
                :skills="adminStore.currentMember.member.skills"
                :primary-skill-id="adminStore.currentMember.member.profile?.primary_skill_id"
                :recent-work="adminStore.currentMember.member.profile?.recent_work"
                :work-line="workLine"
                :unique-view="adminStore.currentMember.member.profile?.unique_view"
                :links="profileLinks"
                :logistics-line="logisticsLine"
              />
            </div>

            <!-- Cover Letter (if provided) — application-review context, not part of the profile itself -->
            <div v-if="adminStore.currentMember.member.profile?.cover_letter" class="bg-white rounded-2xl border border-gray-200 p-6">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Why they want to join</p>
              <p class="text-gray-700 whitespace-pre-line">{{ adminStore.currentMember.member.profile.cover_letter }}</p>
            </div>

            <!-- Admin Notes -->
            <div v-if="adminStore.currentMember.admin_notes && adminStore.currentMember.admin_notes.length > 0" class="bg-white rounded-2xl border border-gray-200 p-6">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Admin notes</p>
              <div class="space-y-4">
                <div
                  v-for="note in adminStore.currentMember.admin_notes"
                  :key="note.id"
                  class="border-l-2 border-senpai-200 pl-4"
                >
                  <p class="text-gray-700">{{ note.note_text }}</p>
                  <p class="text-xs font-mono text-gray-400 mt-1">
                    {{ note.admin.full_name }} · {{ new Date(note.created_at).toLocaleDateString() }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar — status, quick facts, actions. Sticky so actions never require scrolling to find. -->
          <div class="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Status</p>
                <span class="text-xs font-mono font-medium tracking-wide" :class="statusCodeClasses[adminStore.currentMember.member.status]">
                  {{ statusCodeLabel[adminStore.currentMember.member.status] }}
                </span>
              </div>

              <div v-if="specialRoles.length" class="flex flex-wrap gap-1.5 mb-3">
                <span v-for="r in specialRoles" :key="r.name" class="text-[11px] font-medium capitalize px-2 py-0.5 rounded-full" :class="roleBadge[r.name]">{{ r.name }}</span>
              </div>

              <dl class="space-y-2.5 text-sm">
                <div>
                  <dt class="text-xs text-gray-400">Skill</dt>
                  <dd class="text-gray-900">{{ adminStore.currentMember.member.profile?.primary_skill?.name || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Location</dt>
                  <dd class="text-gray-900">{{ adminStore.currentMember.member.profile?.city ? `${adminStore.currentMember.member.profile.city}, ${adminStore.currentMember.member.profile.country}` : '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Cohort / Pod</dt>
                  <dd v-if="rosterEntry" class="text-gray-900">
                    {{ rosterEntry.cohort_name }}<span v-if="rosterEntry.pod_name"> · {{ rosterEntry.pod_name }}</span>
                    <span class="inline-flex items-center px-1.5 py-0.5 ml-1 rounded text-xs font-medium capitalize" :class="stateBadge[rosterEntry.state]">{{ rosterEntry.state }}</span>
                  </dd>
                  <dd v-else class="text-gray-400">Not in a cohort</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Last active</dt>
                  <dd class="font-mono text-xs text-gray-500">{{ rosterEntry ? lastActive(rosterEntry.last_active_at) : '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Joined</dt>
                  <dd class="font-mono text-xs text-gray-500">{{ new Date(adminStore.currentMember.member.created_at).toLocaleDateString() }}</dd>
                </div>
                <div v-if="adminStore.currentMember.member.referred_by_scout_name">
                  <dt class="text-xs text-gray-400">Referred by</dt>
                  <dd class="text-gray-900 inline-flex items-center gap-1.5">
                    <span class="h-5 w-5 rounded-full overflow-hidden shrink-0 bg-amber-100">
                      <img v-if="adminStore.currentMember.member.referred_by_scout_photo_url" :src="adminStore.currentMember.member.referred_by_scout_photo_url" :alt="adminStore.currentMember.member.referred_by_scout_name" class="h-full w-full object-cover" />
                      <span v-else class="h-full w-full flex items-center justify-center">
                        <StarIcon class="h-3 w-3 text-amber-500" />
                      </span>
                    </span>
                    {{ adminStore.currentMember.member.referred_by_scout_name }}
                  </dd>
                </div>
                <div v-if="adminStore.currentMember.member.scout_note">
                  <dt class="text-xs text-gray-400">Scout's note</dt>
                  <dd class="text-gray-900 italic">"{{ adminStore.currentMember.member.scout_note }}"</dd>
                </div>
              </dl>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Actions</p>

              <div v-if="adminStore.currentMember.member.status === 'pending'" class="flex flex-col gap-2">
                <BaseButton class="w-full" :loading="approving" @click="handleApprove">Approve application</BaseButton>
                <BaseButton class="w-full" variant="danger" :loading="declining" @click="handleDecline">
                  <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
                  Decline application
                </BaseButton>
              </div>

              <div v-else-if="adminStore.currentMember.member.status === 'approved'" class="flex flex-col gap-2">
                <BaseButton class="w-full" variant="danger" @click="showDeactivateModal = true">
                  <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
                  Deactivate Member
                </BaseButton>
              </div>

              <div v-else-if="adminStore.currentMember.member.status === 'deactivated'" class="flex flex-col gap-2">
                <BaseButton class="w-full" :loading="reactivating" @click="handleReactivate">Reactivate member</BaseButton>
              </div>

              <p v-else class="text-sm text-gray-500">No actions available for a declined application.</p>
            </div>

            <!-- Roles & Permissions — every grant/revoke shortcut lives here, one
                 place, instead of scattered one-off buttons. Admin itself isn't
                 toggleable from this panel — that's seed/support-only, not a
                 click away from an accidental self-demotion. -->
            <div v-if="adminStore.currentMember.member.status === 'approved'" class="bg-white rounded-2xl border border-gray-200 p-5">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Roles &amp; Permissions</p>

              <div class="space-y-3">
                <div v-if="isMemberAdmin()" class="flex items-center justify-between text-sm bg-red-50 text-red-700 px-3 py-2 rounded-lg">
                  <span class="font-medium">Admin</span>
                  <span class="text-xs">Full access</span>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center text-sm" :class="isScout() ? 'text-senpai-700' : 'text-gray-500'">
                    <SparklesIcon class="h-4 w-4 mr-1.5" />
                    Scout
                  </div>
                  <BaseButton v-if="!isScout()" size="sm" variant="outline" :loading="promotingToScout" @click="handlePromoteToScout">Promote</BaseButton>
                  <button v-else class="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50" :disabled="removingScout" @click="handleRemoveScout">Remove</button>
                </div>

                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center text-sm" :class="isCommunityLead() ? 'text-senpai-700' : 'text-gray-500'">
                    <StarIcon class="h-4 w-4 mr-1.5" />
                    Community Lead
                  </div>
                  <BaseButton v-if="!isCommunityLead()" size="sm" variant="outline" :loading="grantingCommunityLead" @click="handleGrantCommunityLead">Grant</BaseButton>
                  <button v-else class="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50" :disabled="revokingCommunityLead" @click="handleRevokeCommunityLead">Revoke</button>
                </div>
              </div>
              <p class="text-xs text-gray-400 mt-3">Community Lead can review and accept membership applications — nothing else.</p>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Deactivate Modal -->
    <BaseModal :show="showDeactivateModal" title="Deactivate member" @close="showDeactivateModal = false">
      <div class="space-y-4">
        <div class="flex items-start gap-3 bg-red-50 rounded-xl p-4">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-800">
            {{ adminStore.currentMember?.member.profile?.full_name }} will lose access to the platform immediately. You can reactivate them later.
          </p>
        </div>
        <BaseAlert v-if="error" type="error">{{ error }}</BaseAlert>
        <BaseTextarea
          v-model="deactivateReason"
          label="Reason (internal only)"
          placeholder="Explain why this member is being deactivated..."
          :rows="3"
          required
        />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="showDeactivateModal = false">Cancel</button>
        <BaseButton variant="danger" :loading="actionLoading" @click="handleDeactivate">Deactivate</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
