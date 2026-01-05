<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import { useSkillsStore } from '@/stores/skills'
import { useAuthStore } from '@/stores/auth'
import type { JobApplicationData } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  PaperAirplaneIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const jobsStore = useJobsStore()
const skillsStore = useSkillsStore()
const authStore = useAuthStore()

const jobId = computed(() => route.params.id as string)

const showApplicationForm = ref(false)
const applicationForm = ref<JobApplicationData>({
  cover_message: '',
  proposal_text: '',
  proposed_rate: '',
  proposed_timeline: '',
  attachment_urls: []
})
const formErrors = ref<Record<string, string>>({})
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref<string | null>(null)

onMounted(async () => {
  await skillsStore.fetchSkills()
  await jobsStore.fetchJob(jobId.value)
  await jobsStore.fetchMyApplications()
})

const job = computed(() => jobsStore.currentJob)

const hasApplied = computed(() => jobsStore.hasAppliedToJob(jobId.value))
const existingApplication = computed(() => jobsStore.getApplicationForJob(jobId.value))

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

const skillNames = computed(() => {
  if (!job.value) return []
  if (job.value.skills && job.value.skills.length > 0) {
    return job.value.skills.map(s => s.name)
  }
  return job.value.skills_needed
    .map(id => skillsStore.getSkillName(id))
    .filter(Boolean)
})

// Check if user has matching skills
const userSkillIds = computed(() => {
  const member = authStore.member
  if (!member?.skills) return []
  return member.skills.map(s => s.id)
})

const matchingSkills = computed(() => {
  if (!job.value) return []
  return job.value.skills_needed.filter(id => userSkillIds.value.includes(id))
})

const matchPercentage = computed(() => {
  if (!job.value || job.value.skills_needed.length === 0) return 0
  return Math.round((matchingSkills.value.length / job.value.skills_needed.length) * 100)
})

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

function validateApplication(): boolean {
  formErrors.value = {}

  if (!applicationForm.value.cover_message || applicationForm.value.cover_message.length < 20) {
    formErrors.value.cover_message = 'Please write a cover message (at least 20 characters)'
  }

  if (!applicationForm.value.proposal_text || applicationForm.value.proposal_text.length < 50) {
    formErrors.value.proposal_text = 'Please write a detailed proposal (at least 50 characters)'
  }

  return Object.keys(formErrors.value).length === 0
}

async function submitApplication() {
  if (!validateApplication()) return

  submitting.value = true
  submitError.value = null

  const result = await jobsStore.applyToJob(jobId.value, applicationForm.value)

  if (result.success) {
    submitSuccess.value = true
    showApplicationForm.value = false
  } else {
    submitError.value = result.error || 'Failed to submit application'
  }

  submitting.value = false
}

