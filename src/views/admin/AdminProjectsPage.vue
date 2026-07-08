<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { engineApi, adminEngineApi } from '@/api'
import type { Project, ProjectStatus } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { RocketLaunchIcon, LinkIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const projects = ref<Project[]>([])
const busyId = ref<string | null>(null)
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

// Pending approval leads — that's the admin's actual job on this page.
const activeTab = ref<'proposed' | 'active' | 'shipped' | 'parked'>('proposed')
const tabs = [
  { key: 'proposed' as const, label: 'Pending approval' },
  { key: 'active' as const, label: 'Building' },
  { key: 'shipped' as const, label: 'Shipped' },
  { key: 'parked' as const, label: 'Parked' }
]
const visible = computed(() => projects.value.filter((p) => p.status === activeTab.value))
const countFor = (key: ProjectStatus) => projects.value.filter((p) => p.status === key).length

async function load() {
  const res = await engineApi.listProjects()
  projects.value = res.data ?? []
}

onMounted(async () => {
  try {
    await load()
  } finally {
    loading.value = false
  }
})

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

async function approve(p: Project) {
  busyId.value = p.id
  try {
    const res = await adminEngineApi.approveProject(p.id)
    flash(res.status ? 'Approved — the team can start building' : res.message || 'Failed to approve')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to approve')
  } finally {
    busyId.value = null
  }
}
async function park(p: Project) {
  if (!confirm(`Park "${p.title}"? It can be reactivated later.`)) return
  busyId.value = p.id
  try {
    await engineApi.updateProjectStatus(p.id, 'parked')
    flash('Parked')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to park')
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Build log</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Projects</h1>
        <p class="mt-1 text-gray-600">
          Member-proposed builds. Approve the ones worth the collective's time.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <div class="border-b border-gray-200 mb-6">
          <nav class="-mb-px flex space-x-8">
            <button
              v-for="t in tabs"
              :key="t.key"
              @click="activeTab = t.key"
              :class="[
                'py-3 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === t.key
                  ? 'border-senpai-600 text-senpai-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ t.label }}
              <span class="ml-1 text-xs font-mono" :class="t.key === 'proposed' && countFor('proposed') ? 'text-amber-600' : 'text-gray-400'">{{ countFor(t.key) }}</span>
            </button>
          </nav>
        </div>

        <div v-if="!visible.length" class="text-center py-14 bg-white rounded-2xl border border-gray-200">
          <RocketLaunchIcon class="mx-auto h-10 w-10 text-gray-300" />
          <p class="mt-3 text-sm text-gray-500">
            {{ activeTab === 'proposed' ? 'No proposals waiting on you.' : 'Nothing here yet.' }}
          </p>
        </div>

        <div v-else class="space-y-3">
          <div v-for="p in visible" :key="p.id" class="bg-white rounded-2xl border border-gray-200 p-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0">
                <RouterLink :to="`/projects/${p.id}`" class="font-semibold text-gray-900 hover:text-senpai-700">{{ p.title }}</RouterLink>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ p.problem_statement }}</p>
                <div class="flex items-center gap-3 mt-3">
                  <div class="flex items-center gap-1.5">
                    <span class="h-6 w-6 rounded-full overflow-hidden shrink-0 bg-gray-100">
                      <img v-if="p.creator?.profile?.photo_url" :src="p.creator.profile.photo_url" :alt="p.creator?.profile?.full_name" class="h-full w-full object-cover" />
                      <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(p.creator?.profile?.full_name || '?') }}</span>
                    </span>
                    <span class="text-sm text-gray-600">{{ p.creator?.profile?.full_name || 'Member' }}</span>
                  </div>
                  <span class="text-xs font-mono text-gray-400">TEAM {{ p.team_count }}/{{ p.team_cap }}</span>
                  <span class="text-xs font-mono text-gray-400">{{ new Date(p.created_at).toLocaleDateString() }}</span>
                  <a
                    v-if="p.status === 'shipped' && p.outcome_url"
                    :href="p.outcome_url"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex items-center gap-1 text-xs text-senpai-600 hover:text-senpai-700"
                  ><LinkIcon class="h-3.5 w-3.5" /> outcome</a>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0 text-sm">
                <!-- Approving is the actual job of this page — it's the one button
                     that gets weight. Park is a rare, quiet escape hatch, not a
                     peer action to Approve. -->
                <button
                  v-if="p.status === 'proposed'"
                  class="px-3 py-1.5 rounded-lg bg-senpai-600 text-white font-medium hover:bg-senpai-700 disabled:opacity-50"
                  :disabled="busyId === p.id"
                  @click="approve(p)"
                >Approve</button>
                <RouterLink :to="`/projects/${p.id}`" class="text-senpai-600 hover:text-senpai-700 font-medium">View →</RouterLink>
                <button
                  v-if="p.status === 'active'"
                  class="text-xs text-gray-300 hover:text-red-500 disabled:opacity-50"
                  :disabled="busyId === p.id"
                  @click="park(p)"
                >Park</button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AdminLayout>
</template>
