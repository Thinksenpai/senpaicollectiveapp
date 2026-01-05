<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { membersApi } from '@/api'
import type { PublicMemberProfile } from '@/types'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  AcademicCapIcon,
  LightBulbIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()

const loading = ref(true)
const member = ref<PublicMemberProfile | null>(null)
const error = ref<string | null>(null)

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

onMounted(async () => {
  loading.value = true
  try {
    const response = await membersApi.getPublicMember(route.params.id as string)
    if (response.status && response.data) {
      member.value = response.data
    } else {
      error.value = 'Profile not found'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to load profile'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <RouterLink to="/" class="text-2xl font-bold text-indigo-600">Senpai</RouterLink>
          <div class="flex items-center gap-4">
            <RouterLink
              to="/login"
              class="text-sm font-medium text-gray-700 hover:text-indigo-600"
            >
              Sign in
            </RouterLink>
            <RouterLink
              to="/join"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              Join Now
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error / Not Found -->
      <div v-else-if="error || !member" class="text-center py-12 bg-white rounded-lg">
        <UserCircleIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">Profile not found</h3>
        <p class="mt-2 text-gray-600">
          This profile doesn't exist or is not publicly available.
        </p>
        <RouterLink
          to="/"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Go Home
        </RouterLink>
      </div>

      <!-- Profile -->
      <template v-else>
        <!-- Profile Header -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
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

            <!-- Badges -->
            <div v-if="member.badges && member.badges.length > 0" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="badge in member.badges"
                :key="badge"
                class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
              >
                {{ badge }}
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
            </span>
          </div>
        </div>

        <!-- Learning & Teaching -->
        <div class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div v-if="member.want_to_learn" class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center mb-3">
              <AcademicCapIcon class="h-5 w-5 text-indigo-600 mr-2" />
              <h2 class="text-lg font-semibold text-gray-900">Want to Learn</h2>
            </div>
            <p class="text-gray-700">{{ member.want_to_learn }}</p>
          </div>

          <div v-if="member.can_teach" class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center mb-3">
              <LightBulbIcon class="h-5 w-5 text-yellow-500 mr-2" />
              <h2 class="text-lg font-semibold text-gray-900">Can Teach</h2>
            </div>
            <p class="text-gray-700">{{ member.can_teach }}</p>
          </div>
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
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ member.portfolio_url }}
            </a>
            <a
              v-for="(link, index) in member.additional_links"
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

        <!-- CTA -->
        <div class="mt-8 bg-indigo-50 rounded-lg p-6 text-center">
          <h3 class="font-semibold text-indigo-900 mb-2">Want to connect with {{ member.full_name.split(' ')[0] }}?</h3>
          <p class="text-indigo-700 text-sm mb-4">
            Join the Senpai Collective to connect with talented creatives like {{ member.full_name.split(' ')[0] }}.
          </p>
          <RouterLink
            to="/join"
            class="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700"
          >
            Apply to Join
          </RouterLink>
        </div>
      </template>
    </div>
  </div>
</template>
