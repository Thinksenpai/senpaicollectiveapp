<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { Cog6ToothIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const initials = computed(() => {
  const name = authStore.member?.profile?.full_name?.trim()
  if (!name) return '?'
  const parts = name.split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase()
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8 flex items-center gap-4">
        <span class="h-14 w-14 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2 ring-gray-100">
          <img v-if="authStore.member?.profile?.photo_url" :src="authStore.member.profile.photo_url" :alt="authStore.member.profile.full_name" class="h-full w-full object-cover" />
          <span v-else class="h-full w-full flex items-center justify-center text-sm font-medium text-gray-500">{{ initials }}</span>
        </span>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
          <p class="mt-1 text-gray-600">Manage your account settings.</p>
        </div>
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
