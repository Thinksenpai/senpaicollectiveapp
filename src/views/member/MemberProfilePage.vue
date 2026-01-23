<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useMembersStore } from '@/stores/members'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { Role } from '@/types'
import {
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  ArrowLeftIcon,
  SparklesIcon,
  RocketLaunchIcon
} from '@heroicons/vue/24/outline'
import {
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/vue/24/solid'

const route = useRoute()
const membersStore = useMembersStore()

const loading = ref(true)

const member = computed(() => membersStore.currentMember)

// Check if profile has meaningful data
const hasProfile = computed(() => {
  const m = member.value
  return m && (m.full_name || m.bio || m.city)
})

// Get roles from member data
const roles = computed(() => {
  const m = member.value as any
  if (!m?.roles) return []
  // Normalize roles - could be array of objects or strings
  return m.roles.map((r: any) => {
    if (typeof r === 'string') {
      return { id: r, name: r, description: '' }
    }
    return r
  })
})

// Check for OG Member badge
const isOGMember = computed(() => {
  const badges = member.value?.badges || []
  return badges.some(b => b.toLowerCase() === 'og member' || b.toLowerCase() === 'og')
})

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

// Role styling based on role name
const getRoleStyle = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        icon: ShieldCheckIcon,
        iconColor: 'text-red-500'
      }
    case 'scout':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        icon: StarIcon,
        iconColor: 'text-amber-500'
      }
    default:
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        icon: SparklesSolidIcon,
        iconColor: 'text-indigo-500'
      }
  }
}

async function loadMember() {
  loading.value = true
  await membersStore.fetchMember(route.params.id as string)
  loading.value = false
}

onMounted(loadMember)

// Re-fetch when route changes (navigating between members)
watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    loadMember()
  }
})
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Link -->
      <RouterLink
        to="/members"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to Directory
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!member" class="text-center py-12 bg-white rounded-lg">
        <UserCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Member not found</h3>
        <p class="mt-2 text-gray-600">
          This member profile doesn't exist or has been removed.
        </p>
        <RouterLink
          to="/members"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Directory
        </RouterLink>
      </div>

      <!-- Incomplete Profile -->
      <div v-else-if="!hasProfile" class="text-center py-12 bg-white rounded-lg">
        <UserCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Profile Incomplete</h3>
        <p class="mt-2 text-gray-600">
          This member hasn't completed their profile yet.
        </p>
        <RouterLink
          to="/members"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Directory
        </RouterLink>
      </div>

      <!-- Profile -->
      <template v-else>
        <!-- Profile Header -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-indigo-500 to-indigo-600" />
          <div class="px-6 pb-6">
            <div class="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16">
              <div class="flex-shrink-0">
                <div v-if="member.photo_url" class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  <img :src="member.photo_url" :alt="member.full_name" class="h-full w-full object-cover" />
                </div>
                <div v-else class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                  <UserCircleIcon class="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
                </div>
              </div>
              <div class="mt-4 sm:mt-0 sm:ml-6 sm:pb-1 flex-1">
                <h1 class="text-2xl font-bold text-gray-900">{{ member.full_name }}</h1>
                <p class="text-gray-600">{{ member.primary_skill?.name }}</p>
              </div>
            </div>

            <!-- Roles & Badges -->
            <div v-if="roles.length > 0 || isOGMember" class="mt-4 flex flex-wrap gap-2">
              <!-- OG Member Badge -->
              <span
                v-if="isOGMember"
                class="group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 cursor-help"
              >
                <SparklesSolidIcon class="h-3.5 w-3.5 text-indigo-500" />
                OG Member
                <span class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                  Original community member
                </span>
              </span>
              <!-- Role Badges -->
              <span
                v-for="role in roles"
                :key="role.id"
                :class="[
                  'group relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium cursor-help',
                  getRoleStyle(role.name).bg,
                  getRoleStyle(role.name).text
                ]"
              >
                <component :is="getRoleStyle(role.name).icon" :class="['h-3.5 w-3.5', getRoleStyle(role.name).iconColor]" />
                {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
                <span
                  v-if="role.description"
                  class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10 max-w-xs text-center"
                >
                  {{ role.description }}
                </span>
              </span>
            </div>

            <!-- Location & Experience -->
            <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div class="flex items-center">
                <MapPinIcon class="h-4 w-4 mr-1" />
                {{ member.city }}, {{ member.country }}
              </div>
              <div class="flex items-center">
                <span class="capitalize">{{ experienceLevelLabels[member.experience_level] }}</span>
              </div>
              <div>
                Member since {{ new Date(member.member_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">About</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ member.bio }}</p>
        </div>

        <!-- Skills -->
        <div v-if="member.skills && member.skills.length > 0" class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in member.skills"
              :key="skill.id"
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                skill.id === member.primary_skill?.id
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-800'
              ]"
            >
              {{ skill.name }}
              <span v-if="skill.id === member.primary_skill?.id" class="ml-1 text-xs">(Primary)</span>
            </span>
          </div>
        </div>

        <!-- Recent Work -->
        <div v-if="member.recent_work" class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center mb-3">
            <RocketLaunchIcon class="h-5 w-5 text-indigo-600 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">Recent Work</h2>
          </div>
          <p class="text-gray-700 whitespace-pre-line">{{ member.recent_work }}</p>
        </div>

        <!-- Unique View -->
        <div v-if="member.unique_view" class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center mb-3">
            <SparklesIcon class="h-5 w-5 text-indigo-600 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">My Unique View</h2>
          </div>
          <p class="text-gray-700 whitespace-pre-line">{{ member.unique_view }}</p>
        </div>

        <!-- Portfolio & Links -->
        <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Links</h2>
          <div class="space-y-2">
            <a
              v-if="member.portfolio_url"
              :href="member.portfolio_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ member.portfolio_url }}
            </a>
            <a
              v-for="(link, index) in member.additional_links"
              :key="index"
              :href="typeof link === 'string' ? link : link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-700"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              <span v-if="typeof link !== 'string' && link.label" class="text-gray-500 mr-1">{{ link.label }}:</span>
              {{ typeof link === 'string' ? link : link.url }}
            </a>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
