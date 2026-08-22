<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { engineApi } from '@/api'
import type { Task } from '@/types'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const router = useRouter()
const authStore = useAuthStore()

// Open still means "no verification required" — but a role-tagged task
// still needs the skill on your own profile, so the board tells you which
// ones you can't claim yet instead of letting you find out via an error.
const mySkillIds = computed(() => new Set((authStore.member?.skills ?? []).map((s) => s.id)))
function skillMismatch(t: Task): boolean {
  return !!t.skill_id && !mySkillIds.value.has(t.skill_id)
}

const loading = ref(true)
const tasks = ref<Task[]>([])
const claiming = ref<string | null>(null)
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

const circleFilter = ref<string>('all')
const skillFilter = ref<string>('all')

onMounted(async () => {
  try {
    const res = await engineApi.getOpenTasks()
    tasks.value = res.data ?? []
  } finally {
    loading.value = false
  }
})

const circles = computed(() => [...new Set(tasks.value.map((t) => t.circle).filter((c): c is string => !!c))])
const skills = computed(() => [...new Set(tasks.value.map((t) => t.skill_name).filter((s): s is string => !!s))])

const filtered = computed(() =>
  tasks.value.filter(
    (t) =>
      (circleFilter.value === 'all' || t.circle === circleFilter.value) &&
      (skillFilter.value === 'all' || t.skill_name === skillFilter.value)
  )
)

function slotsLabel(t: Task): string {
  if (!t.claim_cap) return ''
  const taken = t.claim_count ?? 0
  const left = Math.max(t.claim_cap - taken, 0)
  return left === 0 ? 'FULL' : `${left} SLOT${left === 1 ? '' : 'S'} LEFT`
}

function isFull(t: Task): boolean {
  return !!t.claim_cap && (t.claim_count ?? 0) >= t.claim_cap
}

async function claim(t: Task) {
  claiming.value = t.id
  try {
    await engineApi.claimTask(t.id)
    router.push(`/tasks/${t.id}`)
  } catch (e: any) {
    flash(e.response?.data?.message || 'Could not claim this task')
  } finally {
    claiming.value = null
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">Open board</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Open tasks</h1>
        <p class="text-sm text-gray-500 mt-1">
          Work you can claim with the skills on your profile — no verification needed yet. Every reviewed contribution builds your record.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!tasks.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p class="text-sm text-gray-500">Nothing on the board right now — new work lands here as the circles plan it.</p>
      </div>

      <template v-else>
        <div v-if="circles.length || skills.length" class="flex flex-wrap gap-3 mb-6">
          <select v-if="circles.length" v-model="circleFilter" class="text-xs font-mono uppercase border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600">
            <option value="all">ALL CIRCLES</option>
            <option v-for="c in circles" :key="c" :value="c">{{ c.toUpperCase() }}</option>
          </select>
          <select v-if="skills.length" v-model="skillFilter" class="text-xs font-mono uppercase border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-600">
            <option value="all">ALL ROLES</option>
            <option v-for="s in skills" :key="s" :value="s">{{ s.toUpperCase() }}</option>
          </select>
        </div>

        <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          <div v-for="t in filtered" :key="t.id" class="px-4 py-4">
            <div class="flex items-start gap-3">
              <div class="min-w-0 flex-1">
                <div class="flex items-start gap-2 flex-wrap">
                  <p class="font-medium text-gray-900">{{ t.title }}</p>
                  <span v-if="t.skill_name" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-senpai-50 text-senpai-700 shrink-0 uppercase">{{ t.skill_name }}</span>
                  <span v-if="t.circle" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 shrink-0 uppercase">{{ t.circle }}</span>
                </div>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ t.description }}</p>
                <p class="text-[11px] font-mono text-gray-400 mt-1.5 uppercase tracking-wide">
                  <template v-if="t.creator_name">BY {{ t.creator_name }}</template>
                  <template v-if="t.reviewer_name"> · REVIEWED BY {{ t.reviewer_name }}</template>
                  <template v-if="slotsLabel(t)"> · {{ slotsLabel(t) }}</template>
                </p>
                <p v-if="skillMismatch(t)" class="text-[11px] font-mono text-amber-600 mt-1">
                  Add "{{ t.skill_name }}" to your profile skills to claim this
                </p>
              </div>
              <button
                class="shrink-0 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                :class="isFull(t) || skillMismatch(t) ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.97]'"
                :disabled="isFull(t) || skillMismatch(t) || claiming === t.id"
                @click="claim(t)"
              >
                {{ claiming === t.id ? 'Claiming…' : isFull(t) ? 'Full' : skillMismatch(t) ? 'Locked' : 'Claim' }}
              </button>
            </div>
          </div>
          <div v-if="!filtered.length" class="px-4 py-8 text-center text-sm text-gray-500">
            Nothing matches those filters.
          </div>
        </div>
      </template>

      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </div>
  </AppLayout>
</template>
