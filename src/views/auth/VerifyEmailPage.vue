<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const authStore = useAuthStore()

const status = ref<'loading' | 'success' | 'error'>('loading')
const message = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    status.value = 'error'
    message.value = 'Invalid verification link. Please check your email for the correct link.'
    return
  }

  const result = await authStore.verifyEmail(token)

  if (result.success) {
    status.value = 'success'
    message.value = result.message || 'Your email has been verified successfully!'
  } else {
    status.value = 'error'
    message.value = result.error || 'Failed to verify email. The link may have expired.'
  }
})
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <RouterLink to="/" class="block text-center text-3xl font-bold text-indigo-600">Senpai</RouterLink>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
        Email Verification
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Loading State -->
        <div v-if="status === 'loading'" class="text-center py-8">
          <LoadingSpinner size="lg" class="mx-auto mb-4" />
          <p class="text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Email Verified!</h3>
          <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
          <div class="bg-indigo-50 rounded-lg p-4 mb-6 text-left">
            <h4 class="font-medium text-indigo-900 mb-2">What's next?</h4>
            <p class="text-sm text-indigo-700">
              Your application is now being reviewed by our team. You'll receive an email once a decision has been made.
            </p>
          </div>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Go to Login
          </RouterLink>
        </div>

        <!-- Error State -->
        <div v-else class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Verification Failed</h3>
          <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
          <div class="space-y-3">
            <RouterLink
              to="/login"
              class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Go to Login
            </RouterLink>
            <RouterLink
              to="/join"
              class="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
            >
              Register Again
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
