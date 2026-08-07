<script setup lang="ts">
import type { TaskAssignment } from '@/types'
import { CheckCircleIcon, ArrowUturnLeftIcon, StarIcon } from '@heroicons/vue/24/outline'

// Shared "who's on this task, what did they hand in, review it" list — used
// on the project page (one row per task, showing everyone's submission) and
// on the task detail page (the same list, for a single task in full). Full
// visibility across the team is the point: progress on a project depends on
// everyone being able to see and review each other's work, not just admins.
interface Props {
  assignments: TaskAssignment[]
  isOnTeam: boolean
  currentMemberId?: string
  reviewingId?: string | null
  canRate?: boolean // true when the current member is this task's named reviewer
}
const props = withDefaults(defineProps<Props>(), { reviewingId: null, canRate: false })
const emit = defineEmits<{
  review: [assignment: TaskAssignment, status: 'completed' | 'returned']
  rate: [assignment: TaskAssignment]
}>()

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

const assignmentCode: Record<string, { label: string; cls: string }> = {
  assigned: { label: 'ASSIGNED', cls: 'text-gray-400' },
  in_progress: { label: 'IN_PROGRESS', cls: 'text-amber-600' },
  submitted: { label: 'IN_REVIEW', cls: 'text-blue-600' },
  completed: { label: 'DONE', cls: 'text-senpai-700' },
  returned: { label: 'RETURNED', cls: 'text-red-500' }
}
</script>

<template>
  <ul class="divide-y divide-gray-100">
    <li v-for="a in props.assignments" :key="a.id" class="px-4 py-2.5">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-2 min-w-0">
          <span class="h-6 w-6 rounded-full overflow-hidden shrink-0 bg-gray-100">
            <img v-if="a.member?.profile?.photo_url" :src="a.member.profile.photo_url" :alt="a.member?.profile?.full_name" class="h-full w-full object-cover" />
            <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(a.member?.profile?.full_name || '?') }}</span>
          </span>
          <span class="text-sm text-gray-800 truncate">{{ a.member?.profile?.full_name || 'Member' }}</span>
        </div>
        <div class="flex items-center gap-2 shrink-0">
          <template v-if="a.status === 'submitted' && props.isOnTeam && a.member_id !== props.currentMemberId">
            <button
              class="inline-flex items-center gap-1 text-xs font-medium text-senpai-600 hover:text-senpai-700 disabled:opacity-50"
              :disabled="props.reviewingId === a.id"
              @click="emit('review', a, 'completed')"
            ><CheckCircleIcon class="h-3.5 w-3.5" /> Approve</button>
            <button
              class="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-700 disabled:opacity-50"
              :disabled="props.reviewingId === a.id"
              @click="emit('review', a, 'returned')"
            ><ArrowUturnLeftIcon class="h-3.5 w-3.5" /> Return</button>
          </template>
          <button
            v-if="a.status === 'completed' && props.canRate && a.member_id !== props.currentMemberId"
            class="inline-flex items-center gap-1 text-xs font-medium text-senpai-600 hover:text-senpai-700"
            @click="emit('rate', a)"
          ><StarIcon class="h-3.5 w-3.5" /> Rate</button>
          <span class="text-[10px] font-mono font-medium tracking-wide" :class="assignmentCode[a.status]?.cls">{{ assignmentCode[a.status]?.label }}</span>
        </div>
      </div>
      <!-- the hand-in, once submitted -->
      <div v-if="a.link_url || a.body || a.file_url" class="mt-1.5 ml-8 text-sm">
        <a v-if="a.link_url" :href="a.link_url" target="_blank" rel="noopener noreferrer" class="text-senpai-600 hover:underline break-all">{{ a.link_url }}</a>
        <a v-if="a.file_url" :href="a.file_url" target="_blank" rel="noopener noreferrer" class="text-senpai-600 hover:underline break-all block">{{ a.file_url }}</a>
        <p v-if="a.body" class="text-gray-600 whitespace-pre-wrap">{{ a.body }}</p>
      </div>
    </li>
  </ul>
</template>
