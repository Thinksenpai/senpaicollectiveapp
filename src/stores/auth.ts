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
  const isScout = computed(() => member.value?.roles?.some(r => r.name === 'scout') ?? false)
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
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    fetchCurrentMember,
    logout,
    clearError
  }
})
