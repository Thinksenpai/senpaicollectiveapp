<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Job } from '@/types'
import { useSkillsStore } from '@/stores/skills'
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

interface Props {
  job: Job
}

const props = defineProps<Props>()
const skillsStore = useSkillsStore()

const jobTypeLabels: Record<string, string> = {
  full_time: 'Full Time',
  contract: 'Contract',
  project: 'Project',
  internship: 'Internship'
}

const jobTypeColors: Record<string, string> = {
  full_time: 'bg-blue-100 text-blue-700',
  contract: 'bg-purple-100 text-purple-700',
  project: 'bg-green-100 text-green-700',
  internship: 'bg-orange-100 text-orange-700'
}

const listingTypeStyles: Record<string, { badge: string; border: string }> = {
  basic: { badge: '', border: '' },
  featured: { badge: 'bg-yellow-100 text-yellow-700', border: 'ring-2 ring-yellow-400' },
  premium: { badge: 'bg-senpai-100 text-senpai-700', border: 'ring-2 ring-senpai-500' }
}

const skillNames = computed(() => {
  if (props.job.skills && props.job.skills.length > 0) {
    return props.job.skills.map(s => s.name)
  }
  return props.job.skills_needed
    .map(id => skillsStore.getSkillName(id))
    .filter(Boolean)
})

const displayedSkills = computed(() => skillNames.value.slice(0, 3))
const remainingSkillsCount = computed(() => Math.max(0, skillNames.value.length - 3))

const isFeatured = computed(() => props.job.listing_type === 'featured')
const isPremium = computed(() => props.job.listing_type === 'premium')
</script>

<template>
  <RouterLink
    :to="`/jobs/${job.id}`"
    :class="[
      'block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group',
      listingTypeStyles[job.listing_type]?.border
    ]"
  >
    <div class="p-6">
      <!-- Header with badges -->
      <div class="flex items-start justify-between gap-2 mb-3">
        <div class="flex items-center gap-2 flex-wrap">
          <span
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              jobTypeColors[job.job_type] || 'bg-gray-100 text-gray-700'
            ]"
          >
            {{ jobTypeLabels[job.job_type] || job.job_type }}
          </span>
          <span
            v-if="isFeatured"
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              listingTypeStyles.featured?.badge || ''
            ]"
          >
            <StarIcon class="h-3 w-3 mr-1" />
            Featured
          </span>
          <span
            v-if="isPremium"
            :class="[
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              listingTypeStyles.premium?.badge || ''
            ]"
          >
            <StarIcon class="h-3 w-3 mr-1" />
            Premium
          </span>
        </div>
        <span
          v-if="job.application_count !== undefined"
          class="inline-flex items-center text-xs text-gray-500"
        >
          <UserGroupIcon class="h-4 w-4 mr-1" />
          {{ job.application_count }} applicant{{ job.application_count !== 1 ? 's' : '' }}
        </span>
      </div>

      <!-- Title -->
      <h3 class="text-lg font-semibold text-gray-900 group-hover:text-senpai-600 mb-2 line-clamp-2">
        {{ job.title }}
      </h3>

      <!-- Company -->
      <div class="flex items-center text-sm text-gray-600 mb-3">
        <BuildingOfficeIcon class="h-4 w-4 mr-1.5 flex-shrink-0" />
        <span class="truncate">{{ job.company_name }}</span>
      </div>

      <!-- Description preview -->
      <p class="text-sm text-gray-600 line-clamp-2 mb-4">
        {{ job.description }}
      </p>

      <!-- Skills -->
      <div v-if="displayedSkills.length > 0" class="flex flex-wrap gap-1.5 mb-4">
        <span
          v-for="skill in displayedSkills"
          :key="skill"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
        >
          {{ skill }}
        </span>
        <span
          v-if="remainingSkillsCount > 0"
          class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500"
        >
          +{{ remainingSkillsCount }} more
        </span>
      </div>

      <!-- Footer info -->
      <div class="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
        <span v-if="job.budget_range" class="inline-flex items-center">
          <CurrencyDollarIcon class="h-4 w-4 mr-1" />
          {{ job.budget_range }}
        </span>
        <span v-if="job.timeline" class="inline-flex items-center">
          <ClockIcon class="h-4 w-4 mr-1" />
          {{ job.timeline }}
        </span>
      </div>
    </div>
  </RouterLink>
</template>
