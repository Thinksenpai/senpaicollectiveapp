import apiClient from './client'
import type {
  ApiResponse,
  LoginCredentials,
  LoginResponse,
  RegisterData,
  RegisterResponse
} from '@/types'

export const authApi = {
  async register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post('/auth/register', data)
  },

  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials)
    if (response.status && response.data?.token) {
      apiClient.setToken(response.data.token)
    }
    return response
  },

  async verifyEmail(token: string): Promise<ApiResponse> {
    return apiClient.post('/auth/verify-email', { token })
  },

  async forgotPassword(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/forgot-password', { email })
  },

  async resetPassword(token: string, password: string, passwordConfirm: string): Promise<ApiResponse> {
    return apiClient.post('/auth/reset-password', {
      token,
      password,
      password_confirm: passwordConfirm
    })
  },

  logout() {
    apiClient.clearToken()
  }
}

export default authApi
