import apiClient from './client'
import type {
  ApiResponse,
  JobRole,
  CreateJobRolePayload,
  MemberSkill,
  WorkLeakage,
  Review,
  SubmitReviewPayload,
  ProjectInvite,
  CreateProjectInvitePayload
} from '@/types'

export const reviewsApi = {
  // ==================
  // MEMBER ENDPOINTS
  // ==================

  async listJobRoles(): Promise<ApiResponse<JobRole[]>> {
    return apiClient.get('/job-roles')
  },

  async getJobRole(id: number): Promise<ApiResponse<JobRole>> {
    return apiClient.get(`/job-roles/${id}`)
  },

  async getMemberSkillsVerification(memberId: string): Promise<ApiResponse<MemberSkill[]>> {
    return apiClient.get(`/members/${memberId}/skills-verification`)
  },

  async getMemberReviews(memberId: string): Promise<ApiResponse<Review[]>> {
    return apiClient.get(`/members/${memberId}/reviews`)
  },

  async submitReview(data: SubmitReviewPayload): Promise<ApiResponse<Review>> {
    return apiClient.post('/reviews', data)
  },

  async getMyInvites(status?: string): Promise<ApiResponse<ProjectInvite[]>> {
    const params = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiClient.get(`/me/invites${params}`)
  },

  async respondToInvite(inviteId: string, accept: boolean): Promise<ApiResponse> {
    return apiClient.post(`/invites/${inviteId}/respond`, { accept })
  },

  async inviteToProject(projectId: string, data: CreateProjectInvitePayload): Promise<ApiResponse<ProjectInvite>> {
    return apiClient.post(`/projects/${projectId}/invites`, data)
  },

  async getProjectInvites(projectId: string): Promise<ApiResponse<ProjectInvite[]>> {
    return apiClient.get(`/projects/${projectId}/invites`)
  },

  // ==================
  // ADMIN ENDPOINTS
  // ==================

  async createJobRole(data: CreateJobRolePayload): Promise<ApiResponse<JobRole>> {
    return apiClient.post('/admin/job-roles', data)
  },

  async updateJobRole(id: number, data: CreateJobRolePayload & { is_active: boolean }): Promise<ApiResponse<JobRole>> {
    return apiClient.put(`/admin/job-roles/${id}`, data)
  },

  async listNominatedSkills(): Promise<ApiResponse<MemberSkill[]>> {
    return apiClient.get('/admin/skills/nominated')
  },

  async getWorkLeakage(): Promise<ApiResponse<WorkLeakage>> {
    return apiClient.get('/admin/work-leakage')
  },

  async confirmSkillVerification(memberId: string, skillId: number): Promise<ApiResponse> {
    return apiClient.post(`/admin/members/${memberId}/skills/${skillId}/confirm-verification`)
  },

  async seedVerifySkill(memberId: string, skillId: number): Promise<ApiResponse> {
    return apiClient.post(`/admin/members/${memberId}/skills/${skillId}/seed-verify`)
  }
}

export default reviewsApi
