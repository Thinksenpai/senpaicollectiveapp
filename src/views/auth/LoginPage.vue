<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import { ClockIcon, KeyIcon } from '@heroicons/vue/24/outline'
import { startZitadelLogin } from '@/lib/oidc'

const router = useRouter()
const route = useRoute()

// Redirect to the Senpai ID hosted login (password / passkey / Google).
function handleZitadelLogin() {
  startZitadelLogin()
}
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const errors = ref<Record<string, string>>({})
const showPendingMessage = ref(false)

// Check if the error indicates pending approval
const isPendingError = computed(() => {
  const errorMsg = authStore.error?.toLowerCase() || ''
  return errorMsg.includes('pending') ||
         errorMsg.includes('awaiting') ||
         errorMsg.includes('approval') ||
         errorMsg.includes('not approved')
})

function validate(): boolean {
  errors.value = {}

  if (!form.value.email) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errors.value.email = 'Please enter a valid email'
  }

  if (!form.value.password) {
    errors.value.password = 'Password is required'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  showPendingMessage.value = false
  authStore.clearError()

  const result = await authStore.login({
    email: form.value.email,
    password: form.value.password
  })

  if (result.success) {
    // Check if user is pending approval
    if (authStore.isPending) {
      showPendingMessage.value = true
      authStore.logout()
      return
    }
    const redirect = route.query.redirect as string
    router.push(redirect || '/dashboard')
  } else if (isPendingError.value) {
    // Backend returned pending-related error
    showPendingMessage.value = true
    authStore.clearError()
  }
}
</script>

<template>
  <div class="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <RouterLink to="/" class="flex justify-center">
        <img src="/senpai_logo.svg" alt="Senpai" class="h-12 w-auto" />
      </RouterLink>
      <h2 class="mt-6 text-center text-2xl font-bold text-gray-900">
        Sign in to your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Not a member yet?
        <RouterLink to="/join" class="font-medium text-senpai-600 hover:text-senpai-500">
          Apply to join
        </RouterLink>
      </p>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <!-- Pending Approval Message -->
        <div v-if="showPendingMessage" class="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
          <div class="flex">
            <div class="flex-shrink-0">
              <ClockIcon class="h-6 w-6 text-amber-500" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-amber-800">Application Under Review</h3>
              <div class="mt-2 text-sm text-amber-700">
                <p>
                  Your application is currently being reviewed by our team. You'll receive an email once your account has been approved.
                </p>
                <p class="mt-2">
                  This usually takes 1-3 business days. Thank you for your patience!
                </p>
              </div>
            </div>
          </div>
        </div>

        <BaseAlert v-if="authStore.error && !isPendingError" type="error" class="mb-6" dismissible @dismiss="authStore.clearError">
          {{ authStore.error }}
        </BaseAlert>

        <!-- Senpai ID (central auth: password, passkey, Google) -->
        <button
          type="button"
          @click="handleZitadelLogin"
          :disabled="authStore.loading"
          class="w-full flex items-center justify-center gap-2 rounded-md bg-senpai-600 px-4 py-3 text-white font-medium shadow-sm hover:bg-senpai-700 disabled:opacity-60 transition-colors"
        >
          <KeyIcon class="h-5 w-5" />
          Continue with Senpai ID
        </button>

        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center" aria-hidden="true">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="bg-white px-2 text-gray-400">or sign in with email</span>
          </div>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <BaseInput
            v-model="form.email"
            type="email"
            label="Email address"
            placeholder="you@example.com"
            :error="errors.email"
            required
          />

          <BaseInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Enter your password"
            :error="errors.password"
            required
          />

          <div class="flex items-center justify-between">
            <div class="text-sm">
              <RouterLink to="/forgot-password" class="font-medium text-senpai-600 hover:text-senpai-500">
                Forgot your password?
              </RouterLink>
            </div>
          </div>

          <BaseButton
            type="submit"
            class="w-full"
            size="lg"
            :loading="authStore.loading"
          >
            Sign in
          </BaseButton>
        </form>
      </div>
    </div>
  </div>
</template>
