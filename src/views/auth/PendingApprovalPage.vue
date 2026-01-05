<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const authStore = useAuthStore()

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg class="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-900 mb-2">Application Under Review</h1>
        <p class="text-gray-600">
          Your application is being reviewed by our team. We'll notify you by email once a decision has been made.
        </p>
      </div>

      <!-- While You Wait Section -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h3 class="font-semibold text-gray-900 mb-4">While you wait, prepare yourself...</h3>
        <p class="text-gray-600 text-sm mb-4">
          Use this time to internalize what it means to be part of Senpai. When you're approved,
          you'll join a movement of African creatives committed to growth, excellence, and lifting each other up.
        </p>
        <ul class="space-y-3 text-sm text-gray-600">
          <li class="flex items-start">
            <svg class="h-5 w-5 text-senpai-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Make sure your portfolio is up to date and represents your best work
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-senpai-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Think about how you can contribute to the community once approved
          </li>
          <li class="flex items-start">
            <svg class="h-5 w-5 text-senpai-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Check your email (including spam folder) for updates
          </li>
        </ul>
      </div>

      <!-- The Creed -->
      <div class="bg-senpai-50 rounded-xl p-6 mb-6 border border-senpai-100">
        <h3 class="font-semibold text-senpai-900 mb-4 flex items-center">
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          </svg>
          The Senpai Creed
        </h3>
        <p class="text-sm text-senpai-700 mb-4">Memorize this. It's who we are.</p>
        <div class="space-y-2">
          <p
            v-for="(line, index) in SENPAI_MANIFESTO.creed"
            :key="index"
            class="text-senpai-800 font-medium"
            :class="{ 'text-lg': index === 0 || index === SENPAI_MANIFESTO.creed.length - 1 }"
          >
            {{ line }}
          </p>
        </div>
      </div>

      <!-- Core Values -->
      <div class="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div class="flex items-center gap-3 mb-4">
          <img src="/corevalues.svg" alt="Core Values" class="h-8 w-auto" />
          <h3 class="font-semibold text-gray-900">Our Six Core Values</h3>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div
            v-for="(value, index) in SENPAI_MANIFESTO.values"
            :key="value.name"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex items-center mb-2">
              <span class="w-5 h-5 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center text-xs font-bold mr-2">
                {{ index + 1 }}
              </span>
              <h4 class="font-semibold text-gray-900 text-sm">{{ value.name }}</h4>
            </div>
            <p class="text-xs text-gray-500 italic">"{{ value.insight }}"</p>
          </div>
        </div>
      </div>

      <!-- Reflection Prompt -->
      <div class="bg-gray-900 rounded-xl p-6 mb-6 text-center">
        <h3 class="text-white font-semibold mb-2">Reflect While You Wait</h3>
        <p class="text-gray-300 text-sm mb-4">
          When you're approved, how will you contribute to the collective? What value will you bring?
          Who will you help? Think about this now, so you're ready to act.
        </p>
        <div class="flex flex-wrap justify-center gap-2">
          <span class="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Mentor someone</span>
          <span class="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Share resources</span>
          <span class="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Give feedback</span>
          <span class="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300">Make introductions</span>
        </div>
      </div>

      <!-- Account Info -->
      <div class="text-center space-y-3">
        <p class="text-sm text-gray-500">
          Logged in as <span class="font-medium">{{ authStore.member?.email }}</span>
        </p>
        <p class="text-xs text-gray-400">
          Expect to hear from us within 2-3 business days.
        </p>
        <BaseButton variant="outline" @click="handleLogout">
          Sign out
        </BaseButton>
      </div>
    </div>
  </div>
</template>
