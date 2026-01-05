<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { jobsApi } from '@/api'
import type { JobStatusResponse } from '@/types'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  PlayIcon,
  FlagIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()

const token = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const status = ref<JobStatusResponse | null>(null)

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any; description: string }> = {
  pending_approval: {
    label: 'Pending Review',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: ClockIcon,
    description: 'Your job posting is being reviewed by our team. This usually takes 1-2 business days.'
  },
  active: {
    label: 'Active',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: CheckCircleIcon,
    description: 'Your job is live and members can apply. You will receive an email when candidates are assigned.'
  },
  assigned: {
    label: 'Assigned',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: UserGroupIcon,
    description: 'A member has been assigned to your project. They will be in touch shortly.'
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: PlayIcon,
    description: 'Work is in progress on your project. You can communicate with the assigned member.'
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: FlagIcon,
    description: 'This project has been completed. Thank you for working with Senpai Collective!'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: XCircleIcon,
    description: 'This job posting has been cancelled.'
  },
  rejected: {
    label: 'Not Approved',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: XCircleIcon,
    description: 'Unfortunately, this job posting was not approved. Please check your email for more details.'
  }
}

onMounted(() => {
  const queryToken = route.query.token as string
  if (queryToken) {
    token.value = queryToken
    checkStatus()
  }
})

async function checkStatus() {
  if (!token.value.trim()) {
    error.value = 'Please enter a submission token'
    return
  }

  loading.value = true
  error.value = null
  status.value = null

  try {
    const response = await jobsApi.getJobStatus(token.value.trim())
    if (response.status && response.data) {
      status.value = response.data
    } else {
      error.value = response.message || 'Could not find submission with that token'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to check status'
  } finally {
    loading.value = false
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
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
            to="/submit-job"
            class="text-sm text-gray-600 hover:text-gray-900"
          >
            Submit a Job
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="text-center mb-8">
        <MagnifyingGlassIcon class="mx-auto h-12 w-12 text-gray-700" />
        <h1 class="mt-4 text-3xl font-bold text-gray-900">Check Job Status</h1>
        <p class="mt-2 text-gray-600">
          Enter your submission token to check the status of your job posting.
        </p>
      </div>

      <!-- Search Form -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <form @submit.prevent="checkStatus" class="space-y-4">
          <BaseInput
            v-model="token"
            label="Submission Token"
            placeholder="Enter your submission token"
          />
          <BaseButton
            type="submit"
            :loading="loading"
            :disabled="loading || !token.trim()"
            class="w-full"
          >
            Check Status
          </BaseButton>
        </form>
      </div>

      <!-- Error State -->
      <BaseAlert v-if="error" type="error" dismissible @dismiss="error = null">
        {{ error }}
      </BaseAlert>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Status Result -->
      <div v-else-if="status" class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            {{ status.title }}
          </h2>

          <div
            :class="[
              'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
              statusConfig[status.status]?.bgColor,
              statusConfig[status.status]?.color
            ]"
          >
            <component
              :is="statusConfig[status.status]?.icon"
              class="h-5 w-5 mr-1.5"
            />
            {{ statusConfig[status.status]?.label || status.status }}
          </div>

          <p class="mt-4 text-gray-600">
            {{ statusConfig[status.status]?.description }}
          </p>

          <div class="mt-6 pt-6 border-t border-gray-100 space-y-2">
            <p class="text-sm text-gray-500">
              <span class="font-medium">Submitted:</span>
              {{ formatDate(status.submitted_at) }}
            </p>
            <p v-if="status.approved_at" class="text-sm text-gray-500">
              <span class="font-medium">Approved:</span>
              {{ formatDate(status.approved_at) }}
            </p>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4">
          <p class="text-sm text-gray-500">
            Questions? Contact us at
            <a href="mailto:jobs@senpaicollective.com" class="text-gray-900 hover:text-gray-700 font-medium">
              jobs@senpaicollective.com
            </a>
          </p>
        </div>
      </div>

      <!-- No Token Instructions -->
      <div v-else-if="!loading && !error" class="bg-white rounded-lg shadow-sm p-6">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Don't have a token?</h3>
        <p class="text-gray-600 mb-4">
          You received a submission token when you submitted your job posting. Check your email or the confirmation page for the token.
        </p>
        <RouterLink
          to="/submit-job"
          class="text-gray-900 hover:text-gray-700 font-medium"
        >
          Submit a new job posting &rarr;
        </RouterLink>
      </div>
    </main>
  </div>
</template>
