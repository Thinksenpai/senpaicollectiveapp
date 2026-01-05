<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
        <p class="mt-1 text-gray-600">Manage your account settings.</p>
      </div>

      <!-- Account Info -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div class="space-y-4">
          <div>
            <p class="text-sm text-gray-500">Email</p>
            <p class="font-medium text-gray-900">{{ authStore.member?.email }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Account Status</p>
            <p class="font-medium text-gray-900 capitalize">{{ authStore.member?.status }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Email Verified</p>
            <p class="font-medium text-gray-900">{{ authStore.member?.email_verified ? 'Yes' : 'No' }}</p>
          </div>
        </div>
      </div>

      <!-- Coming Soon -->
      <div class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
        <div class="flex items-center mb-3">
          <Cog6ToothIcon class="h-5 w-5 text-gray-400 mr-2" />
          <h2 class="text-lg font-semibold text-gray-900">More Settings Coming Soon</h2>
        </div>
        <ul class="text-sm text-gray-600 space-y-1">
          <li>- Password change</li>
          <li>- Email preferences</li>
          <li>- Privacy settings</li>
          <li>- Notification preferences</li>
        </ul>
      </div>

      <!-- Danger Zone -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Session</h2>
        <p class="text-sm text-gray-600 mb-4">
          Sign out of your account on this device.
        </p>
        <BaseButton variant="danger" @click="handleLogout">
          Sign Out
        </BaseButton>
      </div>
    </div>
  </AppLayout>
</template>
