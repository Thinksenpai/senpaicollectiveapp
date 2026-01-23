<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)

const showDeactivateModal = ref(false)
const deactivateReason = ref('')
const promotingToScout = ref(false)

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  deactivated: 'bg-gray-100 text-gray-800'
}

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

onMounted(async () => {
  loading.value = true
  await adminStore.fetchMember(route.params.id as string)
  loading.value = false
})

async function handleDeactivate() {
  if (!deactivateReason.value.trim()) {
    error.value = 'Please provide a reason for deactivation'
    return
  }

  actionLoading.value = true
  error.value = null

  const result = await adminStore.deactivateMember(
    route.params.id as string,
    deactivateReason.value
  )

  if (result.success) {
    showDeactivateModal.value = false
    router.push('/admin/members')
  } else {
    error.value = result.error || 'Failed to deactivate member'
  }

  actionLoading.value = false
}

async function handlePromoteToScout() {
  promotingToScout.value = true
  error.value = null

  const result = await adminStore.promoteToScout(route.params.id as string)

  if (result.success) {
    // Refresh member data to show updated roles
    await adminStore.fetchMember(route.params.id as string)
  } else {
    error.value = result.error || 'Failed to promote member to scout'
  }

  promotingToScout.value = false
}

const isScout = () => {
  return adminStore.currentMember?.member?.roles?.some(r => r.name === 'scout') ||
         adminStore.currentMember?.member?.scout != null
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Back Link -->
      <RouterLink
        to="/admin/members"
        class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        Back to Members
      </RouterLink>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!adminStore.currentMember" class="text-center py-12 bg-white rounded-lg">
        <h3 class="text-lg font-medium text-gray-900">Member not found</h3>
        <RouterLink
          to="/admin/members"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Back to Members
        </RouterLink>
      </div>

      <!-- Member Detail -->
      <template v-else>
        <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
          {{ error }}
        </BaseAlert>

        <!-- Header -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center">
              <div v-if="adminStore.currentMember.member.profile?.photo_url" class="h-16 w-16 rounded-full overflow-hidden">
                <img :src="adminStore.currentMember.member.profile.photo_url" :alt="adminStore.currentMember.member.profile?.full_name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <UserCircleIcon class="h-12 w-12 text-gray-400" />
              </div>
              <div class="ml-4">
                <h1 class="text-xl font-bold text-gray-900">{{ adminStore.currentMember.member.profile?.full_name }}</h1>
                <p class="text-gray-600">{{ adminStore.currentMember.member.email }}</p>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize',
                  statusBadgeClasses[adminStore.currentMember.member.status]
                ]"
              >
                {{ adminStore.currentMember.member.status }}
              </span>
            </div>
          </div>

          <!-- Quick Info -->
          <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p class="text-gray-500">Primary Skill</p>
              <p class="font-medium">{{ adminStore.currentMember.member.profile?.primary_skill?.name || 'N/A' }}</p>
            </div>
            <div>
              <p class="text-gray-500">Experience</p>
              <p class="font-medium">{{ experienceLevelLabels[adminStore.currentMember.member.profile?.experience_level || 'none'] }}</p>
            </div>
            <div>
              <p class="text-gray-500">Location</p>
              <p class="font-medium">{{ adminStore.currentMember.member.profile?.city }}, {{ adminStore.currentMember.member.profile?.country }}</p>
            </div>
            <div>
              <p class="text-gray-500">Joined</p>
              <p class="font-medium">{{ new Date(adminStore.currentMember.member.created_at).toLocaleDateString() }}</p>
            </div>
          </div>

          <!-- Roles -->
          <div v-if="adminStore.currentMember.member.roles && adminStore.currentMember.member.roles.length > 0" class="mt-4">
            <p class="text-sm text-gray-500 mb-2">Roles</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in adminStore.currentMember.member.roles"
                :key="role.id"
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 capitalize"
              >
                {{ role.name }}
              </span>
            </div>
          </div>
        </div>

        <!-- Bio -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Bio</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ adminStore.currentMember.member.profile?.bio || 'No bio provided.' }}</p>
        </div>

        <!-- Recent Work -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Recent Work</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ adminStore.currentMember.member.profile?.recent_work || 'Not provided.' }}</p>
        </div>

        <!-- Unique View -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Unique View on Life</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ adminStore.currentMember.member.profile?.unique_view || 'Not provided.' }}</p>
        </div>

        <!-- Cover Letter (if provided) -->
        <div v-if="adminStore.currentMember.member.profile?.cover_letter" class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Why they want to join</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ adminStore.currentMember.member.profile.cover_letter }}</p>
        </div>

        <!-- Portfolio -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Portfolio & Links</h2>
          <div class="space-y-2">
            <a
              v-if="adminStore.currentMember.member.profile?.portfolio_url"
              :href="adminStore.currentMember.member.profile.portfolio_url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ adminStore.currentMember.member.profile.portfolio_url }}
            </a>
            <a
              v-for="(link, index) in adminStore.currentMember.member.profile?.additional_links"
              :key="index"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              {{ link.label || link.url }}
            </a>
          </div>
        </div>

        <!-- Admin Notes -->
        <div v-if="adminStore.currentMember.admin_notes && adminStore.currentMember.admin_notes.length > 0" class="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h2>
          <div class="space-y-4">
            <div
              v-for="note in adminStore.currentMember.admin_notes"
              :key="note.id"
              class="border-l-4 border-gray-300 pl-4"
            >
              <p class="text-gray-700">{{ note.note_text }}</p>
              <p class="text-sm text-gray-500 mt-1">
                {{ note.admin.full_name }} · {{ new Date(note.created_at).toLocaleDateString() }}
              </p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="adminStore.currentMember.member.status === 'approved'" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div class="flex flex-wrap gap-3">
            <BaseButton
              v-if="!isScout()"
              @click="handlePromoteToScout"
              :loading="promotingToScout"
            >
              <SparklesIcon class="h-5 w-5 mr-2" />
              Promote to Scout
            </BaseButton>
            <div v-else class="flex items-center text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg">
              <SparklesIcon class="h-5 w-5 mr-2" />
              This member is a Scout
            </div>
            <BaseButton variant="danger" @click="showDeactivateModal = true">
              <ExclamationTriangleIcon class="h-5 w-5 mr-2" />
              Deactivate Member
            </BaseButton>
          </div>
        </div>
      </template>
    </div>

    <!-- Deactivate Modal -->
    <TransitionRoot :show="showDeactivateModal" as="template">
      <Dialog class="relative z-50" @close="showDeactivateModal = false">
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
                  Deactivate Member
                </DialogTitle>

                <BaseAlert v-if="error" type="error" class="mb-4">
                  {{ error }}
                </BaseAlert>

                <p class="text-sm text-gray-600 mb-4">
                  Are you sure you want to deactivate this member? They will no longer be able to access the platform.
                </p>

                <BaseTextarea
                  v-model="deactivateReason"
                  label="Reason for Deactivation"
                  placeholder="Explain why this member is being deactivated..."
                  :rows="3"
                  required
                />

                <div class="mt-6 flex gap-3 justify-end">
                  <BaseButton variant="outline" @click="showDeactivateModal = false">
                    Cancel
                  </BaseButton>
                  <BaseButton variant="danger" :loading="actionLoading" @click="handleDeactivate">
                    Deactivate
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
