<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useMembersStore } from '@/stores/members'
import { useSkillsStore } from '@/stores/skills'
import type { ExperienceLevel } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import MemberCard from '@/components/member/MemberCard.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  UserGroupIcon,
  SparklesIcon,
  StarIcon,
  ShieldCheckIcon
} from '@heroicons/vue/24/outline'

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
  { value: 'junior', label: 'Junior (0-2 yrs)' },
  { value: 'mid', label: 'Mid-level (2-5 yrs)' },
  { value: 'senior', label: 'Senior (5+ yrs)' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'recently_active', label: 'Recently active' }
]

const hasActiveFilters = computed(() => {
  return search.value || selectedSkills.value.length > 0 || selectedExperience.value.length > 0
})

const activeFilterCount = computed(() => {
  let count = 0
  if (search.value) count++
  if (selectedSkills.value.length > 0) count++
  if (selectedExperience.value.length > 0) count++
  return count
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
    limit: 24,
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

function removeSkillFilter(skillId: number) {
  selectedSkills.value = selectedSkills.value.filter(id => id !== skillId)
}

function removeExperienceFilter(level: ExperienceLevel) {
  selectedExperience.value = selectedExperience.value.filter(l => l !== level)
}

function getSkillName(skillId: number): string {
  return skillsStore.skills.find(s => s.id === skillId)?.name || 'Unknown'
}

function getExperienceLabel(level: ExperienceLevel): string {
  return experienceOptions.find(o => o.value === level)?.label || level
}
</script>

<template>
  <AppLayout>
    <div class="min-h-screen bg-gray-50">
      <!-- Hero Header -->
      <div class="bg-white border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 class="text-3xl font-bold text-gray-900">Member Directory</h1>
              <p class="mt-2 text-gray-600 max-w-2xl">
                Discover talented creatives in the Senpai community. Connect, collaborate, and grow together.
              </p>
            </div>
            <!-- Stats -->
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2 text-gray-600">
                <UserGroupIcon class="h-5 w-5" />
                <span class="font-medium">{{ membersStore.pagination?.total || 0 }}</span>
                <span>Members</span>
              </div>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <div class="flex-1 relative">
              <MagnifyingGlassIcon class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                v-model="search"
                type="text"
                placeholder="Search by name, skill, or location..."
                class="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
              />
            </div>
            <div class="flex gap-3">
              <div class="w-40">
                <BaseSelect
                  v-model="sortBy"
                  :options="sortOptions"
                  placeholder="Sort by"
                />
              </div>
              <button
                @click="showFilters = !showFilters"
                :class="[
                  'inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  showFilters || hasActiveFilters
                    ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                ]"
              >
                <AdjustmentsHorizontalIcon class="h-5 w-5 mr-2" />
                Filters
                <span
                  v-if="activeFilterCount > 0"
                  class="ml-2 bg-indigo-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                >
                  {{ activeFilterCount }}
                </span>
              </button>
            </div>
          </div>

          <!-- Expanded Filters -->
          <transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-150 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-2"
          >
            <div v-show="showFilters" class="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
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
            </div>
          </transition>

          <!-- Active Filter Tags -->
          <div v-if="hasActiveFilters" class="mt-4 flex flex-wrap items-center gap-2">
            <span class="text-sm text-gray-500">Active filters:</span>
            <span
              v-if="search"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
            >
              "{{ search }}"
              <button @click="search = ''" class="hover:text-gray-900">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>
            <span
              v-for="skillId in selectedSkills"
              :key="`skill-${skillId}`"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-indigo-100 text-indigo-700"
            >
              {{ getSkillName(skillId) }}
              <button @click="removeSkillFilter(skillId)" class="hover:text-indigo-900">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>
            <span
              v-for="level in selectedExperience"
              :key="`exp-${level}`"
              class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700"
            >
              {{ getExperienceLabel(level) }}
              <button @click="removeExperienceFilter(level)" class="hover:text-purple-900">
                <XMarkIcon class="h-4 w-4" />
              </button>
            </span>
            <button
              @click="clearFilters"
              class="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Results Count -->
        <div class="mb-6 flex items-center justify-between">
          <p class="text-sm text-gray-600">
            <span v-if="membersStore.pagination && !membersStore.loading">
              Showing <span class="font-medium text-gray-900">{{ membersStore.members.length }}</span>
              of <span class="font-medium text-gray-900">{{ membersStore.pagination.total }}</span> members
            </span>
          </p>
          <!-- Legend -->
          <div class="hidden sm:flex items-center gap-4 text-xs text-gray-500">
            <div class="flex items-center gap-1">
              <ShieldCheckIcon class="h-4 w-4 text-red-500" />
              Admin
            </div>
            <div class="flex items-center gap-1">
              <StarIcon class="h-4 w-4 text-amber-500" />
              Scout
            </div>
            <div class="flex items-center gap-1">
              <SparklesIcon class="h-4 w-4 text-indigo-500" />
              OG Member
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="membersStore.loading" class="flex flex-col items-center justify-center py-16">
          <LoadingSpinner size="lg" />
          <p class="mt-4 text-gray-500">Loading members...</p>
        </div>

        <!-- Error State -->
        <div
          v-else-if="membersStore.error"
          class="text-center py-16 bg-white rounded-2xl border border-gray-200"
        >
          <div class="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900">Something went wrong</h3>
          <p class="mt-2 text-gray-600 max-w-md mx-auto">{{ membersStore.error }}</p>
          <BaseButton variant="outline" class="mt-6" @click="fetchMembers">
            Try again
          </BaseButton>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="membersStore.members.length === 0"
          class="text-center py-16 bg-white rounded-2xl border border-gray-200"
        >
          <div class="mx-auto h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <MagnifyingGlassIcon class="h-8 w-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900">No members found</h3>
          <p class="mt-2 text-gray-600 max-w-md mx-auto">
            We couldn't find any members matching your criteria. Try adjusting your filters.
          </p>
          <BaseButton v-if="hasActiveFilters" variant="outline" class="mt-6" @click="clearFilters">
            Clear all filters
          </BaseButton>
        </div>

        <!-- Members Grid -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <MemberCard
            v-for="member in membersStore.members"
            :key="member.id"
            :member="member"
          />
        </div>

        <!-- Pagination -->
        <div
          v-if="membersStore.pagination && membersStore.pagination.total_pages > 1"
          class="mt-10 flex items-center justify-center gap-2"
        >
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="!membersStore.pagination.has_prev"
            @click="membersStore.prevPage"
          >
            Previous
          </BaseButton>
          <div class="flex items-center gap-1 px-4">
            <span class="text-sm text-gray-600">
              Page <span class="font-medium text-gray-900">{{ membersStore.pagination.current_page }}</span>
              of <span class="font-medium text-gray-900">{{ membersStore.pagination.total_pages }}</span>
            </span>
          </div>
          <BaseButton
            variant="outline"
            size="sm"
            :disabled="!membersStore.pagination.has_next"
            @click="membersStore.nextPage"
          >
            Next
          </BaseButton>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
