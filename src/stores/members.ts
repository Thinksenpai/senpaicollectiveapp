import { defineStore } from 'pinia'
import { ref } from 'vue'
import { membersApi } from '@/api'
import type { PublicMemberProfile, MemberFilters, Pagination, DashboardData } from '@/types'

export const useMembersStore = defineStore('members', () => {
  const members = ref<PublicMemberProfile[]>([])
  const currentMember = ref<PublicMemberProfile | null>(null)
  const dashboard = ref<DashboardData | null>(null)
  const pagination = ref<Pagination | null>(null)
  const filters = ref<MemberFilters>({
    limit: 20,
    offset: 0,
    sort_by: 'newest'
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchMembers(newFilters?: MemberFilters) {
    if (newFilters) {
      filters.value = { ...filters.value, ...newFilters }
    }

    loading.value = true
    error.value = null

    try {
      const response = await membersApi.getMembers(filters.value)
      console.log('Members API response:', response)
      if (response.status && response.data) {
        members.value = response.data
        pagination.value = response.pagination
        console.log('Members loaded:', members.value)
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch members'
    } finally {
      loading.value = false
    }
  }

  async function fetchMember(id: string) {
    // Clear previous member data immediately to prevent showing stale data
    currentMember.value = null
    loading.value = true
    error.value = null

    try {
      const response = await membersApi.getMember(id)
      console.log('Single member API response:', response)
      if (response.status && response.data) {
        const rawMember = response.data as any
        const profile = rawMember.profile

        // Normalize the data structure - flatten profile data into member
        const normalizedMember: PublicMemberProfile = {
          id: rawMember.id,
          full_name: rawMember.full_name || profile?.full_name || '',
          photo_url: rawMember.photo_url || profile?.photo_url,
          city: rawMember.city || profile?.city || '',
          country: rawMember.country || profile?.country || '',
          bio: rawMember.bio || profile?.bio || '',
          experience_level: rawMember.experience_level || profile?.experience_level || 'none',
          primary_skill: rawMember.primary_skill || profile?.primary_skill,
          skills: rawMember.skills || [],
          portfolio_url: rawMember.portfolio_url || profile?.portfolio_url || '',
          additional_links: rawMember.additional_links || profile?.additional_links,
          member_since: rawMember.created_at || rawMember.member_since || '',
          badges: rawMember.badges || [],
          want_to_learn: rawMember.want_to_learn || profile?.want_to_learn,
          can_teach: rawMember.can_teach || profile?.can_teach
        }

        currentMember.value = normalizedMember
        return normalizedMember
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch member'
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboard() {
    loading.value = true
    error.value = null

    try {
      const response = await membersApi.getDashboard()
      if (response.status && response.data) {
        dashboard.value = response.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch dashboard'
    } finally {
      loading.value = false
    }
  }

  function resetFilters() {
    filters.value = {
      limit: 20,
      offset: 0,
      sort_by: 'newest'
    }
  }

  function nextPage() {
    if (pagination.value?.has_next) {
      filters.value.offset = (filters.value.offset || 0) + (filters.value.limit || 20)
      fetchMembers()
    }
  }

  function prevPage() {
    if (pagination.value?.has_prev) {
      filters.value.offset = Math.max(0, (filters.value.offset || 0) - (filters.value.limit || 20))
      fetchMembers()
    }
  }

  return {
    members,
    currentMember,
    dashboard,
    pagination,
    filters,
    loading,
    error,
    fetchMembers,
    fetchMember,
    fetchDashboard,
    resetFilters,
    nextPage,
    prevPage
  }
})
