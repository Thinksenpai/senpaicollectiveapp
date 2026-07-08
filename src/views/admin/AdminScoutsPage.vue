<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { adminApi, scoutsApi } from '@/api'
import { useAdminStore } from '@/stores/admin'
import type { Scout, ScoutRequest, ScoutLeaderboardEntry } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { UsersIcon } from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

const loading = ref(true)
const scouts = ref<Scout[]>([])
const requests = ref<ScoutRequest[]>([])
const leaderboard = ref<ScoutLeaderboardEntry[]>([])
const toast = ref('')
const busyId = ref<string | null>(null)

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

async function load() {
  const [scoutsRes, requestsRes, leaderboardRes] = await Promise.all([
    adminApi.getScouts(),
    adminApi.getScoutRequests(),
    scoutsApi.getLeaderboard()
  ])
  scouts.value = scoutsRes.data ?? []
  requests.value = requestsRes.data ?? []
  leaderboard.value = leaderboardRes.data ?? []
}
onMounted(async () => {
  try {
    await load()
  } finally {
    loading.value = false
  }
})

// Funnel counts only exist (via the leaderboard query) for active scouts with
// at least one recruit — inactive/removed scouts show a plain dash instead of
// a fabricated zero.
const statsByMember = computed(() => {
  const map: Record<string, ScoutLeaderboardEntry> = {}
  for (const e of leaderboard.value) map[e.member.id] = e
  return map
})

const statusCode: Record<string, string> = {
  active: 'text-senpai-700',
  inactive: 'text-amber-600',
  removed: 'text-gray-400'
}
const statusLabel: Record<string, string> = {
  active: 'ACTIVE',
  inactive: 'AWAITING PLEDGE',
  removed: 'REMOVED'
}

const summary = computed(() => {
  const active = scouts.value.filter((s) => s.status === 'active').length
  const inactive = scouts.value.filter((s) => s.status === 'inactive').length
  const removed = scouts.value.filter((s) => s.status === 'removed').length
  const totalApproved = leaderboard.value.reduce((sum, e) => sum + e.stats.total_approved, 0)
  const totalRegistered = leaderboard.value.reduce((sum, e) => sum + e.stats.total_registered, 0)
  const approvalRate = totalRegistered ? Math.round((totalApproved / totalRegistered) * 100) : 0
  return { active, inactive, removed, totalApproved, totalRegistered, approvalRate }
})

