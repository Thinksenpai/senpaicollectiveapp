import { apiClient } from './client'
import type { ApiResponse, ScoutPledge, ScoutDashboardData, ScoutLeaderboardEntry } from '@/types'

export const scoutsApi = {
  // Get scout pledge content
  async getPledge(): Promise<ApiResponse<ScoutPledge>> {
    return apiClient.get('/scouts/pledge')
  },

  // Accept the scout pledge (activates scout status)
  async acceptPledge(acceptTerms: boolean): Promise<ApiResponse<void>> {
    return apiClient.post('/scouts/accept', { accept_terms: acceptTerms })
  },

  // Get scout dashboard with stats and recruits
  async getDashboard(): Promise<ApiResponse<ScoutDashboardData>> {
    return apiClient.get('/scouts/me')
  },

  // Add a note to a recruit
  async addNote(inviteId: string, scoutNote: string): Promise<ApiResponse<void>> {
    return apiClient.post('/scouts/note', { invite_id: inviteId, scout_note: scoutNote })
  },

  // Get scout leaderboard
  async getLeaderboard(): Promise<ApiResponse<ScoutLeaderboardEntry[]>> {
    return apiClient.get('/scouts/leaderboard')
  },

  // Track scout link click (public endpoint)
  async trackClick(scoutCode: string): Promise<ApiResponse<void>> {
    return apiClient.post('/scout/track-click', { scout_code: scoutCode })
  },

  // Look up who a scout invite code belongs to (public endpoint) — powers
  // the "invited by" banner on the registration page.
  async getByCode(scoutCode: string): Promise<ApiResponse<{ full_name: string; photo_url?: string }>> {
    return apiClient.get(`/scout/by-code/${encodeURIComponent(scoutCode)}`)
  }
}
