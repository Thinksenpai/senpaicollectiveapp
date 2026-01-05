<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import type { MemberStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { UsersIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

const search = ref('')
const statusFilter = ref<MemberStatus | ''>('')

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
  { value: 'deactivated', label: 'Deactivated' }
]

const statusBadgeClasses: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  deactivated: 'bg-gray-100 text-gray-800'
}

onMounted(() => {
  fetchMembers()
})

function fetchMembers() {
  adminStore.fetchMembers({
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    limit: 20,
    offset: 0
  })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchMembers, 300)
})

watch(statusFilter, fetchMembers)
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
        <h1 class="text-2xl font-bold text-gray-900">Members</h1>
        <p class="mt-1 text-gray-600">
          View and manage all platform members.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
      <div v-if="adminStore.membersLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="adminStore.members.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No members found</h3>
        <p class="mt-2 text-gray-600">
          Try adjusting your search or filter criteria.
        </p>
      </div>

      <!-- Members Table -->
      <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Skill
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Joined
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="member in adminStore.members" :key="member.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <div class="font-medium text-gray-900">{{ member.profile?.full_name }}</div>
                  <div class="text-sm text-gray-500">{{ member.email }}</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                    statusBadgeClasses[member.status]
                  ]"
                >
                  {{ member.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ member.profile?.primary_skill?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ member.profile?.city }}, {{ member.profile?.country }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(member.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <RouterLink
                  :to="`/admin/members/${member.id}`"
                  class="text-indigo-600 hover:text-indigo-900"
                >
                  View
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="adminStore.membersPagination && adminStore.membersPagination.total_pages > 1"
          class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
        >
          <p class="text-sm text-gray-600">
            Showing {{ adminStore.members.length }} of {{ adminStore.membersPagination.total }} members
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.membersPagination.has_prev"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.membersPagination.has_next"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
