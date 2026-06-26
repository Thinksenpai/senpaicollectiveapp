import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api'
import { membersApi } from '@/api'
import type { Member, LoginCredentials, RegisterData } from '@/types'
import { apiClient } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const member = ref<Member | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!member.value && !!apiClient.getToken())
  const isAdmin = computed(() => member.value?.roles?.some(r => r.name === 'admin') ?? false)
  const isScout = computed(() => {
    // Check both roles array and scout object
    const hasScoutRole = member.value?.roles?.some(r => r.name === 'scout') ?? false
    const hasScoutObject = member.value?.scout != null
    return hasScoutRole || hasScoutObject
  })
  const isApproved = computed(() => member.value?.status === 'approved')
  const isPending = computed(() => member.value?.status === 'pending')

  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.login(credentials)
      if (response.status && response.data) {
        member.value = response.data.member
        return { success: true }
      } else {
        error.value = response.message || 'Login failed'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Exchange a verified Zitadel identity for a Senpai session. On a 403 the
  // backend tells us *why* (no membership / pending approval) via `reason` so
  // the callback page can route the user appropriately.
  async function loginWithZitadel(idToken: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.loginWithZitadel(idToken)
      if (response.status && response.data) {
        member.value = response.data.member
        return { success: true as const }
      }
      error.value = response.message || 'Login failed'
      return { success: false as const, reason: (response.data as any)?.reason as string | undefined }
    } catch (e: any) {
      const body = e.response?.data
      error.value = body?.message || e.message || 'Login failed'
      return {
        success: false as const,
        reason: body?.data?.reason as string | undefined,
        email: body?.data?.email as string | undefined,
        name: body?.data?.name as string | undefined,
      }
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterData) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.register(data)
      if (response.status) {
        return { success: true, data: response.data }
      } else {
        error.value = response.message || 'Registration failed'
        return { success: false, error: error.value }
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function verifyEmail(token: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.verifyEmail(token)
      return { success: response.status, message: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Verification failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function forgotPassword(email: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.forgotPassword(email)
      return { success: response.status, message: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Request failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function resetPassword(token: string, password: string, passwordConfirm: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authApi.resetPassword(token, password, passwordConfirm)
      return { success: response.status, message: response.message }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Reset failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  async function fetchCurrentMember() {
    if (!apiClient.getToken()) return

    loading.value = true
    try {
      const response = await membersApi.getMe()
      if (response.status && response.data) {
        member.value = response.data
      }
    } catch (e) {
      // Token might be invalid
      logout()
    } finally {
      loading.value = false
    }
  }

  function logout() {
    authApi.logout()
    member.value = null
  }

  function clearError() {
    error.value = null
  }

  return {
    member,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    isScout,
    isApproved,
    isPending,
    login,
    loginWithZitadel,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    fetchCurrentMember,
    logout,
    clearError
  }
})
