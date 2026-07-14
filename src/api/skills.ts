import apiClient from './client'
import type { ApiResponse, Skill } from '@/types'

export const skillsApi = {
  async getSkills(): Promise<ApiResponse<Skill[]>> {
    return apiClient.get('/skills')
  },
  async addMySkill(skillId: number): Promise<ApiResponse<void>> {
    return apiClient.post('/me/skills', { skill_id: skillId })
  },
  async removeMySkill(skillId: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/me/skills/${skillId}`)
  },
  async setMyPrimarySkill(skillId: number): Promise<ApiResponse<void>> {
    return apiClient.post(`/me/skills/${skillId}/primary`)
  }
}

export default skillsApi
