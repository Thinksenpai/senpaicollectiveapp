<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { useSkillsStore } from '@/stores/skills'
import type { JobType } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import JobCard from '@/components/member/JobCard.vue'
import JobFilters from '@/components/member/JobFilters.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { BriefcaseIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const jobsStore = useJobsStore()
const skillsStore = useSkillsStore()

const search = ref('')
const selectedSkills = ref<number[]>([])
const selectedJobTypes = ref<JobType[]>([])
const sortBy = ref<'newest' | 'deadline' | 'budget'>('newest')
const showFilters = ref(false)

const hasActiveFilters = computed(() => {
  return search.value || selectedSkills.value.length > 0 || selectedJobTypes.value.length > 0
})

onMounted(() => {
  skillsStore.fetchSkills()
  jobsStore.fetchMyApplications()
  fetchJobs()
})

function fetchJobs() {
  jobsStore.fetchJobs({
    search: search.value || undefined,
    skill_ids: selectedSkills.value.length > 0 ? selectedSkills.value : undefined,
    job_type: selectedJobTypes.value.length === 1 ? selectedJobTypes.value[0] : undefined,
    sort_by: sortBy.value,
    limit: 20,
    offset: 0
  })
}

// Debounced search
let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchJobs, 300)
})

watch([selectedSkills, selectedJobTypes, sortBy], fetchJobs)

function clearFilters() {
  search.value = ''
  selectedSkills.value = []
  selectedJobTypes.value = []
  sortBy.value = 'newest'
  fetchJobs()
}
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Job Board</h1>
        <p class="mt-1 text-gray-600">
          Find opportunities from companies looking for creative talent.
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-6">
        <JobFilters
          v-model:search="search"
          v-model:selected-skills="selectedSkills"
          v-model:selected-job-types="selectedJobTypes"
          v-model:sort-by="sortBy"
          v-model:show-filters="showFilters"
          @clear="clearFilters"
        />
      </div>

      <!-- Results Count -->
      <div class="mb-4 flex items-center justify-between">
        <p class="text-sm text-gray-600">
          <span v-if="jobsStore.pagination">
            Showing {{ jobsStore.jobs.length }} of {{ jobsStore.pagination.total }} jobs
          </span>
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
        <BaseButton variant="outline" class="mt-4" @click="fetchJobs">
          Try again
        </BaseButton>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="jobsStore.jobs.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <BriefcaseIcon v-if="!hasActiveFilters" class="mx-auto h-12 w-12 text-gray-400" />
        <MagnifyingGlassIcon v-else class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">
          {{ hasActiveFilters ? 'No jobs found' : 'No jobs available' }}
        </h3>
        <p class="mt-2 text-gray-600">
          {{ hasActiveFilters
            ? 'Try adjusting your search or filter criteria.'
            : 'Check back soon for new opportunities.'
          }}
        </p>
        <BaseButton v-if="hasActiveFilters" variant="outline" class="mt-4" @click="clearFilters">
          Clear filters
        </BaseButton>
      </div>

      <!-- Jobs Grid -->
      <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <JobCard
          v-for="job in jobsStore.jobs"
          :key="job.id"
          :job="job"
        />
      </div>

      <!-- Pagination -->
      <div
        v-if="jobsStore.pagination && jobsStore.pagination.total_pages > 1"
        class="mt-8 flex items-center justify-center gap-4"
      >
        <BaseButton
          variant="outline"
          :disabled="!jobsStore.pagination.has_prev"
          @click="jobsStore.prevPage"
        >
          Previous
        </BaseButton>
        <span class="text-sm text-gray-600">
          Page {{ jobsStore.pagination.current_page }} of {{ jobsStore.pagination.total_pages }}
        </span>
        <BaseButton
          variant="outline"
          :disabled="!jobsStore.pagination.has_next"
          @click="jobsStore.nextPage"
        >
          Next
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>
