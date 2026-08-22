<script setup lang="ts">
import type { TaskSubmission } from '@/types'
import { CheckCircleIcon, ArrowUturnLeftIcon, ClockIcon } from '@heroicons/vue/24/outline'

// Every attempt on one assignment. Resubmitting used to overwrite the previous
// hand-in and the note explaining what was wrong with it, so neither the member
// nor the reviewer could see what changed between attempts. Shown newest first.
interface Props {
  submissions: TaskSubmission[]
  // The latest attempt is already displayed in full by the parent, so the
  // history only needs to cover what came before it.
  hideLatest?: boolean
}
const props = withDefaults(defineProps<Props>(), { hideLatest: false })

const shown = () => {
  const ordered = [...props.submissions].sort((a, b) => b.attempt - a.attempt)
  return props.hideLatest ? ordered.slice(1) : ordered
}

function when(d: string) {
  return new Date(d).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })
}
</script>

<template>
  <div v-if="shown().length" class="space-y-2">
    <div
      v-for="s in shown()"
      :key="s.id"
      class="border border-gray-200 rounded-lg px-3 py-2 bg-white"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="text-[11px] font-mono uppercase tracking-wide text-gray-400">
          Attempt {{ s.attempt }} · {{ when(s.submitted_at) }}
        </span>
        <span
          v-if="s.outcome === 'completed'"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-green-700"
        ><CheckCircleIcon class="h-3.5 w-3.5" /> Approved</span>
        <span
          v-else-if="s.outcome === 'returned'"
          class="inline-flex items-center gap-1 text-[11px] font-medium text-red-600"
        ><ArrowUturnLeftIcon class="h-3.5 w-3.5" /> Returned</span>
        <span
          v-else
          class="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400"
        ><ClockIcon class="h-3.5 w-3.5" /> In review</span>
      </div>

      <div class="mt-1 text-sm">
        <a
          v-if="s.link_url"
          :href="s.link_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-senpai-600 hover:underline break-all"
        >{{ s.link_url }}</a>
        <a
          v-if="s.file_url"
          :href="s.file_url"
          target="_blank"
          rel="noopener noreferrer"
          class="text-senpai-600 hover:underline break-all block"
        >{{ s.file_url }}</a>
        <p v-if="s.body" class="text-gray-600 whitespace-pre-wrap">{{ s.body }}</p>
      </div>

      <!-- The feedback that prompted the next attempt. Keeping it beside the
           work it was written about is the point of the history. -->
      <p v-if="s.review_note" class="mt-1.5 text-xs text-gray-600 border-l-2 border-gray-200 pl-2">
        {{ s.review_note }}
        <span v-if="s.reviewer_name" class="text-gray-400">— {{ s.reviewer_name }}</span>
      </p>
    </div>
  </div>
</template>
