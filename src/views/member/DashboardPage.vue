<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import WelcomeModal from '@/components/member/WelcomeModal.vue'
import {
  UserCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
const membersStore = useMembersStore()

// Check if user has seen the welcome modal
const WELCOME_MODAL_KEY = 'senpai_welcome_seen'
const showWelcomeModal = ref(false)

const memberFirstName = computed(() => {
  return authStore.member?.profile?.full_name?.split(' ')[0] || 'Member'
})

onMounted(() => {
  membersStore.fetchDashboard()

  // Show welcome modal if user hasn't seen it
  const hasSeenWelcome = localStorage.getItem(WELCOME_MODAL_KEY)
  if (!hasSeenWelcome) {
    showWelcomeModal.value = true
  }
})

function handleWelcomeClose() {
  showWelcomeModal.value = false
  localStorage.setItem(WELCOME_MODAL_KEY, 'true')
}

const quickActions = [
  {
    name: 'View Profile',
    description: 'See how others see you',
    href: '/profile',
    icon: UserCircleIcon,
    color: 'bg-blue-500'
  },
  {
    name: 'Browse Directory',
    description: 'Discover fellow creatives',
    href: '/members',
    icon: UsersIcon,
    color: 'bg-green-500'
  },
  {
    name: 'Job Board',
    description: 'Find opportunities',
    href: '/jobs',
    icon: BriefcaseIcon,
    color: 'bg-purple-500'
  }
]
</script>

<template>
  <AppLayout>
    <!-- Welcome Modal for first-time users -->
    <WelcomeModal
      v-if="showWelcomeModal"
      :member-name="memberFirstName"
      @close="handleWelcomeClose"
    />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">
          Welcome back, {{ memberFirstName }}!
        </h1>
        <p class="mt-1 text-gray-600">
          Here's what's happening in the Senpai community.
        </p>
      </div>

      <!-- Scout Invitation Banner -->
      <div
        v-if="membersStore.dashboard?.pending_scout_invitation"
        class="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <SparklesIcon class="h-8 w-8 mr-4" />
            <div>
              <h3 class="font-semibold text-lg">You've been invited to become a Scout!</h3>
              <p class="text-indigo-100">Help grow the community and earn recognition.</p>
            </div>
          </div>
          <RouterLink
            to="/scout"
            class="inline-flex items-center px-4 py-2 bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
          >
            Learn More
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </RouterLink>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <RouterLink
            v-for="action in quickActions"
            :key="action.name"
            :to="action.href"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow group"
          >
            <div class="flex items-center">
              <div :class="[action.color, 'p-3 rounded-lg']">
                <component :is="action.icon" class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <h3 class="font-medium text-gray-900 group-hover:text-indigo-600">
                  {{ action.name }}
                </h3>
                <p class="text-sm text-gray-500">{{ action.description }}</p>
              </div>
            </div>
          </RouterLink>
        </div>
      </div>

      <!-- Profile Completeness -->
      <div v-if="authStore.member?.profile" class="mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-900">Profile Completeness</h2>
            <span class="text-sm font-medium text-indigo-600">
              {{ authStore.member.profile.profile_completeness }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              class="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: `${authStore.member.profile.profile_completeness}%` }"
            />
          </div>
          <div v-if="authStore.member.profile.profile_completeness < 100" class="flex items-center justify-between">
            <p class="text-sm text-gray-600">
              Complete your profile to get discovered by other members.
            </p>
            <RouterLink
              to="/profile/edit"
              class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Complete Profile
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="membersStore.loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Member Info Card -->
      <div v-if="authStore.member?.profile" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Your Profile Summary</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p class="text-sm text-gray-500">Primary Skill</p>
            <p class="font-medium text-gray-900">
              {{ authStore.member.profile.primary_skill?.name || 'Not set' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Experience Level</p>
            <p class="font-medium text-gray-900 capitalize">
              {{ authStore.member.profile.experience_level || 'Not set' }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Location</p>
            <p class="font-medium text-gray-900">
              {{ authStore.member.profile.city }}, {{ authStore.member.profile.country }}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Member Since</p>
            <p class="font-medium text-gray-900">
              {{ new Date(authStore.member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
