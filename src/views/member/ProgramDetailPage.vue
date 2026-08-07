<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { engineApi } from '@/api'
import type { Program, Task, TaskAssignment } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { CheckCircleIcon, ArrowLeftIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const programId = computed(() => route.params.id as string)

const loading = ref(true)
const program = ref<Program | null>(null)
const tasks = ref<Task[]>([])
const myAssignments = ref<TaskAssignment[]>([])
const claiming = ref<string | null>(null)
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

async function load() {
  loading.value = true
  try {
    const [progRes, mineRes] = await Promise.all([
      engineApi.getProgram(programId.value),
      engineApi.getMyTasks()
    ])
    program.value = progRes.data?.program ?? null
    tasks.value = progRes.data?.tasks ?? []
    myAssignments.value = mineRes.data ?? []
  } finally {
    loading.value = false
  }
}
onMounted(load)

function assignmentFor(taskId: string): TaskAssignment | undefined {
  return myAssignments.value.find((a) => a.task_id === taskId)
}

const completedCount = computed(() =>
  tasks.value.filter((t) => assignmentFor(t.id)?.status === 'completed').length
)
const progressPct = computed(() =>
  tasks.value.length ? Math.round((completedCount.value / tasks.value.length) * 100) : 0
)
const isComplete = computed(() => tasks.value.length > 0 && completedCount.value === tasks.value.length)

const statusLabel: Record<string, string> = {
  assigned: 'OPEN', in_progress: 'IN_PROGRESS', submitted: 'IN_REVIEW', completed: 'DONE', returned: 'RETURNED'
}

async function claim(task: Task) {
  claiming.value = task.id
  try {
    await engineApi.claimTask(task.id)
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Could not claim this task')
  } finally {
    claiming.value = null
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterLink to="/programs" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon class="h-4 w-4 mr-1" /> Back to programs
      </RouterLink>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!program" class="text-center py-16">
        <p class="text-gray-500">This program doesn't exist.</p>
      </div>

      <div v-else class="space-y-6">
        <section>
          <p class="text-[11px] font-mono uppercase tracking-widest text-senpai-600">
            {{ program.circle ? `${program.circle} circle track` : 'program' }}
          </p>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ program.name }}</h1>
          <p v-if="program.description" class="text-sm text-gray-600 mt-2 leading-relaxed">{{ program.description }}</p>

          <div v-if="tasks.length" class="mt-4">
            <div class="flex items-center justify-between text-[11px] font-mono text-gray-400 mb-1">
              <span>{{ completedCount }} / {{ tasks.length }} DONE</span>
              <span v-if="isComplete" class="text-senpai-700 font-medium inline-flex items-center gap-1">
                <CheckCircleIcon class="h-3.5 w-3.5" /> COMPLETE
              </span>
            </div>
            <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-senpai-500 transition-all" :style="{ width: `${progressPct}%` }" />
            </div>
          </div>
        </section>

        <section class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
          <div v-for="(t, i) in tasks" :key="t.id" class="flex items-center gap-3 px-4 py-3.5">
            <span class="text-xs font-mono text-gray-300 w-5 shrink-0">{{ i + 1 }}</span>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-900">{{ t.title }}</p>
              <p class="text-[11px] font-mono text-gray-400 mt-0.5 uppercase">{{ t.kind }}</p>
            </div>
            <template v-if="assignmentFor(t.id)">
              <RouterLink :to="`/tasks/${t.id}`" class="text-[11px] font-mono px-2 py-1 rounded bg-gray-100 text-gray-500 shrink-0">
                {{ statusLabel[assignmentFor(t.id)!.status] }}
              </RouterLink>
            </template>
            <button
              v-else
              class="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97] disabled:opacity-50"
              :disabled="claiming === t.id"
              @click="claim(t)"
            >
              {{ claiming === t.id ? 'Claiming…' : 'Start' }}
            </button>
          </div>
          <div v-if="!tasks.length" class="px-4 py-8 text-center text-sm text-gray-500">
            No tasks in this program yet.
          </div>
        </section>
      </div>

      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </div>
  </AppLayout>
</template>