const applicationStatusConfig: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Application Submitted', color: 'bg-blue-100 text-blue-700' },
  viewed: { label: 'Application Viewed', color: 'bg-purple-100 text-purple-700' },
  shortlisted: { label: 'Shortlisted', color: 'bg-yellow-100 text-yellow-700' },
  hired: { label: 'Hired!', color: 'bg-green-100 text-green-700' },
  rejected: { label: 'Not Selected', color: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-700' }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Link -->
      <RouterLink
        to="/jobs"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to Jobs
      </RouterLink>

      <!-- Loading -->
      <div v-if="jobsStore.loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <div v-else-if="jobsStore.error" class="text-center py-12 bg-white rounded-lg">
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Error loading job</h3>
        <p class="mt-2 text-gray-600">{{ jobsStore.error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="jobsStore.fetchJob(jobId)">
          Try again
        </BaseButton>
      </div>

      <!-- Job Details -->
      <div v-else-if="job" class="space-y-6">
        <!-- Main Card -->
        <div class="bg-white rounded-lg shadow-sm overflow-hidden">
          <div class="p-6 sm:p-8">
            <!-- Header -->
            <div class="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span
                    :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium',
                      jobTypeColors[job.job_type] || 'bg-gray-100 text-gray-700'
                    ]"
                  >
                    {{ jobTypeLabels[job.job_type] || job.job_type }}
                  </span>
                  <span
                    v-if="job.listing_type === 'featured'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700"
                  >
                    Featured
                  </span>
                  <span
                    v-if="job.listing_type === 'premium'"
                    class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-senpai-100 text-senpai-700"
                  >
                    Premium
                  </span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900">{{ job.title }}</h1>
              </div>

              <!-- Stats -->
              <div class="flex items-center gap-4 text-sm text-gray-500">
                <span class="inline-flex items-center">
                  <EyeIcon class="h-4 w-4 mr-1" />
                  {{ job.views_count }} views
                </span>
                <span v-if="job.application_count !== undefined" class="inline-flex items-center">
                  <UserGroupIcon class="h-4 w-4 mr-1" />
                  {{ job.application_count }} applicants
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
              <h2 class="text-lg font-semibold text-gray-900 mb-3">About This Job</h2>
              <div class="prose prose-gray max-w-none">
                <p class="whitespace-pre-wrap text-gray-600">{{ job.description }}</p>
              </div>
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

              <!-- Skill Match -->
              <div v-if="matchingSkills.length > 0" class="mt-4 p-3 bg-green-50 rounded-lg">
                <p class="text-sm text-green-700">
                  <CheckCircleIcon class="inline h-4 w-4 mr-1" />
                  You match {{ matchPercentage }}% of the required skills ({{ matchingSkills.length }} of {{ job.skills_needed.length }})
                </p>
              </div>
            </div>

            <!-- Posted Date -->
            <p class="text-sm text-gray-500">
              Posted {{ formatDate(job.created_at) }}
            </p>
          </div>
        </div>

        <!-- Application Status (if already applied) -->
        <div v-if="hasApplied && existingApplication" class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Your Application</h3>
              <p class="text-sm text-gray-500 mt-1">
                Applied {{ formatDate(existingApplication.created_at) }}
              </p>
            </div>
            <span
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
                applicationStatusConfig[existingApplication.status]?.color || 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ applicationStatusConfig[existingApplication.status]?.label || existingApplication.status }}
            </span>
          </div>

          <div class="mt-4 p-3 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium text-gray-700 mb-1">Your Proposal:</p>
            <p class="text-sm text-gray-600">{{ existingApplication.proposal_text }}</p>
          </div>

          <div v-if="existingApplication.rejection_reason" class="mt-4 p-3 bg-red-50 rounded-lg">
            <p class="text-sm font-medium text-red-700 mb-1">Feedback:</p>
            <p class="text-sm text-red-600">{{ existingApplication.rejection_reason }}</p>
          </div>
        </div>

        <!-- Success Message -->
        <BaseAlert v-if="submitSuccess" type="success" class="mb-6">
          Your application has been submitted successfully! You'll be notified when there's an update.
        </BaseAlert>

        <!-- Apply Button / Form -->
        <div v-if="!hasApplied && !submitSuccess && job.status === 'active'" class="bg-white rounded-lg shadow-sm p-6">
          <!-- Show Form Toggle -->
          <div v-if="!showApplicationForm">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Interested in this job?</h3>
            <p class="text-gray-600 mb-4">
              Submit your proposal and let the client know why you're the right fit.
            </p>
            <BaseButton @click="showApplicationForm = true">
              <PaperAirplaneIcon class="h-5 w-5 mr-2" />
              Apply Now
            </BaseButton>
          </div>

          <!-- Application Form -->
          <form v-else @submit.prevent="submitApplication" class="space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Submit Your Application</h3>

            <BaseAlert v-if="submitError" type="error" dismissible @dismiss="submitError = null">
              {{ submitError }}
            </BaseAlert>

            <BaseTextarea
              v-model="applicationForm.cover_message"
              label="Cover Message"
              placeholder="Introduce yourself and explain why you're interested in this project..."
              :rows="3"
              :error="formErrors.cover_message"
              required
            />

            <BaseTextarea
              v-model="applicationForm.proposal_text"
              label="Your Proposal"
              placeholder="Describe your approach to the project, relevant experience, and how you would deliver great results..."
              :rows="6"
              :error="formErrors.proposal_text"
              hint="Be specific about your process and what makes you the right fit."
              required
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput
                v-model="applicationForm.proposed_rate"
                label="Proposed Rate (Optional)"
                placeholder="e.g., $2500 or $50/hr"
              />
              <BaseInput
                v-model="applicationForm.proposed_timeline"
                label="Proposed Timeline (Optional)"
                placeholder="e.g., 3 weeks"
              />
            </div>

            <div class="flex items-center gap-4 pt-4 border-t">
              <BaseButton type="submit" :loading="submitting" :disabled="submitting">
                Submit Application
              </BaseButton>
              <BaseButton variant="outline" @click="showApplicationForm = false" :disabled="submitting">
                Cancel
              </BaseButton>
            </div>
          </form>
        </div>

        <!-- Job not active message -->
        <div v-if="job.status !== 'active' && !hasApplied" class="bg-yellow-50 rounded-lg p-6 text-center">
          <p class="text-yellow-700">
            This job is no longer accepting applications.
          </p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
