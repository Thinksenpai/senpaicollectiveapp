<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import { jobsApi } from '@/api'
import type { Job } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  UsersIcon,
  ClipboardDocumentCheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

// Pending jobs state
const pendingJobs = ref<Job[]>([])
const pendingJobsLoading = ref(false)
const pendingJobsCount = ref(0)
const approving = ref<string | null>(null)
const rejecting = ref<string | null>(null)

async function fetchPendingJobs() {
  pendingJobsLoading.value = true
  try {
    const response = await jobsApi.getPendingJobs(5, 0)
    if (response.status && response.data) {
      pendingJobs.value = response.data
      pendingJobsCount.value = response.pagination?.total || response.data.length
    }
  } catch (e) {
    console.error('Failed to fetch pending jobs:', e)
  } finally {
    pendingJobsLoading.value = false
  }
}

async function approveJob(jobId: string) {
  approving.value = jobId
  try {
    const response = await jobsApi.approveJob(jobId)
    if (response.status) {
      pendingJobs.value = pendingJobs.value.filter(j => j.id !== jobId)
      pendingJobsCount.value = Math.max(0, pendingJobsCount.value - 1)
    }
  } catch (e) {
    console.error('Failed to approve job:', e)
  } finally {
    approving.value = null
  }
}

async function rejectJob(jobId: string) {
  const reason = prompt('Please provide a reason for rejection:')
  if (!reason) return

  rejecting.value = jobId
  try {
    const response = await jobsApi.rejectJob(jobId, reason)
    if (response.status) {
      pendingJobs.value = pendingJobs.value.filter(j => j.id !== jobId)
      pendingJobsCount.value = Math.max(0, pendingJobsCount.value - 1)
    }
  } catch (e) {
    console.error('Failed to reject job:', e)
  } finally {
    rejecting.value = null
  }
}

onMounted(() => {
  adminStore.fetchStatistics()
  adminStore.fetchApplications({ limit: 5 })
  fetchPendingJobs()
})

const statCards = [
  { name: 'Total Members', key: 'total_members', icon: UsersIcon, color: 'bg-blue-500', href: '/admin/members' },
  { name: 'Approved', key: 'approved_members', icon: UserGroupIcon, color: 'bg-green-500', href: '/admin/members' },
  { name: 'Pending Applications', key: 'pending_applications', icon: ClipboardDocumentCheckIcon, color: 'bg-yellow-500', href: '/admin/applications' },
  { name: 'Pending Jobs', key: 'pending_jobs', icon: BriefcaseIcon, color: 'bg-orange-500', usePendingJobsCount: true, href: '/admin/jobs' }
]
</script>

