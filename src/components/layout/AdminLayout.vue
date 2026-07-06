<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import AppLayout from './AppLayout.vue'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

// Shared shell for every /admin/* page — one place to change the admin
// sub-nav instead of each page rebuilding its own header. Tabs are grouped
// by real hierarchy: intake (applications), people (members, cohorts),
// work (tasks, jobs), then analytics.
//
// The back link is standardized here too, instead of every page hand-rolling
// its own (which is how it went inconsistent in the first place). List pages
// leave backTo/backLabel unset and get "Back to Overview"; detail pages
// (e.g. one application, one member) override both to point at their own
// list, since that's the more useful "back" from one level deeper.
interface Props {
  backTo?: string
  backLabel?: string
}
const props = withDefaults(defineProps<Props>(), {
  backTo: '/admin',
  backLabel: 'Back to Overview'
})

const route = useRoute()
const tabs = [
  { name: 'Overview', href: '/admin' },
  { name: 'Applications', href: '/admin/applications' },
  { name: 'Members', href: '/admin/members' },
  { name: 'Cohorts', href: '/admin/cohorts' },
  { name: 'Tasks', href: '/admin/tasks' },
  { name: 'Jobs', href: '/admin/jobs' },
  { name: 'Analytics', href: '/admin/analytics' }
]
function isActive(href: string) {
  if (href === '/admin') return route.path === '/admin'
  return route.path.startsWith(href)
}
</script>

<template>
  <AppLayout>
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav class="flex gap-1 overflow-x-auto -mb-px">
          <RouterLink
            v-for="tab in tabs"
            :key="tab.href"
            :to="tab.href"
            class="whitespace-nowrap px-3 py-3 text-sm font-medium border-b-2 transition-colors"
            :class="isActive(tab.href) ? 'border-senpai-600 text-senpai-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
          >
            {{ tab.name }}
          </RouterLink>
        </nav>
      </div>
    </div>
    <div v-if="route.path !== props.backTo" class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      <RouterLink :to="props.backTo" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ArrowLeftIcon class="h-4 w-4 mr-1" />
        {{ props.backLabel }}
      </RouterLink>
    </div>
    <slot />
  </AppLayout>
</template>
