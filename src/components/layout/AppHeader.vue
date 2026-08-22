<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Disclosure,
  DisclosureButton,
  DisclosurePanel
} from '@headlessui/vue'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowPathRoundedSquareIcon,
  ChartBarSquareIcon,
  SparklesIcon,
  RocketLaunchIcon,
  EnvelopeIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const navigation = ref([
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, requiresAuth: true },
  { name: 'Tasks', href: '/tasks', icon: ClipboardDocumentListIcon, requiresAuth: true, requiresApproved: true },
  { name: 'Projects', href: '/projects', icon: RocketLaunchIcon, requiresAuth: true, requiresApproved: true },
  { name: 'Circles', href: '/circles', icon: ArrowPathRoundedSquareIcon, requiresAuth: true, requiresApproved: true },
  { name: 'Directory', href: '/members', icon: UsersIcon, requiresAuth: true, requiresApproved: true },
  { name: 'Jobs', href: '/jobs', icon: BriefcaseIcon, requiresAuth: true, requiresApproved: true }
])

const jobNavigation = ref([
  { name: 'My Applications', href: '/my-applications', icon: DocumentTextIcon },
  { name: 'Assigned Jobs', href: '/assigned-jobs', icon: ClipboardDocumentListIcon },
  { name: 'Performance', href: '/performance', icon: ChartBarSquareIcon }
])

// Cohorts, Tasks, Members, etc. all live inside /admin now, under AdminLayout's
// own sub-nav — the top-level bar only needs the one entry point.
const adminNavigation = ref([
  { name: 'Admin', href: '/admin', icon: ChartBarIcon }
])

