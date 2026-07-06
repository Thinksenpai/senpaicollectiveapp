<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { engineApi } from '@/api'
import type { TaskAssignment, TaskComment, AssignmentComment, TaskPeerStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import {
  ArrowLeftIcon, ArrowTopRightOnSquareIcon, CheckCircleIcon, UserCircleIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const taskId = computed(() => route.params.id as string)

const loading = ref(true)
const assignment = ref<TaskAssignment | null>(null)
const peers = ref<TaskPeerStatus[]>([])
const taskComments = ref<TaskComment[]>([])
const assignmentComments = ref<AssignmentComment[]>([])

const draft = reactive({ link: '', body: '' })
const resubmitting = ref(false)
const submitting = ref(false)
const newTaskComment = ref('')
const newAssignmentComment = ref('')
const postingTaskComment = ref(false)
const postingAssignmentComment = ref(false)

function hasBeenSubmitted() {
  return !!assignment.value?.submitted_at
}
function isInputActive() {
  return assignment.value?.status === 'returned' || !hasBeenSubmitted() || resubmitting.value
}

async function load() {
  loading.value = true
  try {
    const [mine, peerRes] = await Promise.all([
      engineApi.getMyTasks(),
      engineApi.getTaskPeers(taskId.value)
    ])
    assignment.value = (mine.data ?? []).find((a) => a.task_id === taskId.value) ?? null
    peers.value = (peerRes.data ?? []).filter((p) => !p.is_self)
    if (assignment.value) {
      draft.link = assignment.value.link_url ?? ''
      draft.body = assignment.value.body ?? ''
      const [tc, ac] = await Promise.all([
        engineApi.getTaskComments(taskId.value),
        engineApi.getAssignmentComments(assignment.value.id)
      ])
      taskComments.value = tc.data ?? []
      assignmentComments.value = ac.data ?? []
    }
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function submit() {
  if (!assignment.value) return
  const handin = assignment.value.task?.handin_type ?? 'link'
  const payload: { link_url?: string; body?: string } = {}
  if (handin === 'link' || handin === 'file' || handin === 'external_form') payload.link_url = draft.link || undefined
  if (handin === 'text') payload.body = draft.body || undefined
  submitting.value = true
  try {
    await engineApi.submitTask(taskId.value, payload)
    resubmitting.value = false
    await load()
  } finally {
    submitting.value = false
  }
}

async function postTaskComment() {
  if (!newTaskComment.value.trim()) return
  postingTaskComment.value = true
  try {
    await engineApi.postTaskComment(taskId.value, newTaskComment.value.trim())
    taskComments.value = (await engineApi.getTaskComments(taskId.value)).data ?? []
    newTaskComment.value = ''
  } finally {
    postingTaskComment.value = false
  }
}
async function postAssignmentComment() {
  if (!assignment.value || !newAssignmentComment.value.trim()) return
  postingAssignmentComment.value = true
  try {
    await engineApi.postAssignmentComment(assignment.value.id, newAssignmentComment.value.trim())
    assignmentComments.value = (await engineApi.getAssignmentComments(assignment.value.id)).data ?? []
    newAssignmentComment.value = ''
  } finally {
    postingAssignmentComment.value = false
  }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
function authorName(c: TaskComment | AssignmentComment) {
  return c.member?.profile?.full_name || c.member?.email || 'Member'
}

const peerStyles: Record<string, string> = {
  assigned: 'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-100 text-amber-800',
  submitted: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  returned: 'bg-red-100 text-red-800'
}

const statusLabel: Record<string, string> = {
  assigned: 'OPEN', in_progress: 'IN_PROGRESS', submitted: 'IN_REVIEW', completed: 'DONE', returned: 'RETURNED'
}
const isOverdue = computed(() =>
  !!assignment.value?.task?.due_at &&
  new Date(assignment.value.task.due_at) < new Date() &&
  assignment.value.status !== 'completed'
)
function dueTag(d?: string | null) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterLink to="/tasks" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeftIcon class="h-4 w-4 mr-1" /> Back to tasks
      </RouterLink>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!assignment" class="text-center py-16">
        <p class="text-gray-500">This task isn't assigned to you, or doesn't exist.</p>
      </div>

      <div v-else class="space-y-8">
        <!-- Ticket header -->
        <section>
          <p class="text-[11px] font-mono uppercase tracking-widest text-senpai-600">
            TASK · {{ assignment.task?.track?.replace('_', ' ') }} · {{ assignment.task?.kind }}
          </p>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">{{ assignment.task?.title }}</h1>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-100">
            <span class="text-[11px] font-mono px-2 py-1 rounded bg-gray-100 text-gray-500">{{ statusLabel[assignment.status] }}</span>
            <span v-if="assignment.task?.due_at" class="text-[11px] font-mono" :class="isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'">
              {{ isOverdue ? 'OVERDUE · ' : 'DUE ' }}{{ dueTag(assignment.task.due_at) }}
            </span>
            <span v-if="assignment.task?.is_required" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-50 text-red-600">REQUIRED</span>
          </div>

          <p class="text-sm text-gray-700 mt-4 whitespace-pre-wrap leading-relaxed">{{ assignment.task?.description }}</p>
        </section>

        <!-- Your submission -->
        <section class="bg-white rounded-2xl border border-gray-200 p-5">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Your submission</h2>
            <span v-if="assignment.status === 'submitted'" class="text-[11px] font-mono text-blue-600 font-medium">IN_REVIEW</span>
            <span v-else-if="assignment.status === 'returned'" class="text-[11px] font-mono text-red-600 font-medium">RETURNED</span>
            <span v-else-if="assignment.status === 'completed'" class="text-[11px] font-mono text-senpai-700 font-medium inline-flex items-center gap-1"><CheckCircleIcon class="h-3.5 w-3.5" /> DONE</span>
          </div>

          <p v-if="assignment.status === 'returned' && assignment.review_note" class="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-3">{{ assignment.review_note }}</p>

          <div v-if="hasBeenSubmitted() && !isInputActive()" class="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p v-if="assignment.link_url" class="text-sm"><a :href="assignment.link_url" target="_blank" rel="noopener noreferrer" class="text-senpai-600 hover:underline break-all">{{ assignment.link_url }}</a></p>
            <p v-if="assignment.body" class="text-sm text-gray-700 whitespace-pre-wrap">{{ assignment.body }}</p>
            <button v-if="assignment.status !== 'completed'" class="mt-2 text-xs text-gray-500 hover:text-gray-800 font-medium" @click="resubmitting = true">Resubmit</button>
          </div>
          <template v-else-if="assignment.status !== 'completed'">
            <textarea v-if="assignment.task?.handin_type === 'text'" v-model="draft.body" rows="3" placeholder="Write your response…" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500" />
            <a v-else-if="assignment.task?.handin_type === 'external_form' && assignment.task?.external_url" :href="assignment.task.external_url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm text-senpai-600 font-medium mb-2">Open the form <ArrowTopRightOnSquareIcon class="h-4 w-4" /></a>
            <input v-else-if="assignment.task?.handin_type !== 'none'" v-model="draft.link" type="url" placeholder="https://…" class="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500" />
            <button class="mt-3 px-4 py-2 bg-senpai-600 text-white rounded-lg text-sm font-medium hover:bg-senpai-700 disabled:opacity-50" :disabled="submitting" @click="submit">
              {{ submitting ? 'Submitting…' : hasBeenSubmitted() ? 'Resubmit' : assignment.task?.handin_type === 'none' || assignment.task?.handin_type === 'external_form' ? 'Mark as done' : 'Submit' }}
            </button>
          </template>

          <!-- Private thread with admins -->
          <div v-if="hasBeenSubmitted()" class="mt-4 pt-3 border-t border-gray-100">
            <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2">// Comments on your submission</p>
            <div v-if="assignmentComments.length" class="space-y-2 mb-2">
              <div v-for="c in assignmentComments" :key="c.id" class="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                <p class="text-xs text-gray-400 mb-0.5">{{ authorName(c) }} · {{ timeAgo(c.created_at) }}</p>
                <p class="text-gray-700 whitespace-pre-wrap">{{ c.body }}</p>
              </div>
            </div>
            <p v-else class="text-xs text-gray-400 italic mb-2">No comments yet.</p>
            <div class="flex items-center gap-2">
              <input v-model="newAssignmentComment" type="text" placeholder="Reply…" class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-senpai-400" @keyup.enter="postAssignmentComment" />
              <button class="text-sm text-senpai-600 font-medium hover:text-senpai-700 disabled:opacity-50" :disabled="postingAssignmentComment" @click="postAssignmentComment">Send</button>
            </div>
          </div>
        </section>

        <!-- Who else is working on this -->
        <section v-if="peers.length">
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Who else is working on this</h2>
          <div class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            <div v-for="p in peers" :key="p.member_id" class="flex items-center justify-between px-4 py-2.5">
              <span class="text-sm text-gray-800 flex items-center gap-2"><UserCircleIcon class="h-4 w-4 text-gray-300" /> {{ p.member_name }}</span>
              <span class="text-xs px-2 py-0.5 rounded-full capitalize" :class="peerStyles[p.status]">{{ p.status.replace('_', ' ') }}</span>
            </div>
          </div>
        </section>

        <!-- Shared Q&A -->
        <section>
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-1">// Discussion</h2>
          <p class="text-xs text-gray-400 mb-3">A shared thread — anyone assigned can ask questions or help each other here.</p>
          <div v-if="taskComments.length" class="space-y-2 mb-3">
            <div v-for="c in taskComments" :key="c.id" class="text-sm bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
              <p class="text-xs text-gray-400 mb-0.5">{{ authorName(c) }} · {{ timeAgo(c.created_at) }}</p>
              <p class="text-gray-700 whitespace-pre-wrap">{{ c.body }}</p>
            </div>
          </div>
          <p v-else class="text-sm text-gray-400 italic mb-3">No questions yet.</p>
          <div class="flex items-center gap-2">
            <input v-model="newTaskComment" type="text" placeholder="Ask or answer a question…" class="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-senpai-400" @keyup.enter="postTaskComment" />
            <BaseButton :loading="postingTaskComment" @click="postTaskComment">Post</BaseButton>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>