<template>
  <AdminLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="mt-1 text-gray-600">Platform overview and management.</p>
      </div>

      <!-- Loading -->
      <div v-if="adminStore.statsLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <RouterLink
            v-for="stat in statCards"
            :key="stat.key"
            :to="stat.href"
            class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md hover:ring-1 hover:ring-senpai-200 transition-all"
          >
            <div class="flex items-center">
              <div :class="[stat.color, 'p-3 rounded-lg']">
                <component :is="stat.icon" class="h-6 w-6 text-white" />
              </div>
              <div class="ml-4">
                <p class="text-sm text-gray-500">{{ stat.name }}</p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ stat.usePendingJobsCount
                    ? pendingJobsCount
                    : (adminStore.stats?.[stat.key as keyof typeof adminStore.stats] || 0)
                  }}
                </p>
              </div>
            </div>
          </RouterLink>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <RouterLink
              to="/admin/applications"
              class="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <ClipboardDocumentCheckIcon class="h-6 w-6 text-indigo-600 mr-3" />
              <div>
                <p class="font-medium text-gray-900">Review Applications</p>
                <p class="text-sm text-gray-500">{{ adminStore.stats?.pending_applications || 0 }} pending</p>
              </div>
            </RouterLink>

            <RouterLink
              to="/admin/jobs"
              class="flex items-center p-3 rounded-lg border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors"
            >
              <BriefcaseIcon class="h-6 w-6 text-orange-600 mr-3" />
              <div>
                <p class="font-medium text-gray-900">Manage Jobs</p>
                <p class="text-sm text-gray-500">{{ pendingJobsCount }} pending</p>
              </div>
            </RouterLink>

            <RouterLink
              to="/admin/members"
              class="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <UsersIcon class="h-6 w-6 text-indigo-600 mr-3" />
              <div>
                <p class="font-medium text-gray-900">Manage Members</p>
                <p class="text-sm text-gray-500">View and manage</p>
              </div>
            </RouterLink>

            <RouterLink
              to="/admin/analytics"
              class="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
            >
              <ChartBarIcon class="h-6 w-6 text-indigo-600 mr-3" />
              <div>
                <p class="font-medium text-gray-900">View Analytics</p>
                <p class="text-sm text-gray-500">Skills & locations</p>
              </div>
            </RouterLink>
          </div>
        </div>

        <!-- Pending Items -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Pending Applications -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Recent Applications</h2>
                <RouterLink to="/admin/applications" class="text-sm text-indigo-600 hover:text-indigo-500">
                  View all
                </RouterLink>
              </div>
            </div>

            <div v-if="adminStore.applicationsLoading" class="p-6 flex justify-center">
              <LoadingSpinner />
            </div>

            <div v-else-if="adminStore.applications.length === 0" class="p-6 text-center text-gray-500">
              No pending applications
            </div>

            <ul v-else class="divide-y divide-gray-200">
              <li
                v-for="app in adminStore.applications.slice(0, 5)"
                :key="app.id"
                class="p-4 hover:bg-gray-50"
              >
                <RouterLink :to="`/admin/applications/${app.id}`" class="flex items-center justify-between">
                  <div>
                    <p class="font-medium text-gray-900">{{ app.profile.full_name }}</p>
                    <p class="text-sm text-gray-500">
                      {{ app.profile.primary_skill?.name }} · {{ app.profile.city }}, {{ app.profile.country }}
                    </p>
                  </div>
                  <span class="text-xs text-gray-400">
                    {{ new Date(app.created_at).toLocaleDateString() }}
                  </span>
                </RouterLink>
              </li>
            </ul>
          </div>

          <!-- Pending Job Submissions -->
          <div class="bg-white rounded-lg shadow-sm">
            <div class="p-6 border-b border-gray-200">
              <div class="flex items-center justify-between">
                <h2 class="text-lg font-semibold text-gray-900">Pending Job Submissions</h2>
                <RouterLink to="/admin/jobs" class="text-sm text-indigo-600 hover:text-indigo-500">
                  View all
                </RouterLink>
              </div>
            </div>

            <div v-if="pendingJobsLoading" class="p-6 flex justify-center">
              <LoadingSpinner />
            </div>

            <div v-else-if="pendingJobs.length === 0" class="p-6 text-center text-gray-500">
              No pending job submissions
            </div>

            <ul v-else class="divide-y divide-gray-200">
              <li
                v-for="job in pendingJobs"
                :key="job.id"
                class="p-4 hover:bg-gray-50"
              >
                <div class="flex items-center justify-between">
                  <RouterLink :to="`/admin/jobs/${job.id}`" class="flex-1 min-w-0">
                    <p class="font-medium text-gray-900 truncate">{{ job.title }}</p>
                    <p class="text-sm text-gray-500">
                      {{ job.company_name }} · {{ job.contact_email }}
                    </p>
                  </RouterLink>
                  <div class="flex items-center gap-2 ml-4">
                    <button
                      @click.prevent="approveJob(job.id)"
                      :disabled="approving === job.id"
                      class="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircleIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click.prevent="rejectJob(job.id)"
                      :disabled="rejecting === job.id"
                      class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircleIcon class="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- Growth Stats -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Approval Rate</h2>
              <ArrowTrendingUpIcon class="h-5 w-5 text-green-500" />
            </div>
            <p class="text-3xl font-bold text-gray-900">
              {{ (adminStore.stats?.approval_rate || 0).toFixed(0) }}%
            </p>
            <p class="text-sm text-gray-500 mt-1">
              of applications are approved
            </p>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900">Growth This Month</h2>
              <ChartBarIcon class="h-5 w-5 text-indigo-500" />
            </div>
            <p class="text-3xl font-bold text-gray-900">
              +{{ adminStore.stats?.growth_this_month || 0 }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              new members joined
            </p>
          </div>
        </div>
      </template>
    </div>
  </AdminLayout>
</template>
