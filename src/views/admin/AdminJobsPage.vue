<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { jobsApi } from '@/api'
import type { Job, JobStatus, Pagination } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'

// State
const jobs = ref<Job[]>([])
const pendingJobs = ref<Job[]>([])
const pagination = ref<Pagination | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const search = ref('')
const statusFilter = ref<JobStatus | ''>('')
const activeTab = ref<'all' | 'pending'>('pending')

// Action states
const approving = ref<string | null>(null)
const rejecting = ref<string | null>(null)
const actionSuccess = ref<string | null>(null)
const actionError = ref<string | null>(null)

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'active', label: 'Active' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rejected', label: 'Rejected' }
]

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_approval: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

onMounted(() => {
  fetchPendingJobs()
  fetchJobs()
})

async function fetchPendingJobs() {
  try {
    const response = await jobsApi.getPendingJobs(20, 0)
    if (response.status && response.data) {
      pendingJobs.value = response.data
    }
  } catch (e: any) {
    console.error('Failed to fetch pending jobs:', e)
  }
}

async function fetchJobs() {
  loading.value = true
  error.value = null

  try {
    const response = await jobsApi.getAdminJobs({
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      limit: 20,
      offset: 0
    })
    if (response.status && response.data) {
      jobs.value = response.data
      pagination.value = response.pagination
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to fetch jobs'
  } finally {
    loading.value = false
  }
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchJobs, 300)
})

watch(statusFilter, fetchJobs)

async function approveJob(jobId: string) {
  approving.value = jobId
  actionError.value = null

  try {
    const response = await jobsApi.approveJob(jobId)
    if (response.status) {
      actionSuccess.value = 'Job approved successfully'
      await fetchPendingJobs()
      await fetchJobs()
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to approve job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || e.message || 'Failed to approve job'
  } finally {
    approving.value = null
  }
}

async function rejectJob(jobId: string) {
  const reason = prompt('Please provide a reason for rejection:')
  if (!reason) return

  rejecting.value = jobId
  actionError.value = null

  try {
    const response = await jobsApi.rejectJob(jobId, reason)
    if (response.status) {
      actionSuccess.value = 'Job rejected'
      await fetchPendingJobs()
      await fetchJobs()
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to reject job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || e.message || 'Failed to reject job'
  } finally {
    rejecting.value = null
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const displayedJobs = computed(() => {
  return activeTab.value === 'pending' ? pendingJobs.value : jobs.value
})
</script>

<template>
  <AdminLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Job Management</h1>
        <p class="mt-1 text-gray-600">
          Review submissions and manage job postings.
        </p>
      </div>

      <!-- Alerts -->
      <BaseAlert v-if="actionSuccess" type="success" dismissible @dismiss="actionSuccess = null" class="mb-6">
        {{ actionSuccess }}
      </BaseAlert>
      <BaseAlert v-if="actionError" type="error" dismissible @dismiss="actionError = null" class="mb-6">
        {{ actionError }}
      </BaseAlert>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="flex gap-8">
          <button
            @click="activeTab = 'pending'"
            :class="[
              'pb-4 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'pending'
                ? 'border-senpai-500 text-senpai-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Pending Approval
            <span
              v-if="pendingJobs.length > 0"
              class="ml-2 px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full"
            >
              {{ pendingJobs.length }}
            </span>
          </button>
          <button
            @click="activeTab = 'all'"
            :class="[
              'pb-4 text-sm font-medium border-b-2 -mb-px',
              activeTab === 'all'
                ? 'border-senpai-500 text-senpai-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            All Jobs
          </button>
        </nav>
      </div>

      <!-- Filters (only for All Jobs tab) -->
      <div v-if="activeTab === 'all'" class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search jobs..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senpai-500 focus:border-senpai-500"
          />
        </div>
        <div class="w-full sm:w-48">
          <BaseSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filter by status"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-12 bg-white rounded-lg">
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Error loading jobs</h3>
        <p class="mt-2 text-gray-600">{{ error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="fetchJobs">
          Try again
        </BaseButton>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="displayedJobs.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <BriefcaseIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          {{ activeTab === 'pending' ? 'No pending submissions' : 'No jobs found' }}
        </h3>
        <p class="mt-2 text-gray-600">
          {{ activeTab === 'pending'
            ? 'All job submissions have been reviewed.'
            : 'Try adjusting your search or filters.'
          }}
        </p>
      </div>

      <!-- Jobs Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="job in displayedJobs" :key="job.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <RouterLink
                  :to="`/admin/jobs/${job.id}`"
                  class="text-sm font-medium text-gray-900 hover:text-senpai-600"
                >
                  {{ job.title }}
                </RouterLink>
                <p class="text-sm text-gray-500">{{ job.company_name }}</p>
              </td>
              <td class="px-6 py-4">
                <p class="text-sm text-gray-900">{{ job.client_name || 'N/A' }}</p>
                <p class="text-sm text-gray-500">{{ job.contact_email }}</p>
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ statusConfig[job.status]?.label || job.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ formatDate(job.created_at) }}
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <div class="flex items-center justify-end gap-2">
                  <RouterLink
                    :to="`/admin/jobs/${job.id}`"
                    class="text-gray-600 hover:text-gray-900"
                  >
                    <EyeIcon class="h-5 w-5" />
                  </RouterLink>

                  <template v-if="job.status === 'pending_approval'">
                    <button
                      @click="approveJob(job.id)"
                      :disabled="approving === job.id"
                      class="text-green-600 hover:text-green-700 disabled:opacity-50"
                      title="Approve"
                    >
                      <CheckCircleIcon class="h-5 w-5" />
                    </button>
                    <button
                      @click="rejectJob(job.id)"
                      :disabled="rejecting === job.id"
                      class="text-red-600 hover:text-red-700 disabled:opacity-50"
                      title="Reject"
                    >
                      <XCircleIcon class="h-5 w-5" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (for All Jobs tab) -->
      <div
        v-if="activeTab === 'all' && pagination && pagination.total_pages > 1"
        class="mt-6 flex items-center justify-center gap-4"
      >
        <BaseButton
          variant="outline"
          :disabled="!pagination.has_prev"
          @click="() => { /* implement */ }"
        >
          Previous
        </BaseButton>
        <span class="text-sm text-gray-600">
          Page {{ pagination.current_page }} of {{ pagination.total_pages }}
        </span>
        <BaseButton
          variant="outline"
          :disabled="!pagination.has_next"
          @click="() => { /* implement */ }"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </AdminLayout>
</template>
