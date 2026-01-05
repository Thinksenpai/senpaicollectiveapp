<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { PublicMemberProfile } from '@/types'
import { useSkillsStore } from '@/stores/skills'
import { UserCircleIcon, MapPinIcon } from '@heroicons/vue/24/outline'

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
  const hasProfile = !!p

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
    badges: m.badges || []
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
  return 'Location not set'
})

const experienceLevelColors: Record<string, string> = {
  none: 'bg-gray-100 text-gray-700',
  junior: 'bg-green-100 text-green-700',
  mid: 'bg-blue-100 text-blue-700',
  senior: 'bg-purple-100 text-purple-700'
}
</script>

<template>
  <RouterLink
    :to="`/members/${memberData.id}`"
    class="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
  >
    <div class="p-6">
      <div class="flex items-start">
        <!-- Avatar -->
        <div class="flex-shrink-0">
          <div v-if="memberData.photo_url" class="h-14 w-14 rounded-full overflow-hidden">
            <img :src="memberData.photo_url" :alt="displayName" class="h-full w-full object-cover" />
          </div>
          <div v-else class="h-14 w-14 rounded-full bg-gray-100 flex items-center justify-center">
            <UserCircleIcon class="h-10 w-10 text-gray-400" />
          </div>
        </div>

        <!-- Info -->
        <div class="ml-4 flex-1 min-w-0">
          <h3 class="text-base font-semibold text-gray-900 group-hover:text-senpai-600 truncate">
            {{ displayName }}
          </h3>
          <p v-if="memberData.primary_skill_name" class="text-sm text-gray-600 truncate">
            {{ memberData.primary_skill_name }}
          </p>
          <div class="flex items-center mt-1 text-sm text-gray-500">
            <MapPinIcon class="h-4 w-4 mr-1 flex-shrink-0" />
            <span class="truncate">{{ displayLocation }}</span>
          </div>
        </div>

        <!-- Experience Level Badge -->
        <div v-if="memberData.hasProfile" class="flex-shrink-0 ml-2">
          <span :class="[
            'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
            experienceLevelColors[memberData.experience_level] || experienceLevelColors.none
          ]">
            {{ memberData.experience_level }}
          </span>
        </div>
        <!-- Incomplete Profile Badge -->
        <div v-else class="flex-shrink-0 ml-2">
          <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
            Incomplete
          </span>
        </div>
      </div>

      <!-- Bio Preview -->
      <p v-if="memberData.bio" class="mt-3 text-sm text-gray-600 line-clamp-2">
        {{ memberData.bio }}
      </p>
      <!-- No Profile Message -->
      <p v-else-if="!memberData.hasProfile" class="mt-3 text-sm text-gray-400 italic">
        Profile not yet completed
      </p>

      <!-- Badges -->
      <div v-if="memberData.badges && memberData.badges.length > 0" class="mt-3 flex flex-wrap gap-1">
        <span
          v-for="badge in memberData.badges"
          :key="badge"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-senpai-100 text-senpai-700"
        >
          {{ badge }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
