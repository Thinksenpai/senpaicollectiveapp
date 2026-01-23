import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Application,
  Member,
  AdminStats,
  AdminAnalytics,
  AdminNote,
  ApplicationFilters,
  AdminMemberFilters,
  Scout
} from '@/types'

export const adminApi = {
  // Applications
  async getApplications(filters: ApplicationFilters = {}): Promise<PaginatedResponse<Application>> {
    const params = new URLSearchParams()
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    return apiClient.get(`/admin/applications?${params.toString()}`)
  },

  async approveApplication(id: string, adminNotes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/applications/${id}/approve`, { admin_notes: adminNotes })
  },

  async declineApplication(id: string, reason: string, adminNotes?: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/applications/${id}/decline`, {
      reason,
      admin_notes: adminNotes
    })
  },

  // Members
  async getMembers(filters: AdminMemberFilters = {}): Promise<PaginatedResponse<Member>> {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.search) params.append('search', filters.search)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())
    return apiClient.get(`/admin/members?${params.toString()}`)
  },

  async getMember(id: string): Promise<ApiResponse<{ member: Member; admin_notes: AdminNote[] }>> {
    return apiClient.get(`/admin/members/${id}`)
  },

  async deactivateMember(id: string, reason: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/members/${id}/deactivate`, { reason })
  },

  // Scout management
  async promoteToScout(id: string): Promise<ApiResponse<Scout>> {
    return apiClient.post(`/admin/members/${id}/promote-scout`)
  },

  async removeScout(id: string): Promise<ApiResponse> {
    return apiClient.post(`/admin/scouts/${id}/remove`)
  },

  async getScouts(): Promise<ApiResponse<Scout[]>> {
    return apiClient.get('/admin/scouts')
  },

  // Statistics
  async getStatistics(): Promise<ApiResponse<AdminStats>> {
    return apiClient.get('/admin/statistics')
  },

  async getAnalytics(): Promise<ApiResponse<AdminAnalytics>> {
    return apiClient.get('/admin/analytics')
  }
}

export default adminApi