async function approve(req: ScoutRequest) {
  busyId.value = req.id
  try {
    const res = await adminApi.approveScoutRequest(req.id)
    flash(res.status ? `${req.member?.profile?.full_name || 'Member'} promoted to Scout` : res.message || 'Failed to approve')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to approve')
  } finally {
    busyId.value = null
  }
}
async function decline(req: ScoutRequest) {
  const reason = prompt('Decline reason (internal note, optional):')
  if (reason === null) return
  busyId.value = req.id
  try {
    await adminApi.declineScoutRequest(req.id, reason || undefined)
    flash('Declined')
    await load()
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to decline')
  } finally {
    busyId.value = null
  }
}
async function remove(scout: Scout) {
  const name = scout.member?.profile?.full_name || 'this scout'
  if (!confirm(`Remove Scout access from ${name}?`)) return
  busyId.value = scout.member_id
  try {
    const res = await adminStore.removeScout(scout.member_id)
    flash(res.success ? 'Removed' : res.error || 'Failed to remove')
    await load()
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Referral network</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Scouts</h1>
        <p class="mt-1 text-gray-600">Who's recruiting for the collective, and how it's going.</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <!-- Summary strip -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div class="bg-white rounded-2xl border border-gray-200 p-4">
            <p class="text-2xl font-bold text-gray-900">{{ summary.active }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Active scouts</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-200 p-4">
            <p class="text-2xl font-bold text-gray-900">{{ summary.inactive }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Awaiting pledge</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-200 p-4">
            <p class="text-2xl font-bold text-gray-900">{{ summary.totalRegistered }}</p>
            <p class="text-xs text-gray-500 mt-0.5">Recruits registered</p>
          </div>
          <div class="bg-white rounded-2xl border border-gray-200 p-4">
            <p class="text-2xl font-bold text-gray-900">{{ summary.approvalRate }}%</p>
            <p class="text-xs text-gray-500 mt-0.5">Approval rate</p>
          </div>
        </div>

        <!-- Pending requests -->
        <div class="mb-8">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Pending requests</h2>
          <div v-if="!requests.length" class="bg-white rounded-2xl border border-gray-200 p-6 text-center text-sm text-gray-400">
            No pending requests.
          </div>
          <div v-else class="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            <div v-for="req in requests" :key="req.id" class="flex items-center justify-between gap-3 px-5 py-3">
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-gray-100">
                  <img v-if="req.member?.profile?.photo_url" :src="req.member.profile.photo_url" :alt="req.member?.profile?.full_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full flex items-center justify-center text-[10px] font-medium text-gray-500">{{ initials(req.member?.profile?.full_name || '?') }}</span>
                </span>
                <div class="min-w-0">
                  <RouterLink :to="`/admin/members/${req.member_id}`" class="text-sm font-medium text-gray-900 hover:text-senpai-700 truncate block">{{ req.member?.profile?.full_name || 'Member' }}</RouterLink>
                  <p class="text-xs font-mono text-gray-400">{{ new Date(req.requested_at).toLocaleDateString() }}</p>
                </div>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <button class="px-3 py-1.5 rounded-lg bg-senpai-600 text-white text-sm font-medium hover:bg-senpai-700 disabled:opacity-50" :disabled="busyId === req.id" @click="approve(req)">Approve</button>
                <button class="text-sm text-gray-400 hover:text-red-600 disabled:opacity-50" :disabled="busyId === req.id" @click="decline(req)">Decline</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Roster -->
        <div>
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">All scouts</h2>
          <div v-if="!scouts.length" class="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <UsersIcon class="mx-auto h-10 w-10 text-gray-300" />
            <p class="mt-3 text-sm text-gray-500">No scouts yet.</p>
          </div>
          <div v-else class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide text-left">
                <tr>
                  <th class="px-5 py-2.5 font-medium">Scout</th>
                  <th class="px-5 py-2.5 font-medium">Status</th>
                  <th class="px-5 py-2.5 font-medium">Registered</th>
                  <th class="px-5 py-2.5 font-medium">Approved</th>
                  <th class="px-5 py-2.5 font-medium">Score</th>
                  <th class="px-5 py-2.5 font-medium"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="scout in scouts" :key="scout.member_id" class="hover:bg-gray-50">
                  <td class="px-5 py-3">
                    <div class="flex items-center gap-2.5 min-w-0">
                      <span class="h-7 w-7 rounded-full overflow-hidden shrink-0 bg-gray-100">
                        <img v-if="scout.member?.profile?.photo_url" :src="scout.member.profile.photo_url" :alt="scout.member?.profile?.full_name" class="h-full w-full object-cover" />
                        <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-gray-500">{{ initials(scout.member?.profile?.full_name || '?') }}</span>
                      </span>
                      <RouterLink :to="`/admin/members/${scout.member_id}`" class="font-medium text-gray-900 hover:text-senpai-700 truncate">{{ scout.member?.profile?.full_name || 'Member' }}</RouterLink>
                    </div>
                  </td>
                  <td class="px-5 py-3">
                    <span class="text-xs font-mono font-medium" :class="statusCode[scout.status]">{{ statusLabel[scout.status] }}</span>
                  </td>
                  <td class="px-5 py-3 text-gray-600">{{ statsByMember[scout.member_id]?.stats.total_registered ?? '—' }}</td>
                  <td class="px-5 py-3 text-gray-600">{{ statsByMember[scout.member_id]?.stats.total_approved ?? '—' }}</td>
                  <td class="px-5 py-3 text-gray-600">{{ scout.score.toFixed(1) }}</td>
                  <td class="px-5 py-3 text-right">
                    <button v-if="scout.status !== 'removed'" class="text-xs text-gray-300 hover:text-red-500 disabled:opacity-50" :disabled="busyId === scout.member_id" @click="remove(scout)">Remove</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AdminLayout>
</template>
