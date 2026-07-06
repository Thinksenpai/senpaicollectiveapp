<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { engineApi } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import ProfileDisplay from '@/components/member/ProfileDisplay.vue'
import type { MemberEnrichment, Activity } from '@/types'

const authStore = useAuthStore()

const member = computed(() => authStore.member)
const profile = computed(() => authStore.member?.profile)
const roles = computed(() => member.value?.roles || [])

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const isOGMember = computed(() => profile.value?.is_og_member)

// Enhanced profile (enrichment) — woven into the page contextually, not a separate card.
const enrichment = ref<MemberEnrichment | null>(null)
const cohortName = ref<string | null>(null)
const podName = ref<string | null>(null)
onMounted(async () => {
  try {
    const res = await engineApi.getEnrichment()
    enrichment.value = res.data ?? null
  } catch {
    enrichment.value = null
  }
  try {
    const dash = await engineApi.getDashboard()
    cohortName.value = dash.data?.cohort?.name ?? null
    podName.value = dash.data?.pod?.name ?? null
  } catch {
    cohortName.value = null
    podName.value = null
  }
  try {
    const act = await engineApi.getMyActivity()
    activity.value = act.data ?? []
  } catch {
    activity.value = []
  }
})

// Recent activity — a short verb phrase plus a separately-styled chip linking
// to the task/pod/cohort involved. No comment text is shown inline here (that
// lives on the task page itself, in context) — the feed just says what kind
// of thing happened and gives you a clickable way to go see it.
const activity = ref<Activity[]>([])
function meta(a: Activity, key: string): string {
  const v = a.metadata?.[key]
  return typeof v === 'string' ? v : ''
}
function activityVerbPhrase(a: Activity): string {
  switch (a.verb) {
    case 'task_submitted': return 'Submitted'
    case 'task_completed': return 'Completed'
    case 'task_assigned': return 'Assigned'
    case 'task_unassigned': return 'Removed from'
    case 'commented': return 'Commented on'
    case 'pod_joined': return 'Joined'
    case 'accepted': return 'Accepted into'
    case 'approved': {
      const by = meta(a, 'approved_by')
      return by ? `Approved by ${by}` : 'Approved'
    }
    case 'enrichment_completed': return 'Completed profile enrichment'
    case 'guidelines_accepted': return 'Accepted community guidelines'
    case 'pledge_accepted': return 'Accepted the scout pledge'
    case 'became_scout': return 'Became a scout'
    case 'induction_attended': return 'Attended induction'
    case 'active': return 'Was active'
    default: return a.verb.replace(/_/g, ' ')
  }
}
// The clickable chip text — the task/pod/cohort name, not any comment content.
function activityChip(a: Activity): string {
  return meta(a, 'task') || meta(a, 'pod') || meta(a, 'cohort')
}
// Where the chip links to. Tasks (and comments on them) go to the task's own
// page; pod/cohort activities go to the dashboard, since there's no separate
// pod/cohort detail route yet.
function activityLink(a: Activity): string | null {
  if (a.target_type === 'task' && a.target_id) return `/tasks/${a.target_id}`
  if (a.target_type === 'assignment') {
    const taskId = meta(a, 'task_id')
    return taskId ? `/tasks/${taskId}` : null
  }
  if (a.target_type === 'pod' || a.target_type === 'cohort') return '/dashboard'
  return null
}
function activityTimeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const workLabels: Record<string, string> = {
  student: 'Student', employed: 'Employed', freelance: 'Freelance',
  founder: 'Founder, building', between_roles: 'Between roles', other: 'Other'
}
const schoolLabels: Record<string, string> = {
  not_student: 'Not a student', undergrad: 'Undergrad', postgrad: 'Postgrad',
  bootcamp: 'Bootcamp', graduated: 'Graduated'
}

// Each enrichment fact gets its own contextual home instead of one undifferentiated
// grid — experience reads as identity (header), school belongs with About, work
// status belongs with Building, and timezone/languages are logistics that sit
// quietly at the very bottom, after Links.
const experienceLabel = computed(() =>
  profile.value?.experience_level ? experienceLevelLabels[profile.value.experience_level] || profile.value.experience_level : ''
)
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

const subtitle = computed(() => {
  const role = enrichment.value?.job_title || profile.value?.primary_skill?.name
  const location = [profile.value?.city, profile.value?.country].filter(Boolean).join(', ')
  return [role, location].filter(Boolean).join(' · ')
})

const memberSince = computed(() => {
  if (!member.value?.created_at) return ''
  const date = new Date(member.value.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const cohortPod = [cohortName.value, podName.value].filter(Boolean).join(' · ')
  return cohortPod ? `Member since ${date} · ${cohortPod}` : `Member since ${date}`
})

// All links (portfolio first, then additional) shown as one row of buttons.
const allLinks = computed(() => {
  const links: { label: string; url: string }[] = []
  if (profile.value?.portfolio_url) links.push({ label: 'Portfolio', url: profile.value.portfolio_url })
  for (const l of profile.value?.additional_links || []) {
    if (l.url) links.push({ label: l.label || 'Link', url: l.url })
  }
  return links
})
</script>

<template>
  <AppLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-10">
      <ProfileDisplay
        :full-name="profile?.full_name"
        :photo-url="profile?.photo_url"
        :is-o-g-member="isOGMember"
        :roles="roles"
        :mbti="enrichment?.mbti || undefined"
        :subtitle="subtitle"
        :experience-label="experienceLabel"
        :member-since="memberSince"
        edit-href="/profile/edit"
        :goal="enrichment?.goal || undefined"
        :bio="profile?.bio"
        :school-line="schoolLine"
        :skills="member?.skills"
        :primary-skill-id="profile?.primary_skill_id"
        :recent-work="profile?.recent_work"
        :work-line="workLine"
        :unique-view="profile?.unique_view"
        :links="allLinks"
        :logistics-line="logisticsLine"
      />

      <div v-if="activity.length" class="max-w-2xl mx-auto mt-8">
        <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Recent activity</h2>
        <ul class="bg-white border border-gray-200 rounded-2xl divide-y divide-gray-100">
          <li v-for="a in activity" :key="a.id" class="px-4 py-3 flex items-center justify-between text-sm gap-3">
            <span class="text-gray-700 min-w-0 flex items-center gap-1.5 flex-wrap">
              {{ activityVerbPhrase(a) }}
              <RouterLink
                v-if="activityChip(a) && activityLink(a)"
                :to="activityLink(a)!"
                class="inline-block px-2 py-0.5 rounded-full bg-senpai-50 text-senpai-700 font-medium text-xs hover:bg-senpai-100 truncate max-w-[16rem] align-middle"
              >{{ activityChip(a) }}</RouterLink>
              <span v-else-if="activityChip(a)" class="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium text-xs truncate max-w-[16rem] align-middle">{{ activityChip(a) }}</span>
            </span>
            <span class="text-gray-400 text-xs shrink-0">{{ activityTimeAgo(a.created_at) }}</span>
          </li>
        </ul>
      </div>
    </div>
  </AppLayout>
</template>
