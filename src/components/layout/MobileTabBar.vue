<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  RocketLaunchIcon,
  UsersIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ChartBarSquareIcon,
  ChartBarIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const moreOpen = ref(false)

function closeMore() {
  moreOpen.value = false
}

function handleLogout() {
  closeMore()
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <nav
    v-if="authStore.isAuthenticated"
    class="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 sm:hidden pb-[env(safe-area-inset-bottom)]"
  >
    <div class="grid grid-cols-5 h-16">
      <RouterLink
        to="/dashboard"
        class="flex flex-col items-center justify-center gap-0.5 text-gray-500"
        active-class="!text-senpai-600"
      >
        <HomeIcon class="h-6 w-6" />
        <span class="text-[11px] font-medium">Home</span>
      </RouterLink>
      <template v-if="authStore.isApproved">
        <RouterLink
          to="/tasks"
          class="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          active-class="!text-senpai-600"
        >
          <ClipboardDocumentListIcon class="h-6 w-6" />
          <span class="text-[11px] font-medium">Tasks</span>
        </RouterLink>
        <RouterLink
          to="/projects"
          class="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          active-class="!text-senpai-600"
        >
          <RocketLaunchIcon class="h-6 w-6" />
          <span class="text-[11px] font-medium">Projects</span>
        </RouterLink>
        <RouterLink
          to="/members"
          class="flex flex-col items-center justify-center gap-0.5 text-gray-500"
          active-class="!text-senpai-600"
        >
          <UsersIcon class="h-6 w-6" />
          <span class="text-[11px] font-medium">Directory</span>
        </RouterLink>
      </template>
      <button
        type="button"
        class="flex flex-col items-center justify-center gap-0.5 text-gray-500"
        :class="{ 'col-span-4': !authStore.isApproved }"
        @click="moreOpen = true"
      >
        <Bars3Icon class="h-6 w-6" />
        <span class="text-[11px] font-medium">More</span>
      </button>
    </div>
  </nav>

  <!-- More sheet: everything that doesn't fit in the tab bar -->
  <Teleport to="body">
    <div v-if="moreOpen" class="fixed inset-0 z-50 sm:hidden">
      <div class="fixed inset-0 bg-black/50" @click="closeMore" />
      <div class="fixed bottom-0 inset-x-0 bg-white rounded-t-2xl shadow-2xl max-h-[80vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
        <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span class="text-sm font-semibold text-gray-900">Menu</span>
          <button type="button" class="p-1 text-gray-400" @click="closeMore">
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>
        <div class="py-2">
          <RouterLink to="/profile" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
            <UserCircleIcon class="h-5 w-5 mr-3 text-gray-400" />
            Your Profile
          </RouterLink>
          <template v-if="authStore.isApproved">
            <RouterLink to="/jobs" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
              <BriefcaseIcon class="h-5 w-5 mr-3 text-gray-400" />
              Jobs
            </RouterLink>
            <RouterLink to="/my-applications" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
              <DocumentTextIcon class="h-5 w-5 mr-3 text-gray-400" />
              My Applications
            </RouterLink>
            <RouterLink to="/assigned-jobs" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
              <ClipboardDocumentListIcon class="h-5 w-5 mr-3 text-gray-400" />
              Assigned Jobs
            </RouterLink>
            <RouterLink to="/performance" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
              <ChartBarSquareIcon class="h-5 w-5 mr-3 text-gray-400" />
              Performance
            </RouterLink>
            <RouterLink to="/scout/guide" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
              <SparklesIcon class="h-5 w-5 mr-3 text-gray-400" />
              Scout Guide
            </RouterLink>
          </template>
          <RouterLink v-if="authStore.isScout" to="/scout" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
            <UsersIcon class="h-5 w-5 mr-3 text-gray-400" />
            Scout Dashboard
          </RouterLink>
          <RouterLink v-if="authStore.isAdmin" to="/admin" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
            <ChartBarIcon class="h-5 w-5 mr-3 text-gray-400" />
            Admin
          </RouterLink>
          <RouterLink v-else-if="authStore.isCommunityLead" to="/admin/applications" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
            <ChartBarIcon class="h-5 w-5 mr-3 text-gray-400" />
            Applications
          </RouterLink>
          <RouterLink to="/settings" class="flex items-center px-4 py-3 text-sm text-gray-700" @click="closeMore">
            <Cog6ToothIcon class="h-5 w-5 mr-3 text-gray-400" />
            Settings
          </RouterLink>
          <button type="button" class="flex w-full items-center px-4 py-3 text-sm text-gray-700" @click="handleLogout">
            <ArrowRightOnRectangleIcon class="h-5 w-5 mr-3 text-gray-400" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
