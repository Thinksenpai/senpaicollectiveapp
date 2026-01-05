<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useSkillsStore } from '@/stores/skills'
import { jobsApi } from '@/api'
import type { JobType, JobSubmissionData } from '@/types'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { BriefcaseIcon, CheckCircleIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

const skillsStore = useSkillsStore()

const form = ref<JobSubmissionData>({
  title: '',
  description: '',
  client_name: '',
  contact_email: '',
  client_company: '',
  skills_needed: [],
  job_type: 'project',
  budget_range: '',
  timeline: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const submitted = ref(false)
const submissionToken = ref('')
const submissionId = ref('')
const apiError = ref<string | null>(null)
const copied = ref(false)

onMounted(() => {
  skillsStore.fetchSkills()
})

const skillOptions = computed(() => {
  return skillsStore.skills.map(skill => ({
    value: skill.id,
    label: skill.name
  }))
})

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time Position' },
  { value: 'contract', label: 'Contract Work' },
  { value: 'project', label: 'One-time Project' },
  { value: 'internship', label: 'Internship' }
]

function validate(): boolean {
  errors.value = {}

  if (!form.value.title || form.value.title.length < 10) {
    errors.value.title = 'Title must be at least 10 characters'
  }

  if (!form.value.description || form.value.description.length < 50) {
    errors.value.description = 'Description must be at least 50 characters'
  }

  if (!form.value.client_name || form.value.client_name.length < 2) {
    errors.value.client_name = 'Please enter your name'
  }

  if (!form.value.contact_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.contact_email)) {
    errors.value.contact_email = 'Please enter a valid email address'
  }

  if (form.value.skills_needed.length === 0) {
    errors.value.skills_needed = 'Please select at least one skill'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  apiError.value = null

  try {
    const response = await jobsApi.submitJob(form.value)
    if (response.status && response.data) {
      submitted.value = true
      submissionToken.value = response.data.submission_token
      submissionId.value = response.data.submission_id
    } else {
      apiError.value = response.message || 'Failed to submit job'
    }
  } catch (e: any) {
    apiError.value = e.response?.data?.message || e.message || 'Failed to submit job'
  } finally {
    loading.value = false
  }
}

async function copyToken() {
  try {
    await navigator.clipboard.writeText(submissionToken.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (e) {
    console.error('Failed to copy:', e)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="flex items-center">
            <img src="/senpai_logo.svg" alt="Senpai Collective" class="h-8 w-auto" />
          </RouterLink>
          <RouterLink
            to="/login"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Member Login
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Success State -->
      <div v-if="submitted" class="text-center">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500" />
          <h1 class="mt-4 text-2xl font-bold text-gray-900">Job Submitted Successfully!</h1>
          <p class="mt-2 text-gray-600 max-w-md mx-auto">
            Your job posting has been submitted for review. Our team will review it and get back to you within 1-2 business days.
          </p>

          <div class="mt-8 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm text-gray-600 mb-2">
              Save this token to check your submission status:
            </p>
            <div class="flex items-center justify-center gap-2">
              <code class="px-3 py-2 bg-white border rounded text-sm font-mono break-all">
                {{ submissionToken }}
              </code>
              <button
                @click="copyToken"
                class="p-2 text-gray-500 hover:text-gray-700"
                :title="copied ? 'Copied!' : 'Copy to clipboard'"
              >
                <ClipboardDocumentIcon class="h-5 w-5" />
              </button>
            </div>
            <p v-if="copied" class="mt-2 text-sm text-green-600">Copied to clipboard!</p>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink
              :to="`/job-status?token=${submissionToken}`"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800"
            >
              Check Status
            </RouterLink>
            <RouterLink
              to="/"
              class="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Home
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Form State -->
      <div v-else>
        <div class="text-center mb-8">
          <BriefcaseIcon class="mx-auto h-12 w-12 text-gray-700" />
          <h1 class="mt-4 text-3xl font-bold text-gray-900">Post a Job</h1>
          <p class="mt-2 text-gray-600 max-w-2xl mx-auto">
            Find talented creatives from the Senpai Collective community. Submit your job posting below and we'll match you with the right talent.
          </p>
        </div>

        <BaseAlert v-if="apiError" type="error" dismissible @dismiss="apiError = null" class="mb-6">
          {{ apiError }}
        </BaseAlert>

        <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-6">
          <!-- Job Details -->
          <div class="space-y-6">
            <h2 class="text-lg font-semibold text-gray-900 pb-2 border-b">Job Details</h2>

            <BaseInput
              v-model="form.title"
              label="Job Title"
              placeholder="e.g., Brand Designer for Tech Startup"
              :error="errors.title"
              required
            />

            <BaseTextarea
              v-model="form.description"
              label="Job Description"
              placeholder="Describe the project, requirements, and what you're looking for in a candidate..."
              :rows="6"
              :error="errors.description"
              hint="Minimum 50 characters. Include project scope, deliverables, and any specific requirements."
              required
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BaseSelect
                v-model="form.job_type"
                :options="jobTypeOptions"
                label="Job Type"
                required
              />

              <BaseInput
                v-model="form.budget_range"
                label="Budget Range"
                placeholder="e.g., $2000-$4000 or Negotiable"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BaseInput
                v-model="form.timeline"
                label="Timeline"
                placeholder="e.g., 4 weeks, ASAP, Flexible"
              />

              <div>
                <BaseMultiSelect
                  v-model="form.skills_needed"
                  :options="skillOptions"
                  label="Skills Needed"
                  placeholder="Select required skills"
                  :error="errors.skills_needed"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="space-y-6 pt-6 border-t">
            <h2 class="text-lg font-semibold text-gray-900 pb-2">Your Information</h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <BaseInput
                v-model="form.client_name"
                label="Your Name"
                placeholder="John Doe"
                :error="errors.client_name"
                required
              />

              <BaseInput
                v-model="form.contact_email"
                label="Email Address"
                type="email"
                placeholder="john@company.com"
                :error="errors.contact_email"
                required
              />
            </div>

            <BaseInput
              v-model="form.client_company"
              label="Company Name"
              placeholder="Your Company (optional)"
            />
          </div>

          <!-- Submit -->
          <div class="pt-6 border-t">
            <p class="text-sm text-gray-500 mb-4">
              By submitting this job, you agree to our terms of service. Your posting will be reviewed by our team before being published.
            </p>
            <BaseButton
              type="submit"
              :loading="loading"
              :disabled="loading"
              class="w-full sm:w-auto"
            >
              Submit Job Posting
            </BaseButton>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
