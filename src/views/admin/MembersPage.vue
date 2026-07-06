<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAdminStore } from '@/stores/admin'
import { adminEngineApi } from '@/api'
import type { MemberStatus, MemberEngineStatus } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import { UsersIcon, MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

const search = ref('')
const statusFilter = ref<MemberStatus | ''>('')

function initials(name: string) {
  const parts = name.trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}
const roleBadge: Record<string, string> = {
  admin: 'bg-red-50 text-red-700',
  scout: 'bg-amber-50 text-amber-700'
}
function specialRoles(member: { roles?: { name: string }[] }) {
  return (member.roles || []).filter((r) => r.name === 'admin' || r.name === 'scout')
}

// Members are people who were actually accepted at some point — pending
// applicants and declined ones never became a member, and live on the
// Applications intake page instead. So the only statuses that ever show up
// here are 'approved' (active) and 'deactivated' (was active, now off).
const statusOptions = [
  { value: '', label: 'All Members' },
  { value: 'approved', label: 'Active' },
  { value: 'deactivated', label: 'Deactivated' }
]

// Monospace status codes — same treatment as task status (DONE, IN_REVIEW…)
// on the member Tasks pages, extended here so admin views share the signature.
const statusCodeClasses: Record<string, string> = {
  approved: 'text-senpai-700',
  deactivated: 'text-gray-400'
}
const statusCodeLabel: Record<string, string> = {
  approved: 'ACTIVE',
  deactivated: 'OFF'
}

const statusCounts = computed(() => {
  const counts: Record<string, number> = { approved: 0, deactivated: 0 }
  for (const m of adminStore.members) counts[m.status] = (counts[m.status] ?? 0) + 1
  return counts
})

// Engine roster: cohort / pod / state / last-active, keyed by member id.
const roster = ref<Record<string, MemberEngineStatus>>({})
async function loadRoster() {
  try {
    const res = await adminEngineApi.memberRoster()
    const map: Record<string, MemberEngineStatus> = {}
    for (const r of res.data ?? []) map[r.member_id] = r
    roster.value = map
  } catch {
    roster.value = {}
  }
}
function lastActive(iso?: string | null) {
  if (!iso) return 'Never'
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  return `${Math.floor(days / 30)}mo ago`
}
const stateBadge: Record<string, string> = {
  accepted: 'bg-gray-100 text-gray-700',
  inducted: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  withdrawn: 'bg-red-100 text-red-700'
}

onMounted(() => {
  fetchMembers()
  loadRoster()
})

function fetchMembers() {
  adminStore.fetchMembers({
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    limit: 20,
    offset: 0
  })
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(fetchMembers, 300)
})

watch(statusFilter, fetchMembers)

