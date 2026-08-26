import apiClient from './client'
import type { ApiResponse, MemberBaseline, SubmitBaselinePayload, BaselineCoverage, BaselineKind } from '@/types'

export const baselinesApi = {
  // ==================
  // MEMBER ENDPOINTS
  // ==================

  async getMyBaseline(kind: BaselineKind = 'intake'): Promise<ApiResponse<MemberBaseline | null>> {
    return apiClient.get(`/me/baseline?kind=${kind}`)
  },

  async submitMyBaseline(data: SubmitBaselinePayload): Promise<ApiResponse<MemberBaseline>> {
    return apiClient.post('/me/baseline', data)
  },

  // ==================
  // ADMIN ENDPOINTS
  // ==================

  async listBaselines(kind: BaselineKind = 'intake'): Promise<ApiResponse<MemberBaseline[]>> {
    return apiClient.get(`/admin/baselines?kind=${kind}`)
  },

  async getMemberBaselines(memberId: string): Promise<ApiResponse<MemberBaseline[]>> {
    return apiClient.get(`/admin/members/${memberId}/baselines`)
  },

  async getCoverage(cohortId: string): Promise<ApiResponse<BaselineCoverage>> {
    return apiClient.get(`/admin/cohorts/${cohortId}/baseline-coverage`)
  }
}

export default baselinesApi
