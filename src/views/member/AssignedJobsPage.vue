<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useJobsStore } from '@/stores/jobs'
import type { DeliverableData } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  BriefcaseIcon,
  BuildingOfficeIcon,
  ClockIcon,
  PlusIcon,
  DocumentArrowUpIcon,
  LinkIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'

const jobsStore = useJobsStore()

const showDeliverableForm = ref<string | null>(null)
const deliverableForm = ref<DeliverableData>({
  title: '',
  description: '',
  deliverable_type: 'file',
  file_url: '',
  external_url: '',
  is_final: false
})
const formErrors = ref<Record<string, string>>({})
const submitting = ref(false)
const submitSuccess = ref<string | null>(null)
const submitError = ref<string | null>(null)

const deliverableTypeOptions = [
  { value: 'file', label: 'File Upload' },
  { value: 'link', label: 'External Link' },
  { value: 'note', label: 'Note / Update' }
]

onMounted(() => {
  jobsStore.fetchAssignedJobs()
})

const statusLabels: Record<string, { label: string; color: string }> = {
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  completed: { label: 'Completed', color: 'bg-green-100 text-green-700' }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function openDeliverableForm(jobId: string) {
  showDeliverableForm.value = jobId
  deliverableForm.value = {
    title: '',
    description: '',
    deliverable_type: 'file',
    file_url: '',
    external_url: '',
    is_final: false
  }
  formErrors.value = {}
  submitError.value = null
}

function closeDeliverableForm() {
  showDeliverableForm.value = null
}

function validateForm(): boolean {
  formErrors.value = {}

  if (!deliverableForm.value.title || deliverableForm.value.title.length < 3) {
    formErrors.value.title = 'Title is required (at least 3 characters)'
  }

  if (deliverableForm.value.deliverable_type === 'file' && !deliverableForm.value.file_url) {
    formErrors.value.file_url = 'Please provide a file URL'
  }

  if (deliverableForm.value.deliverable_type === 'link' && !deliverableForm.value.external_url) {
    formErrors.value.external_url = 'Please provide a link URL'
  }

  return Object.keys(formErrors.value).length === 0
}

async function submitDeliverable() {
  if (!showDeliverableForm.value || !validateForm()) return

  submitting.value = true
  submitError.value = null

  const result = await jobsStore.uploadDeliverable(showDeliverableForm.value, deliverableForm.value)

  if (result.success) {
    submitSuccess.value = showDeliverableForm.value
    closeDeliverableForm()
    setTimeout(() => {
      submitSuccess.value = null
    }, 3000)
  } else {
    submitError.value = result.error || 'Failed to upload deliverable'
  }

  submitting.value = false
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Assigned Jobs</h1>
        <p class="mt-1 text-gray-600">
          Manage your active projects and upload deliverables.
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
        <h3 class="text-lg font-medium text-gray-900">Error loading jobs</h3>
        <p class="mt-2 text-gray-600">{{ jobsStore.error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="jobsStore.fetchAssignedJobs">
          Try again
        </BaseButton>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="jobsStore.assignedJobs.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <BriefcaseIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No assigned jobs</h3>
        <p class="mt-2 text-gray-600">
          You don't have any active projects yet. Apply to jobs to get started!
        </p>
        <BaseButton variant="outline" class="mt-4" to="/jobs">
          Browse Jobs
        </BaseButton>
      </div>

      <!-- Jobs List -->
      <div v-else class="space-y-6">
        <div
          v-for="job in jobsStore.assignedJobs"
          :key="job.id"
          class="bg-white rounded-lg shadow-sm overflow-hidden"
        >
          <div class="p-6">
            <!-- Job Header -->
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex-1">
                <RouterLink
                  :to="`/jobs/${job.id}`"
                  class="text-lg font-semibold text-gray-900 hover:text-senpai-600"
                >
                  {{ job.title }}
                </RouterLink>
                <div class="flex items-center text-sm text-gray-600 mt-1">
                  <BuildingOfficeIcon class="h-4 w-4 mr-1.5" />
                  {{ job.company_name }}
                </div>
              </div>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                  statusLabels[job.status]?.color || 'bg-gray-100 text-gray-700'
                ]"
              >
                {{ statusLabels[job.status]?.label || job.status }}
              </span>
            </div>

            <!-- Job Info -->
            <div class="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
              <span v-if="job.assigned_at" class="inline-flex items-center">
                <ClockIcon class="h-4 w-4 mr-1" />
                Assigned {{ formatDate(job.assigned_at) }}
              </span>
              <span v-if="job.timeline">
                Timeline: {{ job.timeline }}
              </span>
            </div>

            <!-- Success Message -->
            <BaseAlert v-if="submitSuccess === job.id" type="success" class="mb-4">
              Deliverable uploaded successfully!
            </BaseAlert>

            <!-- Deliverable Form -->
            <div v-if="showDeliverableForm === job.id" class="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 class="text-sm font-semibold text-gray-900 mb-4">Upload Deliverable</h4>

              <BaseAlert v-if="submitError" type="error" dismissible @dismiss="submitError = null" class="mb-4">
                {{ submitError }}
              </BaseAlert>

              <form @submit.prevent="submitDeliverable" class="space-y-4">
                <BaseInput
                  v-model="deliverableForm.title"
                  label="Title"
                  placeholder="e.g., Final Logo Design"
                  :error="formErrors.title"
                  required
                />

                <BaseTextarea
                  v-model="deliverableForm.description"
                  label="Description (Optional)"
                  placeholder="Describe what you're delivering..."
                  :rows="2"
                />

                <BaseSelect
                  v-model="deliverableForm.deliverable_type"
                  :options="deliverableTypeOptions"
                  label="Type"
                />

                <BaseInput
                  v-if="deliverableForm.deliverable_type === 'file'"
                  v-model="deliverableForm.file_url"
                  label="File URL"
                  placeholder="https://drive.google.com/..."
                  :error="formErrors.file_url"
                  hint="Upload to Google Drive, Dropbox, or similar and paste the link"
                />

                <BaseInput
                  v-if="deliverableForm.deliverable_type === 'link'"
                  v-model="deliverableForm.external_url"
                  label="External URL"
                  placeholder="https://..."
                  :error="formErrors.external_url"
                />

                <BaseCheckbox
                  v-model="deliverableForm.is_final"
                  label="This is the final deliverable"
                />

                <div class="flex items-center gap-3 pt-2">
                  <BaseButton type="submit" size="sm" :loading="submitting" :disabled="submitting">
                    Upload
                  </BaseButton>
                  <BaseButton variant="outline" size="sm" @click="closeDeliverableForm" :disabled="submitting">
                    Cancel
                  </BaseButton>
                </div>
              </form>
            </div>

            <!-- Actions -->
            <div v-else class="mt-4 pt-4 border-t border-gray-100">
              <BaseButton
                v-if="job.status !== 'completed'"
                variant="outline"
                size="sm"
                @click="openDeliverableForm(job.id)"
              >
                <PlusIcon class="h-4 w-4 mr-1" />
                Upload Deliverable
              </BaseButton>
              <p v-else class="text-sm text-green-600">
                This job has been completed. Thank you for your work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
