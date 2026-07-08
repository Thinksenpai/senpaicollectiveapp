<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

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
    <div class="sm:mx-auto sm:w-full sm:max-w-md text-center">
      <RouterLink to="/" class="inline-flex items-center gap-2">
        <img src="/senpai_logo.svg" alt="Senpai Collective" class="h-10 w-auto" />
        <span class="text-xl font-bold text-gray-900">Senpai Collective</span>
      </RouterLink>
      <p class="mt-3 text-xs font-mono uppercase tracking-widest text-senpai-600">// Email verification</p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white rounded-2xl border border-gray-200 py-8 px-4 sm:px-10">
        <!-- Loading State -->
        <div v-if="status === 'loading'" class="text-center py-8">
          <LoadingSpinner size="lg" class="mx-auto mb-4" />
          <p class="text-gray-600">Verifying your email...</p>
        </div>

        <!-- Success State -->
        <div v-else-if="status === 'success'" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-senpai-50 mb-4">
            <CheckCircleIcon class="h-7 w-7 text-senpai-600" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Email verified</h3>
          <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
          <div class="bg-senpai-50 rounded-xl p-4 mb-6 text-left">
            <p class="text-[11px] font-mono uppercase tracking-widest text-senpai-700 mb-2">// What's next</p>
            <p class="text-sm text-senpai-800">
              Your application is now being reviewed by our team. You'll receive an email once a decision has been made.
            </p>
          </div>
          <RouterLink
            to="/login"
            class="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-senpai-600 hover:bg-senpai-700"
          >
            Go to login
          </RouterLink>
        </div>

        <!-- Error State -->
        <div v-else class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-50 mb-4">
            <XCircleIcon class="h-7 w-7 text-red-500" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Verification failed</h3>
          <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
          <div class="space-y-3">
            <RouterLink
              to="/login"
              class="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-senpai-600 hover:bg-senpai-700"
            >
              Go to login
            </RouterLink>
            <RouterLink
              to="/join"
              class="block w-full text-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Register again
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
