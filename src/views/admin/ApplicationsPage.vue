<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { ClipboardDocumentCheckIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchApplications()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <RouterLink
          to="/admin"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-1" />
          Back to Dashboard
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900">Pending Applications</h1>
        <p class="mt-1 text-gray-600">
          Review and approve new member applications.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="adminStore.applicationsLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="adminStore.applications.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <ClipboardDocumentCheckIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No pending applications</h3>
        <p class="mt-2 text-gray-600">
          All applications have been reviewed!
        </p>
      </div>

      <!-- Applications Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applicant
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Skill
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Applied
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Verified
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="app in adminStore.applications" :key="app.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="font-medium text-gray-900">{{ app.profile.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ app.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ app.profile.primary_skill?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ app.profile.city }}, {{ app.profile.country }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(app.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                    app.email_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ app.email_verified ? 'Verified' : 'Pending' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <RouterLink
                  :to="`/admin/applications/${app.id}`"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  Review
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="adminStore.applicationsPagination && adminStore.applicationsPagination.total_pages > 1"
          class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        >
          <p class="text-sm text-gray-600">
            Page {{ adminStore.applicationsPagination.current_page }} of {{ adminStore.applicationsPagination.total_pages }}
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.applicationsPagination.has_prev"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.applicationsPagination.has_next"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
