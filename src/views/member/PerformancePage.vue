<script setup lang="ts">
import { onMounted } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  ChartBarIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  StarIcon,
  TrophyIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon
} from '@heroicons/vue/24/outline'

const jobsStore = useJobsStore()

onMounted(() => {
  jobsStore.fetchMyPerformance()
})

function formatPercent(value: number): string {
  return `${Math.round(value)}%`
}

function formatRating(value: number): string {
  return value.toFixed(1)
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
        <p class="mt-1 text-gray-600">
          Track your job performance and client ratings.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="jobsStore.loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="jobsStore.error"
        class="text-center py-12 bg-white rounded-lg"
      >
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Error loading performance data</h3>
        <p class="mt-2 text-gray-600">{{ jobsStore.error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="jobsStore.fetchMyPerformance">
          Try again
        </BaseButton>
      </div>

      <!-- No Data State -->
      <div
        v-else-if="!jobsStore.myPerformance"
        class="text-center py-12 bg-white rounded-lg"
      >
        <ChartBarIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No performance data yet</h3>
        <p class="mt-2 text-gray-600">
          Complete your first job to start building your performance record.
        </p>
        <BaseButton variant="outline" class="mt-4" to="/jobs">
          Browse Jobs
        </BaseButton>
      </div>

      <!-- Performance Dashboard -->
      <div v-else class="space-y-6">
        <!-- Badges -->
        <div v-if="jobsStore.myPerformance.is_top_performer || jobsStore.myPerformance.is_recommended" class="flex flex-wrap gap-3">
          <div
            v-if="jobsStore.myPerformance.is_top_performer"
            class="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full"
          >
            <TrophyIcon class="h-5 w-5 mr-2" />
            <span class="font-medium">Top Performer</span>
          </div>
          <div
            v-if="jobsStore.myPerformance.is_recommended"
            class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full"
          >
            <StarIcon class="h-5 w-5 mr-2" />
            <span class="font-medium">Recommended</span>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Jobs Completed -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon class="h-6 w-6 text-green-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Jobs Completed</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ jobsStore.myPerformance.total_jobs_completed }}
                </p>
              </div>
            </div>
          </div>

          <!-- On-Time Rate -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg">
                <ClockIcon class="h-6 w-6 text-blue-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">On-Time Delivery</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ jobsStore.myPerformance.total_jobs_assigned > 0
                    ? formatPercent((jobsStore.myPerformance.jobs_completed_on_time / jobsStore.myPerformance.total_jobs_assigned) * 100)
                    : 'N/A'
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Client Rating -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-2 bg-yellow-100 rounded-lg">
                <StarIcon class="h-6 w-6 text-yellow-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Avg. Client Rating</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ jobsStore.myPerformance.avg_client_rating > 0
                    ? formatRating(jobsStore.myPerformance.avg_client_rating)
                    : 'N/A'
                  }}
                  <span v-if="jobsStore.myPerformance.avg_client_rating > 0" class="text-sm text-gray-400">/5</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Application Success Rate -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg">
                <ArrowTrendingUpIcon class="h-6 w-6 text-purple-600" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">Hire Rate</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatPercent(jobsStore.myPerformance.application_success_rate) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Detailed Stats -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Detailed Statistics</h2>
          </div>
          <div class="p-6">
            <dl class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt class="text-sm text-gray-500">Total Applications</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.total_applications }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Applications Hired</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.applications_hired }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Jobs Assigned</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.total_jobs_assigned }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Completed On Time</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.jobs_completed_on_time }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Client Reviews</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.total_client_reviews }}
                </dd>
              </div>
              <div>
                <dt class="text-sm text-gray-500">Internal Rating</dt>
                <dd class="mt-1 text-xl font-semibold text-gray-900">
                  {{ jobsStore.myPerformance.avg_internal_rating > 0
                    ? formatRating(jobsStore.myPerformance.avg_internal_rating) + '/5'
                    : 'N/A'
                  }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <!-- CTA -->
        <div class="bg-gray-50 rounded-lg p-6 text-center">
          <p class="text-gray-600 mb-4">
            Keep applying to jobs and delivering great work to improve your performance metrics!
          </p>
          <BaseButton to="/jobs">
            <BriefcaseIcon class="h-5 w-5 mr-2" />
            Browse Jobs
          </BaseButton>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
