<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import {
  ArrowLeftIcon,
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const application = ref<any>(null)
const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)

const showApproveModal = ref(false)
const showDeclineModal = ref(false)
const adminNotes = ref('')
const declineReason = ref('')

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const discoverySourceLabels: Record<string, string> = {
  scout: 'Invited by a Scout',
  social: 'Social media',
  friend: 'Friend or colleague',
  event: 'Event or workshop',
  returning: 'Returning member',
  other: 'Other'
}

onMounted(async () => {
  loading.value = true
  // Find application from the list (in a real app you'd have a dedicated endpoint)
  await adminStore.fetchApplications()
  application.value = adminStore.applications.find(a => a.id === route.params.id)
  loading.value = false
})

async function handleApprove() {
  actionLoading.value = true
  error.value = null

  const result = await adminStore.approveApplication(application.value.id, adminNotes.value)

  if (result.success) {
    showApproveModal.value = false
    router.push('/admin/applications')
  } else {
    error.value = result.error || 'Failed to approve application'
  }

  actionLoading.value = false
}

async function handleDecline() {
  if (!declineReason.value.trim()) {
    error.value = 'Please provide a reason for declining'
    return
  }

  actionLoading.value = true
  error.value = null

  const result = await adminStore.declineApplication(
    application.value.id,
    declineReason.value,
    adminNotes.value
  )

  if (result.success) {
    showDeclineModal.value = false
    router.push('/admin/applications')
  } else {
    error.value = result.error || 'Failed to decline application'
  }

  actionLoading.value = false
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Link -->
      <RouterLink
        to="/admin/applications"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to Applications
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!application" class="text-center py-12 bg-white rounded-lg">
        <h3 class="text-lg font-medium text-gray-900">Application not found</h3>
        <RouterLink
          to="/admin/applications"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Applications
        </RouterLink>
      </div>

      <!-- Application Detail -->
      <template v-else>
        <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
          {{ error }}
        </BaseAlert>

        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center">
              <div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircleIcon class="h-12 w-12 text-gray-400" />
              </div>
              <div class="ml-4">
                <h1 class="text-xl font-bold text-gray-900">{{ application.profile.full_name }}</h1>
                <p class="text-gray-600">{{ application.email }}</p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0 flex items-center gap-2">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  application.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ application.email_verified ? 'Email Verified' : 'Email Pending' }}
              </span>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Primary Skill</p>
              <p class="font-medium">{{ application.profile.primary_skill?.name || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Experience</p>
              <p class="font-medium">{{ experienceLevelLabels[application.profile.experience_level] }}</p>
            </div>
            <div>
              <p class="text-gray-500">Location</p>
              <p class="font-medium">{{ application.profile.city }}, {{ application.profile.country }}</p>
            </div>
            <div>
              <p class="text-gray-500">Applied</p>
              <p class="font-medium">{{ new Date(application.created_at).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Bio</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ application.profile.bio }}</p>
        </div>

        <!-- Why Senpai -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Why they want to join</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ application.profile.why_senpai }}</p>
        </div>

        <!-- Portfolio -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Portfolio & Links</h2>
          <div class="space-y-2">
            <a
              :href="application.profile.portfolio_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ application.profile.portfolio_url }}
            </a>
            <a
              v-for="(link, index) in application.profile.additional_links"
              :key="index"
              :href="link"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ link }}
            </a>
          </div>
        </div>

        <!-- Discovery -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Discovery Information</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-500">How they heard about Senpai</p>
              <p class="font-medium">{{ discoverySourceLabels[application.profile.discovery_source] }}</p>
            </div>
            <div v-if="application.profile.is_og_member">
              <p class="text-gray-500">OG Member</p>
              <p class="font-medium">Yes</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Review Actions</h2>
          <div class="flex flex-col sm:flex-row gap-4">
            <BaseButton
              class="flex-1"
              @click="showApproveModal = true"
            >
              <CheckCircleIcon class="h-5 w-5 mr-2" />
              Approve Application
            </BaseButton>
            <BaseButton
              variant="danger"
              class="flex-1"
              @click="showDeclineModal = true"
            >
              <XCircleIcon class="h-5 w-5 mr-2" />
              Decline Application
            </BaseButton>
          </div>
        </div>
      </template>
    </div>

    <!-- Approve Modal -->
    <TransitionRoot :show="showApproveModal" as="template">
      <Dialog class="relative z-50" @close="showApproveModal = false">
        <TransitionChild
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold text-gray-900 mb-4">
                  Approve Application
                </DialogTitle>

                <p class="text-sm text-gray-600 mb-4">
                  Are you sure you want to approve {{ application?.profile.full_name }}'s application?
                  They will receive an email notification.
                </p>

                <BaseTextarea
                  v-model="adminNotes"
                  label="Admin Notes (Optional)"
                  placeholder="Internal notes for reference..."
                  :rows="3"
                />

                <div class="mt-6 flex gap-3 justify-end">
                  <BaseButton variant="outline" @click="showApproveModal = false">
                    Cancel
                  </BaseButton>
                  <BaseButton :loading="actionLoading" @click="handleApprove">
                    Approve
                  </BaseButton>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Decline Modal -->
    <TransitionRoot :show="showDeclineModal" as="template">
      <Dialog class="relative z-50" @close="showDeclineModal = false">
        <TransitionChild
          enter="ease-out duration-300"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="ease-in duration-200"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75" />
        </TransitionChild>

        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              enter="ease-out duration-300"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="ease-in duration-200"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel class="w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
                <DialogTitle class="text-lg font-semibold text-gray-900 mb-4">
                  Decline Application
                </DialogTitle>

                <BaseAlert v-if="error" type="error" class="mb-4">
                  {{ error }}
                </BaseAlert>

                <BaseTextarea
                  v-model="declineReason"
                  label="Reason for Declining"
                  placeholder="This will be sent to the applicant..."
                  :rows="3"
                  required
                />

                <BaseTextarea
                  v-model="adminNotes"
                  label="Admin Notes (Optional)"
                  placeholder="Internal notes for reference..."
                  :rows="2"
                  class="mt-4"
                />

                <div class="mt-6 flex gap-3 justify-end">
                  <BaseButton variant="outline" @click="showDeclineModal = false">
                    Cancel
                  </BaseButton>
                  <BaseButton variant="danger" :loading="actionLoading" @click="handleDecline">
                    Decline
                  </BaseButton>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </AppLayout>
</template>
