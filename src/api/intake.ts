import apiClient from './client'
import type { ApiResponse, IntakeSnapshot } from '@/types'

export const intakeApi = {
  // Public — no auth. Returns null data when no cohort is forming, which the
  // caller treats as "render nothing" rather than an error.
  async getStatus(): Promise<ApiResponse<IntakeSnapshot | null>> {
    return apiClient.get('/intake')
  }
}

export default intakeApi