const scoutNavigation = ref([
  { name: 'Scout', href: '/scout', icon: SparklesIcon }
])

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <Disclosure as="nav" class="bg-white shadow-sm" v-slot="{ open }">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <div class="flex flex-shrink-0 items-center">
            <RouterLink to="/" class="flex items-center">
              <img src="/senpai_logo.svg" alt="Senpai" class="h-8 w-auto" />
            </RouterLink>
          </div>
          <div class="hidden sm:ml-8 sm:flex sm:space-x-4">
            <template v-for="item in navigation" :key="item.name">
              <RouterLink
                v-if="!item.requiresAuth || authStore.isAuthenticated"
                v-show="!item.requiresApproved || authStore.isApproved"
                :to="item.href"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-senpai-600 rounded-md hover:bg-senpai-50"
                active-class="text-senpai-600 bg-senpai-50"
              >
                <component :is="item.icon" class="h-5 w-5 mr-1.5" />
                {{ item.name }}
              </RouterLink>
            </template>
            <template v-if="authStore.isScout">
              <RouterLink
                v-for="item in scoutNavigation"
                :key="item.name"
                :to="item.href"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-senpai-600 rounded-md hover:bg-senpai-50"
                active-class="text-senpai-600 bg-senpai-50"
              >
                <component :is="item.icon" class="h-5 w-5 mr-1.5" />
                {{ item.name }}
              </RouterLink>
            </template>
            <template v-if="authStore.isAdmin">
              <RouterLink
                v-for="item in adminNavigation"
                :key="item.name"
                :to="item.href"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-senpai-600 rounded-md hover:bg-senpai-50"
                active-class="text-senpai-600 bg-senpai-50"
              >
                <component :is="item.icon" class="h-5 w-5 mr-1.5" />
                {{ item.name }}
              </RouterLink>
            </template>
            <!-- Community leads don't get the full /admin dashboard — send them
                 straight to the one thing they're delegated: applications. -->
            <template v-else-if="authStore.isCommunityLead">
              <RouterLink
                to="/admin/applications"
                class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-senpai-600 rounded-md hover:bg-senpai-50"
                active-class="text-senpai-600 bg-senpai-50"
              >
                <ChartBarIcon class="h-5 w-5 mr-1.5" />
                Applications
              </RouterLink>
            </template>
          </div>
        </div>

        <div class="hidden sm:ml-6 sm:flex sm:items-center">
          <template v-if="authStore.isAuthenticated">
            <Menu as="div" class="relative ml-3">
              <MenuButton class="flex items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500 focus:ring-offset-2">
                <span class="sr-only">Open user menu</span>
                <div class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                  <span class="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-1 ring-gray-200">
                    <img v-if="authStore.member?.profile?.photo_url" :src="authStore.member.profile.photo_url" :alt="authStore.member.profile.full_name" class="h-full w-full object-cover" />
                    <UserCircleIcon v-else class="h-8 w-8 text-gray-400" />
                  </span>
                  <span class="text-sm font-medium text-gray-700">
                    {{ authStore.member?.profile?.full_name || 'Member' }}
                  </span>
                </div>
              </MenuButton>

              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/profile"
                      :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <span class="h-5 w-5 rounded-full overflow-hidden shrink-0 bg-gray-100 mr-2">
                        <img v-if="authStore.member?.profile?.photo_url" :src="authStore.member.profile.photo_url" :alt="authStore.member.profile.full_name" class="h-full w-full object-cover" />
                        <UserCircleIcon v-else class="h-5 w-5 text-gray-400" />
                      </span>
                      Your Profile
                    </RouterLink>
                  </MenuItem>
                  <template v-if="authStore.isApproved">
                    <MenuItem v-for="item in jobNavigation" :key="item.name" v-slot="{ active }">
                      <RouterLink
                        :to="item.href"
                        :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                      >
                        <component :is="item.icon" class="h-5 w-5 mr-2 text-gray-400" />
                        {{ item.name }}
                      </RouterLink>
                    </MenuItem>
                  </template>
                  <MenuItem v-if="authStore.isScout" v-slot="{ active }">
                    <RouterLink
                      to="/scout"
                      :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <UsersIcon class="h-5 w-5 mr-2 text-gray-400" />
                      Scout Dashboard
                    </RouterLink>
                  </MenuItem>
                  <!-- Every approved member can reach the guide, scout or not — it's
                       also where the "apply to be a scout" CTA lives. -->
                  <MenuItem v-if="authStore.isApproved" v-slot="{ active }">
                    <RouterLink
                      to="/scout/guide"
                      :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <SparklesIcon class="h-5 w-5 mr-2 text-gray-400" />
                      Scout Guide
                    </RouterLink>
                  </MenuItem>
                  <MenuItem v-if="authStore.isApproved" v-slot="{ active }">
                    <RouterLink
                      to="/invites"
                      :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <EnvelopeIcon class="h-5 w-5 mr-2 text-gray-400" />
                      My Invites
                    </RouterLink>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <RouterLink
                      to="/settings"
                      :class="[active ? 'bg-gray-100' : '', 'flex items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <Cog6ToothIcon class="h-5 w-5 mr-2 text-gray-400" />
                      Settings
                    </RouterLink>
                  </MenuItem>
                  <MenuItem v-slot="{ active }">
                    <button
                      @click="handleLogout"
                      :class="[active ? 'bg-gray-100' : '', 'flex w-full items-center px-4 py-2 text-sm text-gray-700']"
                    >
                      <ArrowRightOnRectangleIcon class="h-5 w-5 mr-2 text-gray-400" />
                      Sign out
                    </button>
                  </MenuItem>
                </MenuItems>
              </transition>
            </Menu>
          </template>
          <template v-else>
            <RouterLink
              to="/login"
              class="text-sm font-medium text-gray-700 hover:text-senpai-600"
            >
              Sign in
            </RouterLink>
            <RouterLink
              to="/join"
              class="ml-4 inline-flex items-center rounded-md bg-senpai-500 px-4 py-2 text-sm font-medium text-white hover:bg-senpai-600"
            >
              Join Now
            </RouterLink>
          </template>
        </div>

        <!-- Logged-in mobile nav lives in the bottom tab bar (MobileTabBar) —
             this disclosure is only needed for the logged-out "Apply" panel. -->
        <div v-if="!authStore.isAuthenticated" class="-mr-2 flex items-center sm:hidden">
          <DisclosureButton class="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500">
            <span class="sr-only">Open main menu</span>
            <Bars3Icon v-if="!open" class="block h-6 w-6" />
            <XMarkIcon v-else class="block h-6 w-6" />
          </DisclosureButton>
        </div>
      </div>
    </div>

    <DisclosurePanel class="sm:hidden">
      <div v-if="!authStore.isAuthenticated" class="border-t border-gray-200 pb-3 pt-4">
        <div class="px-4">
          <RouterLink
            to="/join"
            class="flex w-full items-center justify-center rounded-md bg-senpai-500 px-4 py-3 text-base font-medium text-white hover:bg-senpai-600"
          >
            Apply to Join
          </RouterLink>
        </div>
      </div>
    </DisclosurePanel>
  </Disclosure>
</template>
