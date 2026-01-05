import apiClient from './client'
import type { ApiResponse, Skill } from '@/types'

export const skillsApi = {
  async getSkills(): Promise<ApiResponse<Skill[]>> {
    return apiClient.get('/skills')
  }
}

export default skillsApi
