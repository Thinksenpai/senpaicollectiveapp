<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { engineApi } from '@/api'
import type { TaskAssignment, AssignmentStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { RocketLaunchIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const tasks = ref<TaskAssignment[]>([])

onMounted(async () => {
  try {
    const res = await engineApi.getMyTasks()
    tasks.value = res.data ?? []
  } finally {
    loading.value = false
  }
})

const needsAttention = computed(() => tasks.value.filter((a) => a.status === 'assigned' || a.status === 'in_progress' || a.status === 'returned'))
const inReview = computed(() => tasks.value.filter((a) => a.status === 'submitted'))
const completed = computed(() => tasks.value.filter((a) => a.status === 'completed'))
const openCount = computed(() => needsAttention.value.length + inReview.value.length)

function isOverdue(a: TaskAssignment) {
  return !!a.task?.due_at && new Date(a.task.due_at) < new Date() && a.status !== 'completed'
}
function dueLabel(a: TaskAssignment): string {
  if (!a.task?.due_at) return ''
  const d = new Date(a.task.due_at)
  const label = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase()
  return isOverdue(a) ? `OVERDUE · ${label}` : `DUE ${label}`
}

const statusLabel: Record<AssignmentStatus, string> = {
  assigned: 'OPEN',
  in_progress: 'IN_PROGRESS',
  submitted: 'IN_REVIEW',
  completed: 'DONE',
  returned: 'RETURNED'
}
const statusDot: Record<AssignmentStatus, string> = {
  assigned: 'bg-gray-300',
  in_progress: 'bg-amber-400',
  submitted: 'bg-blue-400',
  completed: 'bg-senpai-500',
  returned: 'bg-red-400'
}
</script>

<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8 flex items-end justify-between gap-4">
        <div>
          <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">Work log</p>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">Your tasks</h1>
        </div>
        <p v-if="!loading && tasks.length" class="text-xs font-mono text-gray-400 shrink-0">{{ openCount }} OPEN · {{ completed.length }} DONE</p>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!tasks.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p class="text-sm text-gray-500">Nothing assigned yet — check back once your pod starts moving.</p>
      </div>

      <div v-else class="space-y-10">
        <section v-if="needsAttention.length">
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 px-1">// Needs attention</h2>
          <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <RouterLink
              v-for="a in needsAttention"
              :key="a.id"
              :to="`/tasks/${a.task_id}`"
              class="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <span class="h-2 w-2 rounded-full shrink-0 mt-2" :class="a.status === 'returned' ? 'bg-red-400' : statusDot[a.status]" />
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-2 flex-wrap">
                  <RocketLaunchIcon v-if="a.task?.project_id" class="h-3.5 w-3.5 text-senpai-500 shrink-0 mt-0.5" title="Project task" />
                  <p class="font-medium text-gray-900">{{ a.task?.title }}</p>
                  <span v-if="a.task?.is_required" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-600 shrink-0">REQUIRED</span>
                </div>
                <p class="text-[11px] font-mono text-gray-400 mt-0.5 uppercase tracking-wide">
                  {{ a.task?.project_id ? 'Project · ' : a.task?.program_id ? 'Induction · ' : '' }}{{ a.task?.kind }}
                </p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[11px] font-mono" :class="isOverdue(a) ? 'text-red-600 font-medium' : 'text-gray-400'">{{ dueLabel(a) || '—' }}</p>
                <p class="text-[10px] font-mono mt-1" :class="a.status === 'returned' ? 'text-red-500' : 'text-gray-400'">{{ statusLabel[a.status] }}</p>
              </div>
            </RouterLink>
          </div>
        </section>

        <section v-if="inReview.length">
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 px-1">// In review</h2>
          <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <RouterLink
              v-for="a in inReview"
              :key="a.id"
              :to="`/tasks/${a.task_id}`"
              class="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <span class="h-2 w-2 rounded-full shrink-0 bg-blue-400 mt-1.5" />
              <RocketLaunchIcon v-if="a.task?.project_id" class="h-3.5 w-3.5 text-senpai-500 shrink-0 mt-0.5" title="Project task" />
              <p class="font-medium text-gray-900 flex-1">{{ a.task?.title }}</p>
              <p class="text-[10px] font-mono text-blue-600 shrink-0 mt-0.5">IN_REVIEW</p>
            </RouterLink>
          </div>
        </section>

        <section v-if="completed.length">
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 px-1">// Completed</h2>
          <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <RouterLink
              v-for="a in completed"
              :key="a.id"
              :to="`/tasks/${a.task_id}`"
              class="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span class="h-2 w-2 rounded-full shrink-0 bg-senpai-500 mt-1.5" />
              <RocketLaunchIcon v-if="a.task?.project_id" class="h-3.5 w-3.5 text-senpai-400 shrink-0 mt-0.5" title="Project task" />
              <span class="text-sm text-gray-500 flex-1">{{ a.task?.title }}</span>
              <span class="text-[10px] font-mono text-gray-300 shrink-0 mt-0.5">DONE</span>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>
