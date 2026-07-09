<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const email = ref('')
const emailError = ref('')
const submitted = ref(false)

function validate(): boolean {
  emailError.value = ''

  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    emailError.value = 'Please enter a valid email'
    return false
  }

  return true
}

async function handleSubmit() {
  if (!validate()) return

  authStore.clearError()
  const result = await authStore.forgotPassword(email.value)

  if (result.success) {
    submitted.value = true
  }
}
</script>

<template>
  <div class="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <RouterLink
      to="/login"
      class="fixed top-4 left-4 sm:top-6 sm:left-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 transition-colors z-10"
    >
      <ArrowLeftIcon class="h-4 w-4" />
      Back
    </RouterLink>
    <RouterLink
      to="/"
      aria-label="Close"
      class="fixed top-4 right-4 sm:top-6 sm:right-6 text-gray-300 hover:text-gray-500 transition-colors z-10"
    >
      <XMarkIcon class="h-6 w-6" />
    </RouterLink>

    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <RouterLink to="/" class="flex justify-center">
        <img src="/senpai_logo.svg" alt="Senpai" class="h-12 w-auto" />
      </RouterLink>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
        Reset your password
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Remember your password?
        <RouterLink to="/login" class="font-medium text-senpai-600 hover:text-senpai-500">
          Sign in
        </RouterLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Success State -->
        <div v-if="submitted" class="text-center">
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">Check your email</h3>
          <p class="text-sm text-gray-600 mb-6">
            If an account exists for {{ email }}, you'll receive a password reset link shortly.
          </p>
          <RouterLink to="/login" class="text-senpai-600 hover:text-senpai-500 font-medium">
            Return to login
          </RouterLink>
        </div>

        <!-- Form State -->
        <div v-else>
          <BaseAlert v-if="authStore.error" type="error" class="mb-6" dismissible @dismiss="authStore.clearError">
            {{ authStore.error }}
          </BaseAlert>

          <p class="text-sm text-gray-600 mb-6">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <BaseInput
              v-model="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              :error="emailError"
              required
            />

            <BaseButton
              type="submit"
              class="w-full"
              size="lg"
              :loading="authStore.loading"
            >
              Send reset link
            </BaseButton>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>
