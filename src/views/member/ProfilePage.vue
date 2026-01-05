<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import {
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  PencilIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const member = computed(() => authStore.member)
const profile = computed(() => authStore.member?.profile)

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const badges = computed(() => {
  const result: string[] = []
  if (profile.value?.is_og_member) result.push('OG Member')
  if (authStore.isScout) result.push('Scout')
  if (authStore.isAdmin) result.push('Admin')
  return result
})
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16">
            <div class="flex-shrink-0">
              <div v-if="profile?.photo_url" class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img :src="profile.photo_url" :alt="profile.full_name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                <UserCircleIcon class="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
              </div>
            </div>
            <div class="mt-4 sm:mt-0 sm:ml-6 sm:pb-1 flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 class="text-2xl font-bold text-gray-900">{{ profile?.full_name }}</h1>
                  <p class="text-gray-600">{{ profile?.primary_skill?.name }}</p>
                </div>
                <RouterLink
                  to="/profile/edit"
                  class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <PencilIcon class="h-4 w-4 mr-2" />
                  Edit Profile
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Badges -->
          <div v-if="badges.length > 0" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="badge in badges"
              :key="badge"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {{ badge }}
            </span>
          </div>

          <!-- Location & Member Since -->
          <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div class="flex items-center">
              <MapPinIcon class="h-4 w-4 mr-1" />
              {{ profile?.city }}, {{ profile?.country }}
            </div>
            <div class="flex items-center">
              <span class="capitalize">{{ experienceLevelLabels[profile?.experience_level || 'none'] }}</span>
            </div>
            <div>
              Member since {{ new Date(member?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Bio -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">About</h2>
        <p class="text-gray-700 whitespace-pre-line">{{ profile?.bio || 'No bio added yet.' }}</p>
      </div>

      <!-- Skills -->
      <div v-if="member?.skills && member.skills.length > 0" class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in member.skills"
            :key="skill.id"
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              skill.id === profile?.primary_skill_id
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ skill.name }}
            <span v-if="skill.id === profile?.primary_skill_id" class="ml-1 text-xs">(Primary)</span>
          </span>
        </div>
      </div>

      <!-- Learning & Teaching -->
      <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div v-if="profile?.want_to_learn" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center mb-3">
            <AcademicCapIcon class="h-5 w-5 text-indigo-600 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">Want to Learn</h2>
          </div>
          <p class="text-gray-700">{{ profile.want_to_learn }}</p>
        </div>

        <div v-if="profile?.can_teach" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center mb-3">
            <LightBulbIcon class="h-5 w-5 text-yellow-500 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">Can Teach</h2>
          </div>
          <p class="text-gray-700">{{ profile.can_teach }}</p>
        </div>
      </div>

      <!-- Portfolio & Links -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Links</h2>
        <div class="space-y-2">
          <a
            v-if="profile?.portfolio_url"
            :href="profile.portfolio_url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            {{ profile.portfolio_url }}
          </a>
          <a
            v-for="(link, index) in profile?.additional_links"
            :key="index"
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            {{ link }}
          </a>
        </div>
      </div>

      <!-- Why Senpai (Private) -->
      <div v-if="profile?.why_senpai" class="mt-6 bg-gray-50 rounded-lg p-6 border border-gray-200">
        <p class="text-xs text-gray-500 uppercase tracking-wide mb-2">Private - Only visible to you</p>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Why I Joined Senpai</h2>
        <p class="text-gray-700">{{ profile.why_senpai }}</p>
      </div>
    </div>
  </AppLayout>
</template>
