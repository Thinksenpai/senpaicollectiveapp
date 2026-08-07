<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { engineApi } from '@/api'
import type { Project, ProjectStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { PlusIcon, RocketLaunchIcon, LinkIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

const loading = ref(true)
const projects = ref<Project[]>([])
const toast = ref('')
const busyId = ref<string | null>(null)

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

// Tabs are the project lifecycle, in the order members care about:
// what's being built now, what's waiting for a team decision, what shipped.
const activeTab = ref<'active' | 'proposed' | 'shipped'>('active')
const tabs = [
  { key: 'active' as const, label: 'Building now' },
  { key: 'proposed' as const, label: 'Proposed' },
  { key: 'shipped' as const, label: 'Shipped' }
]
const visible = computed(() => {
  if (activeTab.value === 'shipped') {
    // Parked projects live quietly at the end of Shipped — history, not failure.
    return projects.value.filter((p) => p.status === 'shipped' || p.status === 'parked')
  }
  return projects.value.filter((p) => p.status === activeTab.value)
})
const countFor = (key: string) =>
  key === 'shipped'
    ? projects.value.filter((p) => p.status === 'shipped' || p.status === 'parked').length
    : projects.value.filter((p) => p.status === key).length

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
  return parts.length > 1 ? ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}
function isOnTeam(p: Project) {
  return (p.team || []).some((t) => t.member_id === authStore.member?.id)
}
const statusCode: Record<ProjectStatus, { label: string; cls: string }> = {
  proposed: { label: 'PROPOSED', cls: 'text-amber-600' },
  active: { label: 'BUILDING', cls: 'text-senpai-700' },
  shipped: { label: 'SHIPPED', cls: 'text-senpai-700' },
  parked: { label: 'PARKED', cls: 'text-gray-400' }
}

// ---- propose ----
const proposeModal = ref(false)
const proposing = ref(false)
const proposeError = ref('')
const form = ref({ title: '', problem_statement: '', team_cap: 4 })
function openPropose() {
  form.value = { title: '', problem_statement: '', team_cap: 4 }
  proposeError.value = ''
  proposeModal.value = true
}
async function submitPropose() {
  proposeError.value = ''
  if (!form.value.title.trim()) { proposeError.value = 'Give the project a name.'; return }
  if (!form.value.problem_statement.trim()) { proposeError.value = 'What real problem does this solve? That field is the whole point.'; return }
  proposing.value = true
  try {
    const res = await engineApi.proposeProject(form.value)
    if (res.status) {
      proposeModal.value = false
      flash('Proposed — it goes live once an admin approves it')
      await load()
      activeTab.value = 'proposed'
    } else {
      proposeError.value = res.message || 'Failed to propose project'
    }
  } catch (e: any) {
    proposeError.value = e.response?.data?.message || 'Failed to propose project'
  } finally {
    proposing.value = false
  }
}

// ---- join / approve ----
async function join(p: Project) {
  busyId.value = p.id
  try {
    const res = await engineApi.joinProject(p.id)
    flash(res.status ? `You're on ${p.title}` : res.message || 'Failed to join')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to join')
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Build log</p>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">Projects</h1>
          <p class="mt-1 text-gray-600">
            Real problems, small teams, shipped outcomes. Propose one, or join a team that's forming.
          </p>
        </div>
        <BaseButton @click="openPropose"><PlusIcon class="h-4 w-4 mr-1" /> Propose a project</BaseButton>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <!-- Tabs -->
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
              <span class="ml-1 text-xs font-mono text-gray-400">{{ countFor(t.key) }}</span>
            </button>
          </nav>
        </div>

        <!-- Empty state -->
        <div v-if="!visible.length" class="text-center py-14 bg-white rounded-2xl border border-gray-200">
          <RocketLaunchIcon class="mx-auto h-10 w-10 text-gray-300" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">
            {{ activeTab === 'active' ? 'Nothing being built yet' : activeTab === 'proposed' ? 'No proposals waiting' : 'Nothing shipped yet' }}
          </h3>
          <p class="mt-2 text-gray-600">Seen a real problem worth solving? That's the whole point of this place.</p>
          <BaseButton class="mt-5" @click="openPropose">Propose the first project</BaseButton>
        </div>

        <!-- Project cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <RouterLink
            v-for="p in visible"
            :key="p.id"
            :to="`/projects/${p.id}`"
            class="bg-white rounded-2xl border border-gray-200 p-5 hover:border-senpai-300 hover:shadow-sm transition flex flex-col"
          >
            <div class="flex items-start justify-between gap-2 mb-2">
              <h3 class="font-semibold text-gray-900 min-w-0">{{ p.title }}</h3>
              <span class="text-[11px] font-mono font-medium tracking-wide shrink-0" :class="statusCode[p.status].cls">
                {{ statusCode[p.status].label }}
              </span>
            </div>
            <p class="text-sm text-gray-600 line-clamp-3 mb-4">{{ p.problem_statement }}</p>

            <a
              v-if="p.status === 'shipped' && p.outcome_url"
              :href="p.outcome_url"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1 text-sm text-senpai-600 hover:text-senpai-700 mb-4"
              @click.stop
            >
              <LinkIcon class="h-4 w-4" /> See what shipped
            </a>

            <div class="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
              <!-- team faces -->
              <div class="flex items-center">
                <div class="flex -space-x-2">
                  <span
                    v-for="tm in (p.team || []).slice(0, 5)"
                    :key="tm.id"
                    class="h-7 w-7 rounded-full overflow-hidden ring-2 ring-white bg-gray-100"
                    :title="tm.member?.profile?.full_name"
                  >
                    <img v-if="tm.member?.profile?.photo_url" :src="tm.member.profile.photo_url" :alt="tm.member?.profile?.full_name" class="h-full w-full object-cover" />
                    <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(tm.member?.profile?.full_name || '?') }}</span>
                  </span>
                </div>
                <span class="ml-2 text-xs font-mono text-gray-400">{{ p.team_count }}/{{ p.team_cap }}</span>
              </div>

              <div class="flex items-center gap-2 shrink-0" @click.prevent>
                <span v-if="p.status === 'proposed'" class="text-xs font-mono text-amber-600">AWAITING ADMIN APPROVAL</span>
                <button
                  v-else-if="p.status === 'active' && !isOnTeam(p) && p.team_count < p.team_cap"
                  class="text-sm font-medium text-senpai-600 hover:text-senpai-700 disabled:opacity-50"
                  :disabled="busyId === p.id"
                  @click="join(p)"
                >Join team</button>
                <span v-else-if="p.status === 'active' && isOnTeam(p)" class="text-xs font-mono text-senpai-600">ON TEAM</span>
                <span v-else-if="p.status === 'active' && p.team_count >= p.team_cap" class="text-xs font-mono text-gray-400">TEAM FULL</span>
              </div>
            </div>
          </RouterLink>
        </div>
      </template>
    </div>

    <!-- Propose modal -->
    <BaseModal
      :show="proposeModal"
      title="Propose a project"
      subtitle="Start from a real problem — the team and the build come after."
      @close="proposeModal = false"
    >
      <div class="space-y-4">
        <BaseAlert v-if="proposeError" type="error">{{ proposeError }}</BaseAlert>
        <BaseInput v-model="form.title" label="Project name" placeholder="Naija SME Toolkit" required />
        <BaseTextarea
          v-model="form.problem_statement"
          label="The problem it solves"
          placeholder="Who has this problem, why does it matter, and what does solved look like?"
          :rows="4"
          required
        />
        <BaseInput v-model.number="form.team_cap" type="number" label="Team size cap" :min="1" :max="10" />
        <p class="text-xs text-gray-500">
          Your proposal goes to an admin for approval. Once it's live, any member can join your team until it's full.
        </p>
        <p class="text-xs text-gray-500">
          Senpai Collective retains the IP for projects built on this platform. In return, your team gets real
          experience and public credit for the work. Paid projects are a separate, explicit arrangement, not the
          default. See the
          <RouterLink to="/terms" target="_blank" class="text-senpai-600 hover:underline">Terms</RouterLink> for details.
        </p>
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="proposeModal = false">Cancel</button>
        <BaseButton :loading="proposing" @click="submitPropose">Propose project</BaseButton>
      </template>
    </BaseModal>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AppLayout>
</template>
