<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMembersStore } from '@/stores/members'
import { useJobsStore } from '@/stores/jobs'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import WelcomeModal from '@/components/member/WelcomeModal.vue'
import {
  UserCircleIcon,
  UsersIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  LightBulbIcon,
  HeartIcon
} from '@heroicons/vue/24/outline'
import { SENPAI_MANIFESTO } from '@/content/manifesto'

const authStore = useAuthStore()
const membersStore = useMembersStore()
const jobsStore = useJobsStore()

// Check if user has seen the welcome modal
const WELCOME_MODAL_KEY = 'senpai_welcome_seen'
const showWelcomeModal = ref(false)

const memberFirstName = computed(() => {
  return authStore.member?.profile?.full_name?.split(' ')[0] || 'Member'
})

const memberSince = computed(() => {
  if (!authStore.member?.created_at) return ''
  return new Date(authStore.member.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Random daily value from manifesto
const dailyValue = computed(() => {
  const today = new Date().getDay()
  return SENPAI_MANIFESTO.values[today % SENPAI_MANIFESTO.values.length]
})

// Greeting based on time of day
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

// Community stats from stores
const totalMembers = computed(() => membersStore.pagination?.total || null)
const openJobs = computed(() => jobsStore.pagination?.total || null)

onMounted(() => {
  membersStore.fetchDashboard()
  // Fetch members and jobs to get counts
  membersStore.fetchMembers({ limit: 1 })
  jobsStore.fetchJobs({ limit: 1 })

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
</script>

<template>
  <AppLayout>
    <!-- Welcome Modal for first-time users -->
    <WelcomeModal
      v-if="showWelcomeModal"
      :member-name="memberFirstName"
      @close="handleWelcomeClose"
    />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section -->
      <div class="mb-10">
        <div class="flex items-start justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              {{ greeting }}, {{ memberFirstName }}.
            </h1>
            <p class="mt-2 text-lg text-gray-600">
              You are Senpai. What will you build today?
            </p>
          </div>
          <div class="hidden sm:block text-right">
            <p class="text-sm text-gray-500">Member since</p>
            <p class="font-medium text-gray-900">{{ memberSince }}</p>
          </div>
        </div>
      </div>

      <!-- Scout Invitation Banner -->
      <div
        v-if="membersStore.dashboard?.pending_scout_invitation"
        class="mb-8 bg-gradient-to-r from-senpai-600 to-senpai-500 rounded-2xl p-6 text-white"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <SparklesIcon class="h-8 w-8 mr-4" />
            <div>
              <h3 class="font-semibold text-lg">You've been invited to become a Scout!</h3>
              <p class="text-senpai-100">Help grow the community and build the next generation.</p>
            </div>
          </div>
          <RouterLink
            to="/scout"
            class="inline-flex items-center px-4 py-2 bg-white text-senpai-600 rounded-lg font-medium hover:bg-senpai-50 transition-colors"
          >
            Learn More
            <ArrowRightIcon class="h-4 w-4 ml-2" />
          </RouterLink>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column - 2/3 width -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Daily Reminder -->
          <div class="bg-gray-900 rounded-2xl p-6 text-white">
            <div class="flex items-start gap-4">
              <div class="shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                <LightBulbIcon class="h-6 w-6" />
              </div>
              <div>
                <p class="text-sm text-gray-400 mb-1">Today's Reminder</p>
                <h3 class="text-lg font-semibold mb-2">{{ dailyValue?.name || 'Daily Value' }}</h3>
                <p class="text-gray-300 text-sm">{{ dailyValue?.insight || 'Focus on growth and collaboration' }}</p>
              </div>
            </div>
          </div>

          <!-- Your Focus Areas -->
          <div>
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Take Action</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Find Collaborators -->
              <RouterLink
                to="/members"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <UsersIcon class="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Find Collaborators</h3>
                    <p class="text-sm text-gray-500">Connect with other builders</p>
                  </div>
                </div>
              </RouterLink>

              <!-- Browse Opportunities -->
              <RouterLink
                to="/jobs"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <BriefcaseIcon class="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Find Opportunities</h3>
                    <p class="text-sm text-gray-500">Jobs from the collective</p>
                  </div>
                </div>
              </RouterLink>

              <!-- Update Profile -->
              <RouterLink
                to="/profile/edit"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <UserCircleIcon class="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">Update Profile</h3>
                    <p class="text-sm text-gray-500">Show what you're building</p>
                  </div>
                </div>
              </RouterLink>

              <!-- View Your Public Profile -->
              <RouterLink
                to="/profile"
                class="bg-white rounded-xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-md transition-all group"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <RocketLaunchIcon class="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900 group-hover:text-senpai-600">View Profile</h3>
                    <p class="text-sm text-gray-500">See how others see you</p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </div>

          <!-- What You're Here For -->
          <div class="bg-gray-50 rounded-2xl p-6">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">Remember Why You're Here</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <AcademicCapIcon class="h-6 w-6 text-senpai-600" />
                </div>
                <h3 class="font-medium text-gray-900 mb-1">Information</h3>
                <p class="text-sm text-gray-500">Access knowledge that's usually gatekept</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg class="h-6 w-6 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                  </svg>
                </div>
                <h3 class="font-medium text-gray-900 mb-1">Structure</h3>
                <p class="text-sm text-gray-500">Frameworks to turn ambition into action</p>
              </div>
              <div class="text-center p-4">
                <div class="w-12 h-12 bg-senpai-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <UsersIcon class="h-6 w-6 text-senpai-600" />
                </div>
                <h3 class="font-medium text-gray-900 mb-1">People</h3>
                <p class="text-sm text-gray-500">Builders who get it and push you forward</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column - 1/3 width -->
        <div class="space-y-6">
          <!-- Profile Card -->
          <div v-if="authStore.member?.profile" class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="bg-gray-900 px-6 py-4">
              <p class="text-sm text-gray-400">Your Profile</p>
            </div>
            <div class="p-6">
              <div class="flex items-center gap-4 mb-4">
                <div class="w-14 h-14 bg-senpai-100 rounded-full flex items-center justify-center">
                  <span class="text-xl font-bold text-senpai-600">
                    {{ memberFirstName.charAt(0) }}
                  </span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ authStore.member.profile.full_name }}</h3>
                  <p class="text-sm text-gray-500">{{ authStore.member.profile.primary_skill?.name || 'Creative' }}</p>
                </div>
              </div>

              <!-- Profile Completeness -->
              <div class="mb-4">
                <div class="flex items-center justify-between text-sm mb-1">
                  <span class="text-gray-600">Profile Strength</span>
                  <span class="font-medium text-senpai-600">{{ authStore.member.profile.profile_completeness }}%</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-2">
                  <div
                    class="bg-senpai-500 h-2 rounded-full transition-all duration-500"
                    :style="{ width: `${authStore.member.profile.profile_completeness}%` }"
                  />
                </div>
              </div>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-500">Experience</span>
                  <span class="text-gray-900 capitalize">{{ authStore.member.profile.experience_level || 'Not set' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-500">Location</span>
                  <span class="text-gray-900">{{ authStore.member.profile.city }}, {{ authStore.member.profile.country }}</span>
                </div>
              </div>

              <RouterLink
                v-if="authStore.member.profile.profile_completeness < 100"
                to="/profile/edit"
                class="mt-4 block w-full text-center py-2 px-4 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Complete Your Profile
              </RouterLink>
            </div>
          </div>

          <!-- The Pledge Reminder -->
          <div class="bg-gray-50 rounded-2xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-4">
              <HeartIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Your Pledge</h3>
            </div>
            <div class="space-y-2 text-sm text-gray-600 italic">
              <p>I pledge to grow — every single day.</p>
              <p>I pledge to build — things that matter.</p>
              <p>I pledge to lift — those coming behind me.</p>
            </div>
            <RouterLink
              to="/manifesto"
              class="mt-4 inline-flex items-center text-sm text-senpai-600 hover:text-senpai-700 font-medium"
            >
              Read full manifesto
              <ArrowRightIcon class="h-3 w-3 ml-1" />
            </RouterLink>
          </div>

          <!-- Community Stats -->
          <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 class="font-semibold text-gray-900 mb-4">The Collective</h3>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UsersIcon class="h-4 w-4 text-blue-600" />
                  </div>
                  <span class="text-sm text-gray-600">Members</span>
                </div>
                <span class="font-semibold text-gray-900">{{ totalMembers ?? '—' }}</span>
              </div>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <BriefcaseIcon class="h-4 w-4 text-green-600" />
                  </div>
                  <span class="text-sm text-gray-600">Open Jobs</span>
                </div>
                <span class="font-semibold text-gray-900">{{ openJobs ?? '—' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="membersStore.loading" class="fixed inset-0 bg-white/50 flex justify-center items-center z-50">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  </AppLayout>
</template>
