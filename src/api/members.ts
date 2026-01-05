import apiClient from './client'
import type {
  ApiResponse,
  PaginatedResponse,
  Member,
  PublicMemberProfile,
  MemberFilters,
  DashboardData
} from '@/types'

export const membersApi = {
  async getMe(): Promise<ApiResponse<Member>> {
    return apiClient.get('/members/me')
  },

  async updateMe(data: Partial<{
    full_name: string
    phone: string
    city: string
    country: string
    bio: string
    want_to_learn: string
    can_teach: string
    portfolio_url: string
    additional_links: string[]
    photo_url: string
  }>): Promise<ApiResponse> {
    return apiClient.put('/members/me', data)
  },

  async getMembers(filters: MemberFilters = {}): Promise<PaginatedResponse<PublicMemberProfile>> {
    const params = new URLSearchParams()

    if (filters.search) params.append('search', filters.search)
    if (filters.skill_ids) {
      filters.skill_ids.forEach(id => params.append('skill_ids', id.toString()))
    }
    if (filters.cities) {
      filters.cities.forEach(city => params.append('cities', city))
    }
    if (filters.countries) {
      filters.countries.forEach(country => params.append('countries', country))
    }
    if (filters.experience_levels) {
      filters.experience_levels.forEach(level => params.append('experience_levels', level))
    }
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.offset) params.append('offset', filters.offset.toString())

    return apiClient.get(`/members?${params.toString()}`)
  },

  async getMember(id: string): Promise<ApiResponse<PublicMemberProfile>> {
    return apiClient.get(`/members/${id}`)
  },

  async getPublicMember(id: string): Promise<ApiResponse<PublicMemberProfile>> {
    return apiClient.get(`/members/${id}/public`)
  },

  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return apiClient.get('/dashboard')
  }
}

export default membersApi
