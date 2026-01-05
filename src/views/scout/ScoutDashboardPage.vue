<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import {
  LinkIcon,
  ClipboardDocumentIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const copied = ref(false)
const inviteLink = computed(() => {
  const code = authStore.member?.scout?.invite_code || 'XXXXXX'
  return `${window.location.origin}/join?ref=${code}`
})

function copyLink() {
  navigator.clipboard.writeText(inviteLink.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

// Mock data for scout stats (in real app, this would come from API)
const stats = ref({
  total_invites: 12,
  approved: 8,
  pending: 3,
  declined: 1
})

const recentInvites = ref([
  { name: 'Jane Smith', status: 'approved', date: '2025-12-28' },
  { name: 'John Doe', status: 'pending', date: '2025-12-30' },
  { name: 'Alice Johnson', status: 'approved', date: '2025-12-25' }
])

const statusIcons = {
  approved: CheckCircleIcon,
  pending: ClockIcon,
  declined: XCircleIcon
}

const statusColors = {
  approved: 'text-green-500',
  pending: 'text-yellow-500',
  declined: 'text-red-500'
}

const statusBadgeColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  declined: 'bg-red-100 text-red-800'
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center">
          <SparklesIcon class="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Scout Dashboard</h1>
            <p class="text-gray-600">Invite talented creatives to join the Senpai community.</p>
          </div>
        </div>
      </div>

      <!-- Invite Link Card -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 mb-8 text-white">
        <h2 class="font-semibold mb-2">Your Invite Link</h2>
        <p class="text-indigo-100 text-sm mb-4">
          Share this link with people you'd like to invite to Senpai.
        </p>
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 bg-white/20 rounded-lg px-4 py-3 font-mono text-sm truncate">
            {{ inviteLink }}
          </div>
          <BaseButton
            variant="secondary"
            @click="copyLink"
            class="flex-shrink-0"
          >
            <ClipboardDocumentIcon class="h-5 w-5 mr-2" />
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </BaseButton>
        </div>
        <p class="text-indigo-200 text-xs mt-3">
          Your invite code: <span class="font-mono font-bold">{{ authStore.member?.scout?.invite_code || 'XXXXXX' }}</span>
        </p>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <UserGroupIcon class="h-8 w-8 text-gray-400" />
            <div class="ml-3">
              <p class="text-2xl font-bold text-gray-900">{{ stats.total_invites }}</p>
              <p class="text-sm text-gray-500">Total Invites</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <CheckCircleIcon class="h-8 w-8 text-green-500" />
            <div class="ml-3">
              <p class="text-2xl font-bold text-gray-900">{{ stats.approved }}</p>
              <p class="text-sm text-gray-500">Approved</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <ClockIcon class="h-8 w-8 text-yellow-500" />
            <div class="ml-3">
              <p class="text-2xl font-bold text-gray-900">{{ stats.pending }}</p>
              <p class="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center">
            <XCircleIcon class="h-8 w-8 text-red-500" />
            <div class="ml-3">
              <p class="text-2xl font-bold text-gray-900">{{ stats.declined }}</p>
              <p class="text-sm text-gray-500">Declined</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Scout Score -->
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Scout Score</h2>
          <span class="text-2xl font-bold text-indigo-600">
            {{ authStore.member?.scout?.score || 0 }}
          </span>
        </div>
        <p class="text-sm text-gray-600 mb-4">
          Your scout score is calculated based on the quality and approval rate of your invites.
          Higher scores unlock more benefits!
        </p>
        <div class="w-full bg-gray-200 rounded-full h-3">
          <div
            class="bg-indigo-600 h-3 rounded-full transition-all duration-500"
            :style="{ width: `${Math.min((authStore.member?.scout?.score || 0), 100)}%` }"
          />
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      <!-- Recent Invites -->
      <div class="bg-white rounded-lg shadow-sm">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Recent Invites</h2>
        </div>

        <div v-if="recentInvites.length === 0" class="p-6 text-center text-gray-500">
          No invites yet. Share your link to start inviting!
        </div>

        <ul v-else class="divide-y divide-gray-200">
          <li
            v-for="invite in recentInvites"
            :key="invite.name"
            class="p-4 flex items-center justify-between"
          >
            <div class="flex items-center">
              <component
                :is="statusIcons[invite.status as keyof typeof statusIcons]"
                :class="['h-5 w-5 mr-3', statusColors[invite.status as keyof typeof statusColors]]"
              />
              <div>
                <p class="font-medium text-gray-900">{{ invite.name }}</p>
                <p class="text-sm text-gray-500">{{ new Date(invite.date).toLocaleDateString() }}</p>
              </div>
            </div>
            <span
              :class="[
                'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize',
                statusBadgeColors[invite.status as keyof typeof statusBadgeColors]
              ]"
            >
              {{ invite.status }}
            </span>
          </li>
        </ul>
      </div>

      <!-- Tips -->
      <div class="mt-8 bg-indigo-50 rounded-lg p-6">
        <h3 class="font-semibold text-indigo-900 mb-3">Tips for Successful Recruiting</h3>
        <ul class="text-sm text-indigo-700 space-y-2">
          <li class="flex items-start">
            <CheckCircleIcon class="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
            Invite creatives whose work you've personally seen and admire
          </li>
          <li class="flex items-start">
            <CheckCircleIcon class="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
            Focus on quality over quantity - your score reflects this
          </li>
          <li class="flex items-start">
            <CheckCircleIcon class="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
            Encourage invitees to complete their profiles thoroughly
          </li>
          <li class="flex items-start">
            <CheckCircleIcon class="h-5 w-5 mr-2 flex-shrink-0 text-indigo-500" />
            Share the link via DM for a more personal touch
          </li>
        </ul>
      </div>
    </div>
  </AppLayout>
</template>
