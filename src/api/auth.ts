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

  // Exchange a Zitadel ID token (obtained after the hosted-login redirect) for a
  // Senpai session token. The backend verifies the token and matches it to a member.
  async loginWithZitadel(idToken: string): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/zitadel', { id_token: idToken })
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

  // Issues a fresh verification link. The response is identical whether or not
  // the address is registered, so it cannot be used to enumerate members.
  async resendVerification(email: string): Promise<ApiResponse> {
    return apiClient.post('/auth/resend-verification', { email })
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
