<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useMembersStore } from '@/stores/members'
import { engineApi } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ProfileDisplay from '@/components/member/ProfileDisplay.vue'
import type { Role, MemberEnrichment } from '@/types'
import { UserCircleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const membersStore = useMembersStore()

const loading = ref(true)
const member = computed(() => membersStore.currentMember)

// Profiles are fully visible across the collective — same enrichment data
// (MBTI, goal, school/work status, logistics) the member sees on their own
// profile, not a trimmed-down public subset.
const enrichment = ref<MemberEnrichment | null>(null)
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

const roles = computed<Role[]>(() => {
  const raw = (member.value as any)?.roles || []
  return raw.map((r: any) => (typeof r === 'string' ? { id: r, name: r, description: '' } : r))
})

const isOGMember = computed(() => (member.value?.badges || []).some((b) => b.toLowerCase().includes('og')))

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}
const experienceLabel = computed(() =>
  member.value?.experience_level ? experienceLevelLabels[member.value.experience_level] || member.value.experience_level : ''
)

const subtitle = computed(() => {
  const role = member.value?.primary_skill?.name
  const location = [member.value?.city, member.value?.country].filter(Boolean).join(', ')
  return [role, location].filter(Boolean).join(' · ')
})

const memberSince = computed(() => {
  if (!member.value?.member_since) return ''
  const base = `Member since ${new Date(member.value.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
  const cohortPod = [member.value.cohort_name, member.value.pod_name].filter(Boolean).join(' · ')
  return cohortPod ? `${base} · ${cohortPod}` : base
})

const allLinks = computed(() => {
  const links: { label: string; url: string }[] = []
  if (member.value?.portfolio_url) links.push({ label: 'Portfolio', url: member.value.portfolio_url })
  for (const l of member.value?.additional_links || []) {
    const url = typeof l === 'string' ? l : l.url
    const label = typeof l === 'string' ? 'Link' : l.label || 'Link'
    if (url) links.push({ label, url })
  }
  return links
})

async function loadMember() {
  loading.value = true
  enrichment.value = null
  await membersStore.fetchMember(route.params.id as string)
  try {
    const res = await engineApi.getMemberEnrichment(route.params.id as string)
    enrichment.value = res.data ?? null
  } catch {
    enrichment.value = null
  }
  loading.value = false
}

onMounted(loadMember)

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) loadMember()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterLink to="/members" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to directory
      </RouterLink>

      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <div v-else-if="!member" class="text-center py-12">
        <UserCircleIcon class="mx-auto h-12 w-12 text-gray-300" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Member not found</h3>
        <p class="mt-2 text-gray-500">This member profile doesn't exist or has been removed.</p>
        <RouterLink
          to="/members"
          class="mt-5 inline-flex items-center px-4 py-2 bg-senpai-600 text-white rounded-lg text-sm font-medium hover:bg-senpai-700"
        >
          Back to directory
        </RouterLink>
      </div>

      <ProfileDisplay
        v-else
        :full-name="member.full_name"
        :photo-url="member.photo_url"
        :is-o-g-member="isOGMember"
        :roles="roles"
        :mbti="enrichment?.mbti || undefined"
        :subtitle="subtitle"
        :experience-label="experienceLabel"
        :member-since="memberSince"
        :goal="enrichment?.goal || undefined"
        :bio="member.bio"
        :school-line="schoolLine"
        :skills="member.skills"
        :primary-skill-id="member.primary_skill?.id"
        :recent-work="member.recent_work"
        :work-line="workLine"
        :unique-view="member.unique_view"
        :links="allLinks"
        :logistics-line="logisticsLine"
        :member-id="member?.id"
      />
    </div>
  </AppLayout>
</template>
