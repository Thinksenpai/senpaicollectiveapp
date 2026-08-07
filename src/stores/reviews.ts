import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reviewsApi } from '@/api'
import type { JobRole, CreateJobRolePayload, MemberSkill, ProjectInvite } from '@/types'

export const useReviewsStore = defineStore('reviews', () => {
  // State
  const jobRoles = ref<JobRole[]>([])
  const nominatedSkills = ref<MemberSkill[]>([])
  const myInvites = ref<ProjectInvite[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Actions
  async function fetchJobRoles() {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.listJobRoles()
      if (response.status && response.data) {
        jobRoles.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch job roles'
    } finally {
      loading.value = false
    }
  }

  async function createJobRole(data: CreateJobRolePayload) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.createJobRole(data)
      if (response.status && response.data) {
        jobRoles.value.push(response.data)
        return { success: true, data: response.data }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to create job role'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function updateJobRole(id: number, data: CreateJobRolePayload & { is_active: boolean }) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.updateJobRole(id, data)
      if (response.status && response.data) {
        const idx = jobRoles.value.findIndex(r => r.id === id)
        if (idx !== -1) jobRoles.value[idx] = response.data
        return { success: true, data: response.data }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to update job role'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchNominatedSkills() {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.listNominatedSkills()
      if (response.status && response.data) {
        nominatedSkills.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch nominated skills'
    } finally {
      loading.value = false
    }
  }

  async function confirmSkillVerification(memberId: string, skillId: number) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.confirmSkillVerification(memberId, skillId)
      if (response.status) {
        nominatedSkills.value = nominatedSkills.value.filter(
          s => !(s.member_id === memberId && s.skill_id === skillId)
        )
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to confirm verification'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function seedVerifySkill(memberId: string, skillId: number) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.seedVerifySkill(memberId, skillId)
      if (response.status) {
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to seed-verify skill'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchMyInvites(status?: string) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.getMyInvites(status)
      if (response.status && response.data) {
        myInvites.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch invites'
    } finally {
      loading.value = false
    }
  }

  async function respondToInvite(inviteId: string, accept: boolean) {
    loading.value = true
    error.value = null

    try {
      const response = await reviewsApi.respondToInvite(inviteId, accept)
      if (response.status) {
        const invite = myInvites.value.find(i => i.id === inviteId)
        if (invite) invite.status = accept ? 'accepted' : 'declined'
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to respond to invite'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    jobRoles,
    nominatedSkills,
    myInvites,
    loading,
    error,
    // Actions
    fetchJobRoles,
    createJobRole,
    updateJobRole,
    fetchNominatedSkills,
    confirmSkillVerification,
    seedVerifySkill,
    fetchMyInvites,
    respondToInvite
  }
})
