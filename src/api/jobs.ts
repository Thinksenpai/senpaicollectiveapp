import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Job,
  JobApplication,
  JobDeliverable,
  JobFilters,
  JobSubmissionData,
  JobSubmissionResponse,
  JobStatusResponse,
  JobApplicationData,
  DeliverableData,
  ClientReviewData,
  InternalReviewData,
  MemberPerformance,
  ApplicationStatus
} from '@/types'

export const jobsApi = {
  // ==================
  // PUBLIC ENDPOINTS
  // ==================

  async getJobs(filters: JobFilters = {}): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.skill_ids) {
      filters.skill_ids.forEach(id => params.append('skill_ids', id.toString()))
    }
    if (filters.job_type) params.append('job_type', filters.job_type)
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    return apiClient.get(`/jobs?${params.toString()}`)
  },

  async getJob(id: string): Promise<ApiResponse<Job>> {
    return apiClient.get(`/jobs/${id}`)
  },

  async submitJob(data: JobSubmissionData): Promise<ApiResponse<JobSubmissionResponse>> {
    return apiClient.post('/jobs/submit', data)
  },

  async getJobStatus(token: string): Promise<ApiResponse<JobStatusResponse>> {
    return apiClient.get(`/jobs/status?token=${encodeURIComponent(token)}`)
  },

  async submitClientReview(token: string, data: ClientReviewData): Promise<ApiResponse> {
    return apiClient.post(`/jobs/review/${token}`, data)
  },

  // ==================
  // MEMBER ENDPOINTS
  // ==================

  async applyToJob(jobId: string, data: JobApplicationData): Promise<ApiResponse<JobApplication>> {
    return apiClient.post(`/jobs/${jobId}/apply`, data)
  },

  async getMyApplications(): Promise<ApiResponse<JobApplication[]>> {
    return apiClient.get('/jobs/applications')
  },

  async withdrawApplication(applicationId: string): Promise<ApiResponse> {
    return apiClient.post(`/jobs/applications/${applicationId}/withdraw`)
  },

  async getAssignedJobs(): Promise<ApiResponse<Job[]>> {
    return apiClient.get('/jobs/assigned')
  },

  async uploadDeliverable(jobId: string, data: DeliverableData): Promise<ApiResponse<JobDeliverable>> {
    return apiClient.post(`/jobs/${jobId}/deliverables`, data)
  },

  async getMyPerformance(): Promise<ApiResponse<MemberPerformance>> {
    return apiClient.get('/me/performance')
  },

  // ==================
  // ADMIN ENDPOINTS
  // ==================

  async getAdminJobs(filters: JobFilters & { status?: string } = {}): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.status) params.append('status', filters.status)
    if (filters.job_type) params.append('job_type', filters.job_type)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    return apiClient.get(`/admin/jobs?${params.toString()}`)
  },

  async getPendingJobs(limit?: number, offset?: number): Promise<PaginatedResponse<Job>> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (offset) params.append('offset', offset.toString())

    return apiClient.get(`/admin/jobs/pending?${params.toString()}`)
  },

  async approveJob(jobId: string, adminNotes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/jobs/${jobId}/approve`, { admin_notes: adminNotes })
  },

  async rejectJob(jobId: string, reason: string, notes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/jobs/${jobId}/reject`, { reason, notes })
  },

  async assignJob(jobId: string, memberId: string, adminNotes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/jobs/${jobId}/assign`, {
      member_id: memberId,
      admin_notes: adminNotes
    })
  },

  async completeJob(jobId: string, notes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/jobs/${jobId}/complete`, { notes })
  },

  async getJobApplications(jobId: string): Promise<ApiResponse<JobApplication[]>> {
    return apiClient.get(`/admin/jobs/${jobId}/applications`)
  },

  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus,
    adminNotes?: string,
    rejectionReason?: string
  ): Promise<ApiResponse> {
    return apiClient.patch(`/admin/job-applications/${applicationId}`, {
      status,
      admin_notes: adminNotes,
      rejection_reason: rejectionReason
    })
  },

  async createInternalReview(jobId: string, data: InternalReviewData): Promise<ApiResponse> {
    return apiClient.post(`/admin/jobs/${jobId}/internal-review`, data)
  },

  async getMemberPerformance(memberId: string): Promise<ApiResponse<MemberPerformance & { reviews: any[] }>> {
    return apiClient.get(`/admin/members/${memberId}/performance`)
  },

  async createAdminJob(data: Partial<Job>): Promise<ApiResponse<Job>> {
    return apiClient.post('/admin/jobs', data)
  },

  async updateJob(jobId: string, data: Partial<Job>): Promise<ApiResponse<Job>> {
    return apiClient.put(`/admin/jobs/${jobId}`, data)
  },

  async deleteJob(jobId: string): Promise<ApiResponse> {
    return apiClient.delete(`/admin/jobs/${jobId}`)
  }
}

export default jobsApi
