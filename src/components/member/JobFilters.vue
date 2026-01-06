<script setup lang="ts">
import { computed } from 'vue'
import type { JobType } from '@/types'
import { useSkillsStore } from '@/stores/skills'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  search: string
  selectedSkills: number[]
  selectedJobTypes: JobType[]
  sortBy: 'newest' | 'deadline' | 'budget'
  showFilters: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:search': [value: string]
  'update:selectedSkills': [value: number[]]
  'update:selectedJobTypes': [value: JobType[]]
  'update:sortBy': [value: 'newest' | 'deadline' | 'budget']
  'update:showFilters': [value: boolean]
  'clear': []
}>()

const skillsStore = useSkillsStore()

const skillOptions = computed(() => {
  return skillsStore.skills.map(skill => ({
    value: skill.id,
    label: skill.name
  }))
})

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'project', label: 'Project' },
  { value: 'internship', label: 'Internship' }
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'budget', label: 'Budget' }
]

const hasActiveFilters = computed(() => {
  return props.search || props.selectedSkills.length > 0 || props.selectedJobTypes.length > 0
})

const activeFilterCount = computed(() => {
  let count = 0
  if (props.search) count++
  if (props.selectedSkills.length > 0) count++
  if (props.selectedJobTypes.length > 0) count++
  return count
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row gap-4">
      <!-- Search -->
      <div class="flex-1 relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          :value="search"
          @input="emit('update:search', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Search jobs by title or description..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-senpai-500 focus:border-senpai-500"
        />
      </div>

      <!-- Sort -->
      <div class="w-full sm:w-48">
        <BaseSelect
          :model-value="sortBy"
          @update:model-value="emit('update:sortBy', $event as 'newest' | 'deadline' | 'budget')"
          :options="sortOptions"
          placeholder="Sort by"
        />
      </div>

      <!-- Filter Toggle -->
      <button
        @click="emit('update:showFilters', !showFilters)"
        :class="[
          'inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium',
          hasActiveFilters
            ? 'border-senpai-500 text-senpai-700 bg-senpai-50'
            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
        ]"
      >
        <FunnelIcon class="h-5 w-5 mr-2" />
        Filters
        <span v-if="activeFilterCount > 0" class="ml-1 bg-senpai-500 text-white text-xs rounded-full px-2">
          {{ activeFilterCount }}
        </span>
      </button>
    </div>

    <!-- Expanded Filters -->
    <div v-show="showFilters" class="bg-gray-50 rounded-lg p-4 space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <BaseMultiSelect
          :model-value="selectedSkills"
          @update:model-value="emit('update:selectedSkills', $event as number[])"
          :options="skillOptions"
          label="Skills"
          placeholder="Filter by skills"
        />

        <BaseMultiSelect
          :model-value="selectedJobTypes"
          @update:model-value="emit('update:selectedJobTypes', $event as JobType[])"
          :options="jobTypeOptions"
          label="Job Type"
          placeholder="Filter by job type"
        />
      </div>

      <div v-if="hasActiveFilters" class="flex justify-end">
        <button
          @click="emit('clear')"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <XMarkIcon class="h-4 w-4 mr-1" />
          Clear all filters
        </button>
      </div>
    </div>
  </div>
</template>
