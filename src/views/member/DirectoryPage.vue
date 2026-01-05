<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMembersStore } from '@/stores/members'
import { useSkillsStore } from '@/stores/skills'
import type { ExperienceLevel } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import MemberCard from '@/components/member/MemberCard.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'

const membersStore = useMembersStore()
const skillsStore = useSkillsStore()

const search = ref('')
const selectedSkills = ref<number[]>([])
const selectedExperience = ref<ExperienceLevel[]>([])
const sortBy = ref<'name' | 'newest' | 'recently_active'>('newest')

const showFilters = ref(false)

const skillOptions = computed(() => {
  return skillsStore.skills.map(skill => ({
    value: skill.id,
    label: skill.name
  }))
})

const experienceOptions = [
  { value: 'none', label: 'No experience' },
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest members' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'recently_active', label: 'Recently active' }
]

const hasActiveFilters = computed(() => {
  return search.value || selectedSkills.value.length > 0 || selectedExperience.value.length > 0
})

onMounted(() => {
  skillsStore.fetchSkills()
  fetchMembers()
})

function fetchMembers() {
  membersStore.fetchMembers({
    search: search.value || undefined,
    skill_ids: selectedSkills.value.length > 0 ? selectedSkills.value : undefined,
    experience_levels: selectedExperience.value.length > 0 ? selectedExperience.value : undefined,
    sort_by: sortBy.value,
    limit: 20,
    offset: 0
  })
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchMembers, 300)
})

watch([selectedSkills, selectedExperience, sortBy], fetchMembers)

function clearFilters() {
  search.value = ''
  selectedSkills.value = []
  selectedExperience.value = []
  sortBy.value = 'newest'
  fetchMembers()
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Member Directory</h1>
        <p class="mt-1 text-gray-600">
          Discover and connect with fellow creatives in the Senpai community.
        </p>
      </div>

      <!-- Search & Filters -->
      <div class="mb-6 space-y-4">
        <div class="flex flex-col sm:flex-row gap-4">
          <!-- Search -->
          <div class="flex-1 relative">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              v-model="search"
              type="text"
              placeholder="Search by name or bio..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senpai-500 focus:border-senpai-500"
            />
          </div>

          <!-- Sort -->
          <div class="w-full sm:w-48">
            <BaseSelect
              v-model="sortBy"
              :options="sortOptions"
              placeholder="Sort by"
            />
          </div>

          <!-- Filter Toggle -->
          <button
            @click="showFilters = !showFilters"
            :class="[
              'inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium',
              hasActiveFilters
                ? 'border-senpai-500 text-senpai-700 bg-senpai-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            ]"
          >
            <FunnelIcon class="h-5 w-5 mr-2" />
            Filters
            <span v-if="hasActiveFilters" class="ml-1 bg-senpai-500 text-white text-xs rounded-full px-2">
              {{ (selectedSkills.length > 0 ? 1 : 0) + (selectedExperience.length > 0 ? 1 : 0) + (search ? 1 : 0) }}
            </span>
          </button>
        </div>

        <!-- Expanded Filters -->
        <div v-show="showFilters" class="bg-gray-50 rounded-lg p-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseMultiSelect
              v-model="selectedSkills"
              :options="skillOptions"
              label="Skills"
              placeholder="Filter by skills"
            />

            <BaseMultiSelect
              v-model="selectedExperience"
              :options="experienceOptions"
              label="Experience Level"
              placeholder="Filter by experience"
            />
          </div>

          <div v-if="hasActiveFilters" class="flex justify-end">
            <button
              @click="clearFilters"
              class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <XMarkIcon class="h-4 w-4 mr-1" />
              Clear all filters
            </button>
          </div>
        </div>
      </div>

      <!-- Results Count -->
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          <span v-if="membersStore.pagination">
            Showing {{ membersStore.members.length }} of {{ membersStore.pagination.total }} members
          </span>
        </p>
      </div>

      <!-- Loading -->
      <div v-if="membersStore.loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="membersStore.error"
        class="text-center py-12 bg-white rounded-lg"
      >
        <div class="text-red-500 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900">Error loading members</h3>
        <p class="mt-2 text-gray-600">{{ membersStore.error }}</p>
        <BaseButton variant="outline" class="mt-4" @click="fetchMembers">
          Try again
        </BaseButton>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="membersStore.members.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <MagnifyingGlassIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No members found</h3>
        <p class="mt-2 text-gray-600">
          Try adjusting your search or filter criteria.
        </p>
        <BaseButton v-if="hasActiveFilters" variant="outline" class="mt-4" @click="clearFilters">
          Clear filters
        </BaseButton>
      </div>

      <!-- Members Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MemberCard
          v-for="member in membersStore.members"
          :key="member.id"
          :member="member"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="membersStore.pagination && membersStore.pagination.total_pages > 1"
        class="mt-8 flex items-center justify-center gap-4"
      >
        <BaseButton
          variant="outline"
          :disabled="!membersStore.pagination.has_prev"
          @click="membersStore.prevPage"
        >
          Previous
        </BaseButton>
        <span class="text-sm text-gray-600">
          Page {{ membersStore.pagination.current_page }} of {{ membersStore.pagination.total_pages }}
        </span>
        <BaseButton
          variant="outline"
          :disabled="!membersStore.pagination.has_next"
          @click="membersStore.nextPage"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>
