<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { PublicMemberProfile } from '@/types'
import { useSkillsStore } from '@/stores/skills'
import { UserCircleIcon, MapPinIcon } from '@heroicons/vue/24/outline'
import { ShieldCheckIcon, StarIcon, SparklesIcon } from '@heroicons/vue/24/solid'

interface Props {
  member: PublicMemberProfile & { profile?: any }
}

const props = defineProps<Props>()
const skillsStore = useSkillsStore()

// Handle both flat structure (from single member) and nested profile structure (from list)
const memberData = computed(() => {
  const m = props.member as any
  const p = m.profile

  // Check if member has a profile
  const hasProfile = !!p || !!m.full_name

  // Get primary skill - could be an object with name, or just an ID we need to look up
  let primarySkillName: string | null = null

  // First check if we have a skill object with name
  if (m.primary_skill?.name) {
    primarySkillName = m.primary_skill.name
  } else if (p?.primary_skill?.name) {
    primarySkillName = p.primary_skill.name
  } else {
    // Otherwise, look up by ID from skills store
    const skillId = m.primary_skill_id || p?.primary_skill_id
    if (skillId) {
      const skill = skillsStore.skills.find(s => s.id === skillId)
      primarySkillName = skill?.name || null
    }
  }

  // Normalize roles - could be array of objects {name: string} or array of strings
  const rawRoles = m.roles || []
  const roleNames = rawRoles.map((r: any) => typeof r === 'string' ? r : r.name).filter(Boolean)

  return {
    id: m.id,
    email: m.email,
    hasProfile,
    full_name: m.full_name || p?.full_name || null,
    photo_url: m.photo_url || p?.photo_url,
    city: m.city || p?.city || null,
    country: m.country || p?.country || null,
    bio: m.bio || p?.bio,
    experience_level: m.experience_level || p?.experience_level || 'none',
    primary_skill_name: primarySkillName,
    skills: m.skills || [],
    badges: m.badges || [],
    roles: roleNames
  }
})

// Display name - use full_name if available, otherwise email username
const displayName = computed(() => {
  if (memberData.value.full_name) {
    return memberData.value.full_name
  }
  // Extract username from email as fallback
  if (memberData.value.email) {
    return memberData.value.email.split('@')[0]
  }
  return 'Unknown Member'
})

// Display location
const displayLocation = computed(() => {
  const { city, country } = memberData.value
  if (city && country) return `${city}, ${country}`
  if (city) return city
  if (country) return country
  return null
})

// Check for special roles from roles array (normalized to strings)
const isAdmin = computed(() => {
  const roles = memberData.value.roles || []
  return roles.some((r: string) => r.toLowerCase() === 'admin')
})

const isScout = computed(() => {
  const roles = memberData.value.roles || []
  return roles.some((r: string) => r.toLowerCase() === 'scout')
})

// OG Member comes from badges, not roles
const isOG = computed(() => {
  const badges = memberData.value.badges || []
  return badges.some((b: string) => b.toLowerCase() === 'og member' || b.toLowerCase() === 'og')
})

const experienceLevelLabels: Record<string, string> = {
  none: 'New',
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior'
}

const experienceLevelColors: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600',
  junior: 'bg-emerald-50 text-emerald-700',
  mid: 'bg-blue-50 text-blue-700',
  senior: 'bg-purple-50 text-purple-700'
}
</script>

<template>
  <RouterLink
    :to="`/members/${memberData.id}`"
    class="block bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
  >
    <!-- Card Content -->
    <div class="p-5">
      <!-- Top Section: Avatar + Name -->
      <div class="flex items-start gap-4">
        <!-- Avatar with Role Indicator -->
        <div class="relative flex-shrink-0">
          <div
            :class="[
              'h-16 w-16 rounded-full overflow-hidden ring-2 ring-offset-2',
              isAdmin ? 'ring-red-400' : isScout ? 'ring-amber-400' : 'ring-gray-100'
            ]"
          >
            <img
              v-if="memberData.photo_url"
              :src="memberData.photo_url"
              :alt="displayName"
              class="h-full w-full object-cover"
            />
            <div v-else class="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <UserCircleIcon class="h-10 w-10 text-gray-400" />
            </div>
          </div>
          <!-- Role Icon Badge -->
          <div
            v-if="isAdmin"
            class="absolute -bottom-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center ring-2 ring-white"
            title="Admin"
          >
            <ShieldCheckIcon class="h-3.5 w-3.5 text-white" />
          </div>
          <div
            v-else-if="isScout"
            class="absolute -bottom-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center ring-2 ring-white"
            title="Scout"
          >
            <StarIcon class="h-3.5 w-3.5 text-white" />
          </div>
          <div
            v-else-if="isOG"
            class="absolute -bottom-1 -right-1 h-6 w-6 bg-indigo-500 rounded-full flex items-center justify-center ring-2 ring-white"
            title="OG Member"
          >
            <SparklesIcon class="h-3.5 w-3.5 text-white" />
          </div>
        </div>

        <!-- Name & Primary Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-indigo-600 truncate transition-colors">
            {{ displayName }}
          </h3>
          <p v-if="memberData.primary_skill_name" class="text-sm text-gray-600 truncate">
            {{ memberData.primary_skill_name }}
          </p>
          <div v-if="displayLocation" class="flex items-center mt-1 text-xs text-gray-500">
            <MapPinIcon class="h-3.5 w-3.5 mr-1 flex-shrink-0" />
            <span class="truncate">{{ displayLocation }}</span>
          </div>
        </div>
      </div>

      <!-- Bio Preview -->
      <p v-if="memberData.bio" class="mt-4 text-sm text-gray-600 line-clamp-2 leading-relaxed">
        {{ memberData.bio }}
      </p>
      <p v-else-if="!memberData.hasProfile" class="mt-4 text-sm text-gray-400 italic">
        Profile not yet completed
      </p>

      <!-- Bottom Section: Tags -->
      <div class="mt-4 flex flex-wrap items-center gap-2">
        <!-- Experience Level -->
        <span
          v-if="memberData.hasProfile"
          :class="[
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            experienceLevelColors[memberData.experience_level] || experienceLevelColors.none
          ]"
        >
          {{ experienceLevelLabels[memberData.experience_level] || 'New' }}
        </span>

        <!-- Role Tags -->
        <span
          v-if="isAdmin"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700"
        >
          <ShieldCheckIcon class="h-3 w-3" />
          Admin
        </span>
        <span
          v-if="isScout"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700"
        >
          <StarIcon class="h-3 w-3" />
          Scout
        </span>
        <span
          v-if="isOG"
          class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700"
        >
          <SparklesIcon class="h-3 w-3" />
          OG
        </span>

        <!-- Skills (show first 2) -->
        <template v-if="memberData.skills && memberData.skills.length > 0">
          <span
            v-for="skill in memberData.skills.slice(0, 2)"
            :key="skill.id"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
          >
            {{ skill.name }}
          </span>
          <span
            v-if="memberData.skills.length > 2"
            class="text-xs text-gray-400"
          >
            +{{ memberData.skills.length - 2 }}
          </span>
        </template>
      </div>
    </div>
  </RouterLink>
</template>
