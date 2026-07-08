<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Activity } from '@/types'
import { activityVerbPhrase, activityChip, activityLink, activityTimeAgo, activityInitials } from '@/utils/activity'

withDefaults(defineProps<{
  activities: Activity[]
  emptyText?: string
}>(), {
  emptyText: 'Nothing here yet.'
})
</script>

<template>
  <p v-if="!activities.length" class="text-sm text-gray-400">{{ emptyText }}</p>
  <ul v-else class="space-y-2.5">
    <li v-for="a in activities" :key="a.id" class="flex items-start gap-2.5 text-sm">
      <span class="h-6 w-6 rounded-full overflow-hidden shrink-0 bg-gray-100 mt-0.5">
        <img v-if="a.member?.profile?.photo_url" :src="a.member.profile.photo_url" :alt="a.member?.profile?.full_name" class="h-full w-full object-cover" />
        <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ activityInitials(a.member?.profile?.full_name || '?') }}</span>
      </span>
      <div class="min-w-0 flex-1">
        <p class="text-gray-700 leading-snug">
          <span class="font-medium text-gray-900">{{ a.member?.profile?.full_name || 'Someone' }}</span>
          {{ ' ' }}{{ activityVerbPhrase(a) }}
          <RouterLink v-if="activityChip(a) && activityLink(a)" :to="activityLink(a)!" class="text-senpai-600 hover:text-senpai-700 font-medium">{{ activityChip(a) }}</RouterLink>
          <span v-else-if="activityChip(a)" class="text-gray-600 font-medium">{{ activityChip(a) }}</span>
        </p>
        <p class="text-[11px] font-mono text-gray-400 mt-0.5">{{ activityTimeAgo(a.created_at) }}</p>
      </div>
    </li>
  </ul>
</template>