// ---- inline lifecycle actions ----
const busyId = ref<string | null>(null)
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}
async function deactivate(id: string, name?: string) {
  const reason = prompt(`Deactivate ${name || 'this member'} — reason (internal note, optional):`)
  if (reason === null) return
  busyId.value = id
  try {
    const res = await adminStore.deactivateMember(id, reason || 'Not specified')
    if (res.success) {
      flash('Deactivated')
      fetchMembers()
    } else {
      flash(res.error || 'Failed to deactivate')
    }
  } finally {
    busyId.value = null
  }
}
async function reactivate(id: string, name?: string) {
  if (!confirm(`Reactivate ${name || 'this member'}?`)) return
  busyId.value = id
  try {
    const res = await adminStore.reactivateMember(id)
    if (res.success) {
      flash('Reactivated')
      fetchMembers()
    } else {
      flash(res.error || 'Failed to reactivate')
    }
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Member registry</p>
          <h1 class="text-2xl font-bold text-gray-900 mt-1">Members</h1>
          <p class="mt-1 text-gray-600">
            Everyone who has been accepted — pending and declined applicants live on the Applications page instead.
          </p>
        </div>
        <p class="text-xs font-mono text-gray-400 shrink-0">
          {{ statusCounts.approved }} ACTIVE · {{ statusCounts.deactivated }} OFF
        </p>
      </div>

      <!-- Filters -->
      <div class="mb-6 flex flex-col sm:flex-row gap-4">
        <div class="flex-1 relative">
          <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            v-model="search"
            type="text"
            placeholder="Search by name or email..."
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-senpai-400 focus:border-senpai-400"
          />
        </div>
        <div class="w-full sm:w-48">
          <BaseSelect
            v-model="statusFilter"
            :options="statusOptions"
            placeholder="Filter by status"
          />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="adminStore.membersLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="adminStore.members.length === 0"
        class="text-center py-12 bg-white rounded-lg"
      >
        <UsersIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">No members found</h3>
        <p class="mt-2 text-gray-600">
          Try adjusting your search or filter criteria.
        </p>
      </div>

      <!-- Members Grid -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="member in adminStore.members"
            :key="member.id"
            class="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-senpai-300 hover:shadow-sm transition flex flex-col"
            @click="$router.push(`/admin/members/${member.id}`)"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="h-11 w-11 rounded-full overflow-hidden shrink-0 ring-2" :class="member.profile?.is_og_member ? 'ring-senpai-300' : 'ring-gray-100'">
                  <img v-if="member.profile?.photo_url" :src="member.profile.photo_url" :alt="member.profile?.full_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-500">{{ initials(member.profile?.full_name || member.email) }}</span>
                </span>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ member.profile?.full_name || 'No profile yet' }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ member.email }}</p>
                </div>
              </div>
              <span class="text-[11px] font-mono font-medium tracking-wide shrink-0" :class="statusCodeClasses[member.status]">
                {{ statusCodeLabel[member.status] }}
              </span>
            </div>

            <div v-if="specialRoles(member).length" class="flex flex-wrap gap-1.5 mb-3">
              <span v-for="r in specialRoles(member)" :key="r.name" class="text-[11px] font-medium capitalize px-2 py-0.5 rounded-full" :class="roleBadge[r.name]">{{ r.name }}</span>
            </div>

            <div class="space-y-1 text-sm text-gray-600 mb-4">
              <p>{{ member.profile?.primary_skill?.name || 'No skill set' }}</p>
              <p v-if="roster[member.id]" class="text-gray-500">
                {{ roster[member.id].cohort_name }}<span v-if="roster[member.id].pod_name"> · {{ roster[member.id].pod_name }}</span>
                <span class="inline-flex items-center px-1.5 py-0.5 ml-1.5 rounded text-xs font-medium capitalize" :class="stateBadge[roster[member.id].state]">{{ roster[member.id].state }}</span>
              </p>
              <p v-else class="text-gray-400">Not in a cohort</p>
              <p class="text-gray-400">{{ member.profile?.city ? `${member.profile.city}, ${member.profile.country}` : 'No location' }}</p>
              <p class="font-mono text-xs text-gray-400">
                Active {{ roster[member.id] ? lastActive(roster[member.id].last_active_at) : '—' }} · Joined {{ new Date(member.created_at).toLocaleDateString() }}
              </p>
            </div>

            <div class="mt-auto pt-3 border-t border-gray-100 flex items-center gap-3 text-sm font-medium" @click.stop>
              <button v-if="member.status === 'approved'" class="text-gray-500 hover:text-red-600 disabled:opacity-50" :disabled="busyId === member.id" @click="deactivate(member.id, member.profile?.full_name)">Deactivate</button>
              <button v-else class="text-senpai-600 hover:text-senpai-700 disabled:opacity-50" :disabled="busyId === member.id" @click="reactivate(member.id, member.profile?.full_name)">Reactivate</button>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="adminStore.membersPagination && adminStore.membersPagination.total_pages > 1"
          class="mt-4 bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center justify-between"
        >
          <p class="text-sm text-gray-500">
            Showing {{ adminStore.members.length }} of {{ adminStore.membersPagination.total }} members
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.membersPagination.has_prev"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.membersPagination.has_next"
            >
              Next
            </BaseButton>
          </div>
        </div>
      </template>
    </div>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AdminLayout>
</template>
