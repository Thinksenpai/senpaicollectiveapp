import { defineStore } from 'pinia'
import { ref } from 'vue'
import { adminApi } from '@/api'
import type {
  Application,
  Member,
  AdminStats,
  AdminAnalytics,
  AdminNote,
  Pagination,
  ApplicationFilters,
  AdminMemberFilters
} from '@/types'

export const useAdminStore = defineStore('admin', () => {
  // Applications
  const applications = ref<Application[]>([])
  const applicationsPagination = ref<Pagination | null>(null)
  const applicationsLoading = ref(false)

  // Members
  const members = ref<Member[]>([])
  const membersPagination = ref<Pagination | null>(null)
  const membersLoading = ref(false)
  const currentMember = ref<{ member: Member; admin_notes: AdminNote[] } | null>(null)

  // Stats
  const stats = ref<AdminStats | null>(null)
  const analytics = ref<AdminAnalytics | null>(null)
  const statsLoading = ref(false)

  const error = ref<string | null>(null)

  // Applications
  async function fetchApplications(filters: ApplicationFilters = {}) {
    applicationsLoading.value = true
    error.value = null

    try {
      const response = await adminApi.getApplications(filters)
      if (response.status && response.data) {
        applications.value = response.data
        applicationsPagination.value = response.pagination
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch applications'
    } finally {
      applicationsLoading.value = false
    }
  }

  async function approveApplication(id: string, adminNotes?: string) {
    error.value = null

    try {
      const response = await adminApi.approveApplication(id, adminNotes)
      if (response.status) {
        // Remove from list
        applications.value = applications.value.filter(a => a.id !== id)
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to approve application'
      return { success: false, error: error.value }
    }
  }

  async function declineApplication(id: string, reason: string, adminNotes?: string) {
    error.value = null

    try {
      const response = await adminApi.declineApplication(id, reason, adminNotes)
      if (response.status) {
        // Remove from list
        applications.value = applications.value.filter(a => a.id !== id)
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to decline application'
      return { success: false, error: error.value }
    }
  }

  // Members
  async function fetchMembers(filters: AdminMemberFilters = {}) {
    membersLoading.value = true
    error.value = null

    try {
      const response = await adminApi.getMembers(filters)
      if (response.status && response.data) {
        members.value = response.data
        membersPagination.value = response.pagination
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch members'
    } finally {
      membersLoading.value = false
    }
  }

  async function fetchMember(id: string) {
    membersLoading.value = true
    error.value = null

    try {
      const response = await adminApi.getMember(id)
      if (response.status && response.data) {
        currentMember.value = response.data
        return response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch member'
    } finally {
      membersLoading.value = false
    }
  }

  async function deactivateMember(id: string, reason: string) {
    error.value = null

    try {
      const response = await adminApi.deactivateMember(id, reason)
      if (response.status) {
        return { success: true }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to deactivate member'
      return { success: false, error: error.value }
    }
  }

  async function promoteToScout(id: string) {
    error.value = null

    try {
      const response = await adminApi.promoteToScout(id)
      if (response.status) {
        return { success: true, data: response.data }
      }
      return { success: false, error: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to promote member to scout'
      return { success: false, error: error.value }
    }
  }

  // Stats
  async function fetchStatistics() {
    statsLoading.value = true
    error.value = null

    try {
      const response = await adminApi.getStatistics()
      if (response.status && response.data) {
        stats.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch statistics'
    } finally {
      statsLoading.value = false
    }
  }

  async function fetchAnalytics() {
    statsLoading.value = true
    error.value = null

    try {
      const response = await adminApi.getAnalytics()
      if (response.status && response.data) {
        analytics.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch analytics'
    } finally {
      statsLoading.value = false
    }
  }

  return {
    // Applications
    applications,
    applicationsPagination,
    applicationsLoading,
    fetchApplications,
    approveApplication,
    declineApplication,

    // Members
    members,
    membersPagination,
    membersLoading,
    currentMember,
    fetchMembers,
    fetchMember,
    deactivateMember,
    promoteToScout,

    // Stats
    stats,
    analytics,
    statsLoading,
    fetchStatistics,
    fetchAnalytics,

    error
  }
})
