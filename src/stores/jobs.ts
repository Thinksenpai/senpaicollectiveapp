import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jobsApi } from '@/api'
import type {
  Job,
  JobApplication,
  JobDeliverable,
  JobFilters,
  JobApplicationData,
  DeliverableData,
  MemberPerformance,
  Pagination
} from '@/types'

export const useJobsStore = defineStore('jobs', () => {
  // State
  const jobs = ref<Job[]>([])
  const currentJob = ref<Job | null>(null)
  const myApplications = ref<JobApplication[]>([])
  const assignedJobs = ref<Job[]>([])
  const myPerformance = ref<MemberPerformance | null>(null)
  const pagination = ref<Pagination | null>(null)
  const filters = ref<JobFilters>({
    limit: 20,
    offset: 0,
    sort_by: 'newest'
  })
  const loading = ref(false)
  const error = ref<string | null>(null)
  const applicationsLoading = ref(false)
  const applicationsError = ref<string | null>(null)

  // Actions
  async function fetchJobs(newFilters?: JobFilters) {
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.getJobs(filters.value)
      if (response.status && response.data) {
        jobs.value = response.data
        pagination.value = response.pagination
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch jobs'
    } finally {
      loading.value = false
    }
  }

  async function fetchJob(id: string) {
    currentJob.value = null
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.getJob(id)
      if (response.status && response.data) {
        currentJob.value = response.data
        return response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch job'
    } finally {
      loading.value = false
    }
  }

  async function applyToJob(jobId: string, data: JobApplicationData) {
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.applyToJob(jobId, data)
      if (response.status && response.data) {
        // Refresh applications list
        await fetchMyApplications()
        return { success: true, data: response.data }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to submit application'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchMyApplications() {
    applicationsLoading.value = true
    applicationsError.value = null

    try {
      const response = await jobsApi.getMyApplications()
      if (response.status && response.data) {
        myApplications.value = response.data
      }
    } catch (e: any) {
      applicationsError.value = e.response?.data?.message || e.message || 'Failed to fetch applications'
    } finally {
      applicationsLoading.value = false
    }
  }

  async function withdrawApplication(applicationId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.withdrawApplication(applicationId)
      if (response.status) {
        // Update local state
        const app = myApplications.value.find(a => a.id === applicationId)
        if (app) {
          app.status = 'withdrawn'
        }
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to withdraw application'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchAssignedJobs() {
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.getAssignedJobs()
      if (response.status && response.data) {
        assignedJobs.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch assigned jobs'
    } finally {
      loading.value = false
    }
  }

  async function uploadDeliverable(jobId: string, data: DeliverableData) {
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.uploadDeliverable(jobId, data)
      if (response.status && response.data) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to upload deliverable'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchMyPerformance() {
    loading.value = true
    error.value = null

    try {
      const response = await jobsApi.getMyPerformance()
      if (response.status && response.data) {
        myPerformance.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch performance'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      limit: 20,
      offset: 0,
      sort_by: 'newest'
    }
  }

  function nextPage() {
    if (pagination.value?.has_next) {
      filters.value.offset = (filters.value.offset || 0) + (filters.value.limit || 20)
      fetchJobs()
    }
  }

  function prevPage() {
    if (pagination.value?.has_prev) {
      filters.value.offset = Math.max(0, (filters.value.offset || 0) - (filters.value.limit || 20))
      fetchJobs()
    }
  }

  // Check if user has already applied to a job
  function hasAppliedToJob(jobId: string): boolean {
    return myApplications.value.some(app => app.job_id === jobId)
  }

  // Get application for a specific job
  function getApplicationForJob(jobId: string): JobApplication | undefined {
    return myApplications.value.find(app => app.job_id === jobId)
  }

  return {
    // State
    jobs,
    currentJob,
    myApplications,
    assignedJobs,
    myPerformance,
    pagination,
    filters,
    loading,
    error,
    applicationsLoading,
    applicationsError,
    // Actions
    fetchJobs,
    fetchJob,
    applyToJob,
    fetchMyApplications,
    withdrawApplication,
    fetchAssignedJobs,
    uploadDeliverable,
    fetchMyPerformance,
    resetFilters,
    nextPage,
    prevPage,
    hasAppliedToJob,
    getApplicationForJob
  }
})
