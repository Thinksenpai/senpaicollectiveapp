<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobsApi } from '@/api'
import { useSkillsStore } from '@/stores/skills'
import type { Job, JobApplication, ApplicationStatus } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const skillsStore = useSkillsStore()

const jobId = computed(() => route.params.id as string)

const job = ref<Job | null>(null)
const applications = ref<JobApplication[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Action states
const actionLoading = ref(false)
const actionSuccess = ref<string | null>(null)
const actionError = ref<string | null>(null)
const updatingApp = ref<string | null>(null)

const statusConfig: Record<string, { label: string; color: string }> = {
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-700' },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' }
}

const appStatusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Viewed', color: 'bg-purple-100 text-purple-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700' },
  hired: { label: 'Hired', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700' }
}

const appStatusOptions = [
  { value: 'viewed', label: 'Mark as Viewed' },
  { value: 'shortlisted', label: 'Shortlist' },
  { value: 'rejected', label: 'Reject' }
]

onMounted(async () => {
  await skillsStore.fetchSkills()
  await fetchJobDetails()
})

async function fetchJobDetails() {
  loading.value = true
  error.value = null

  try {
    const [jobResponse, appsResponse] = await Promise.all([
      jobsApi.getJob(jobId.value),
      jobsApi.getJobApplications(jobId.value)
    ])

    if (jobResponse.status && jobResponse.data) {
      job.value = jobResponse.data
    } else {
      error.value = jobResponse.message || 'Failed to fetch job'
    }

    if (appsResponse.status && appsResponse.data) {
      applications.value = appsResponse.data
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to fetch job details'
  } finally {
    loading.value = false
  }
}

const skillNames = computed(() => {
  if (!job.value) return []
  if (job.value.skills && job.value.skills.length > 0) {
    return job.value.skills.map(s => s.name)
  }
  return job.value.skills_needed
    .map(id => skillsStore.getSkillName(id))
    .filter(Boolean)
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

async function approveJob() {
  if (!job.value) return

  actionLoading.value = true
  actionError.value = null

  try {
    const response = await jobsApi.approveJob(job.value.id)
    if (response.status) {
      actionSuccess.value = 'Job approved successfully'
      job.value.status = 'active'
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to approve job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to approve job'
  } finally {
    actionLoading.value = false
  }
}

async function rejectJob() {
  if (!job.value) return

  const reason = prompt('Please provide a reason for rejection:')
  if (!reason) return

  actionLoading.value = true
  actionError.value = null

  try {
    const response = await jobsApi.rejectJob(job.value.id, reason)
    if (response.status) {
      actionSuccess.value = 'Job rejected'
      job.value.status = 'rejected'
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to reject job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to reject job'
  } finally {
    actionLoading.value = false
  }
}

async function assignMember(applicationId: string, memberId: string) {
  if (!job.value) return

  actionLoading.value = true
  actionError.value = null

  try {
    const response = await jobsApi.assignJob(job.value.id, memberId)
    if (response.status) {
      actionSuccess.value = 'Member assigned successfully'
      job.value.status = 'assigned'
      job.value.assigned_member_id = memberId
      // Update application status
      const app = applications.value.find(a => a.id === applicationId)
      if (app) app.status = 'hired'
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to assign member'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to assign member'
  } finally {
    actionLoading.value = false
  }
}

async function completeJob() {
  if (!job.value) return

  actionLoading.value = true
  actionError.value = null

  try {
    const response = await jobsApi.completeJob(job.value.id)
    if (response.status) {
      actionSuccess.value = 'Job marked as completed'
      job.value.status = 'completed'
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to complete job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to complete job'
  } finally {
    actionLoading.value = false
  }
}

async function updateApplicationStatus(applicationId: string, newStatus: ApplicationStatus) {
  updatingApp.value = applicationId
  actionError.value = null

  try {
    let rejectionReason: string | undefined
    if (newStatus === 'rejected') {
      rejectionReason = prompt('Please provide a reason for rejection:') || undefined
    }

    const response = await jobsApi.updateApplicationStatus(applicationId, newStatus, undefined, rejectionReason)
    if (response.status) {
      const app = applications.value.find(a => a.id === applicationId)
      if (app) app.status = newStatus
      actionSuccess.value = 'Application status updated'
      setTimeout(() => { actionSuccess.value = null }, 3000)
    } else {
      actionError.value = response.message || 'Failed to update application'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to update application'
  } finally {
    updatingApp.value = null
  }
}

async function deleteJob() {
  if (!job.value) return
  if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) return

  actionLoading.value = true
  actionError.value = null

  try {
    const response = await jobsApi.deleteJob(job.value.id)
    if (response.status) {
      router.push('/admin/jobs')
    } else {
      actionError.value = response.message || 'Failed to delete job'
    }
  } catch (e: any) {
    actionError.value = e.response?.data?.message || 'Failed to delete job'
  } finally {
    actionLoading.value = false
  }
}
</script>

<template>
  <AdminLayout back-to="/admin/jobs" back-label="Back to Jobs">
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <h3 class="text-lg font-medium text-gray-900">Error loading job</h3>
        <p class="mt-2 text-gray-600">{{ error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="fetchJobDetails">
          Try again
        </BaseButton>
      </div>

      <!-- Job Details -->
      <div v-else-if="job" class="space-y-6">
        <!-- Alerts -->
        <BaseAlert v-if="actionSuccess" type="success" dismissible @dismiss="actionSuccess = null">
          {{ actionSuccess }}
        </BaseAlert>
        <BaseAlert v-if="actionError" type="error" dismissible @dismiss="actionError = null">
          {{ actionError }}
        </BaseAlert>

        <!-- Main Card -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-6 sm:p-8">
            <!-- Header -->
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium mb-2',
                    statusConfig[job.status]?.color || 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ statusConfig[job.status]?.label || job.status }}
                </span>
                <h1 class="text-2xl font-bold text-gray-900">{{ job.title }}</h1>
              </div>
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="inline-flex items-center">
                  <EyeIcon class="h-4 w-4 mr-1" />
                  {{ job.views_count }} views
                </span>
                <span class="inline-flex items-center">
                  <UserGroupIcon class="h-4 w-4 mr-1" />
                  {{ applications.length }} applicants
                </span>
              </div>
            </div>

            <!-- Company Info -->
            <div class="flex flex-wrap items-center gap-4 mb-6 text-gray-600">
              <span class="inline-flex items-center">
                <BuildingOfficeIcon class="h-5 w-5 mr-1.5" />
                {{ job.company_name }}
              </span>
              <span class="inline-flex items-center">
                <EnvelopeIcon class="h-5 w-5 mr-1.5" />
                {{ job.contact_email }}
              </span>
            </div>

            <!-- Budget & Timeline -->
            <div class="flex flex-wrap gap-4 mb-6 pb-6 border-b">
              <div v-if="job.budget_range" class="inline-flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                <CurrencyDollarIcon class="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Budget</p>
                  <p class="font-medium text-gray-900">{{ job.budget_range }}</p>
                </div>
              </div>
              <div v-if="job.timeline" class="inline-flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                <ClockIcon class="h-5 w-5 mr-2 text-gray-400" />
                <div>
                  <p class="text-xs text-gray-500">Timeline</p>
                  <p class="font-medium text-gray-900">{{ job.timeline }}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p class="whitespace-pre-wrap text-gray-600">{{ job.description }}</p>
            </div>

            <!-- Skills -->
            <div class="mb-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-3">Skills Required</h2>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="skill in skillNames"
                  :key="skill"
                  class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                >
                  {{ skill }}
                </span>
              </div>
            </div>

            <!-- Posted Date -->
            <p class="text-sm text-gray-500">
              Posted {{ formatDate(job.created_at) }}
            </p>
          </div>

          <!-- Actions -->
          <div class="bg-gray-50 px-6 py-4 flex flex-wrap gap-3">
            <template v-if="job.status === 'pending_approval'">
              <BaseButton @click="approveJob" :loading="actionLoading" :disabled="actionLoading">
                <CheckCircleIcon class="h-5 w-5 mr-1" />
                Approve
              </BaseButton>
              <BaseButton variant="danger" @click="rejectJob" :loading="actionLoading" :disabled="actionLoading">
                <XCircleIcon class="h-5 w-5 mr-1" />
                Reject
              </BaseButton>
            </template>

            <template v-if="job.status === 'in_progress' || job.status === 'assigned'">
              <BaseButton @click="completeJob" :loading="actionLoading" :disabled="actionLoading">
                <CheckCircleIcon class="h-5 w-5 mr-1" />
                Mark Complete
              </BaseButton>
            </template>

            <BaseButton variant="outline" @click="deleteJob" :loading="actionLoading" :disabled="actionLoading">
              Delete Job
            </BaseButton>
          </div>
        </div>

        <!-- Applications -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">
              Applications ({{ applications.length }})
            </h2>
          </div>

          <div v-if="applications.length === 0" class="p-6 text-center text-gray-500">
            No applications yet.
          </div>

          <div v-else class="divide-y divide-gray-100">
            <div v-for="app in applications" :key="app.id" class="p-6">
              <div class="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p class="font-medium text-gray-900">
                    {{ app.member?.full_name || 'Unknown Member' }}
                  </p>
                  <p v-if="app.member" class="text-sm text-gray-500">
                    {{ app.member.city }}, {{ app.member.country }}
                  </p>
                </div>
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    appStatusConfig[app.status]?.color || 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ appStatusConfig[app.status]?.label || app.status }}
                </span>
              </div>

              <div class="bg-gray-50 rounded-lg p-3 mb-3">
                <p class="text-sm text-gray-600">{{ app.proposal_text }}</p>
              </div>

              <div class="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span v-if="app.proposed_rate">Rate: {{ app.proposed_rate }}</span>
                <span v-if="app.proposed_timeline">Timeline: {{ app.proposed_timeline }}</span>
                <span>Applied {{ formatDate(app.created_at) }}</span>
              </div>

              <!-- Application Actions -->
              <div v-if="!['hired', 'rejected', 'withdrawn'].includes(app.status)" class="flex items-center gap-3">
                <BaseButton
                  v-if="job.status === 'active' && app.status !== 'hired'"
                  size="sm"
                  @click="assignMember(app.id, app.member_id)"
                  :loading="actionLoading"
                  :disabled="actionLoading"
                >
                  <UserPlusIcon class="h-4 w-4 mr-1" />
                  Hire
                </BaseButton>

                <BaseSelect
                  v-model="app.status"
                  :options="appStatusOptions"
                  class="w-40"
                  @update:model-value="(val) => updateApplicationStatus(app.id, val as ApplicationStatus)"
                  :disabled="updatingApp === app.id"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
