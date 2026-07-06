<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { ClipboardDocumentCheckIcon, CheckCircleIcon, EnvelopeIcon } from '@heroicons/vue/24/outline'

const router = useRouter()

const adminStore = useAdminStore()

const tab = ref<'pending' | 'declined'>('pending')
function loadTab() {
  adminStore.fetchApplications({ status: tab.value })
}
onMounted(loadTab)

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

// ---- quick approve/decline right from the card ----
const busyId = ref<string | null>(null)
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}
async function approve(id: string, name?: string) {
  if (!confirm(`Approve ${name || 'this applicant'}? They'll receive an approval email.`)) return
  busyId.value = id
  try {
    const res = await adminStore.approveApplication(id)
    flash(res.success ? 'Approved' : res.error || 'Failed to approve')
  } finally {
    busyId.value = null
  }
}
async function decline(id: string, name?: string) {
  const reason = prompt(`Decline ${name || 'this applicant'} — reason (sent in their email, optional):`)
  if (reason === null) return
  busyId.value = id
  try {
    const res = await adminStore.declineApplication(id, reason || 'Not specified')
    flash(res.success ? 'Declined' : res.error || 'Failed to decline')
  } finally {
    busyId.value = null
  }
}
</script>

<template>
  <AdminLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Intake queue</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Applications</h1>
        <p class="mt-1 text-gray-600">
          Review new applicants. Declined ones stay here for the record — they never become members.
        </p>
      </div>

      <!-- Tabs -->
      <div class="mb-6 flex gap-1 border-b border-gray-200">
        <button
          class="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="tab === 'pending' ? 'border-senpai-600 text-senpai-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="tab = 'pending'; loadTab()"
        >
          Pending
        </button>
        <button
          class="px-3 py-2 text-sm font-medium border-b-2 transition-colors"
          :class="tab === 'declined' ? 'border-senpai-600 text-senpai-700' : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="tab = 'declined'; loadTab()"
        >
          Declined
        </button>
      </div>

      <!-- Loading -->
      <div v-if="adminStore.applicationsLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Empty State -->
      <div
        v-else-if="adminStore.applications.length === 0"
        class="text-center py-12 bg-white rounded-2xl border border-gray-200"
      >
        <ClipboardDocumentCheckIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-4 text-lg font-medium text-gray-900">{{ tab === 'pending' ? 'No pending applications' : 'No declined applications' }}</h3>
        <p class="mt-2 text-gray-600">
          {{ tab === 'pending' ? 'All applications have been reviewed!' : 'Nobody has been turned down yet.' }}
        </p>
      </div>

      <!-- Applications Grid -->
      <template v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="app in adminStore.applications"
            :key="app.id"
            class="bg-white rounded-2xl border border-gray-200 p-5 cursor-pointer hover:border-senpai-300 hover:shadow-sm transition flex flex-col"
            @click="router.push(`/admin/applications/${app.id}`)"
          >
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="flex items-center gap-3 min-w-0">
                <span class="h-11 w-11 rounded-full overflow-hidden shrink-0 bg-gray-100 ring-2 ring-gray-100">
                  <img v-if="app.profile.photo_url" :src="app.profile.photo_url" :alt="app.profile.full_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full flex items-center justify-center text-sm font-medium text-gray-500">{{ initials(app.profile.full_name) }}</span>
                </span>
                <div class="min-w-0">
                  <p class="font-medium text-gray-900 truncate">{{ app.profile.full_name }}</p>
                  <p class="text-sm text-gray-500 truncate">{{ app.email }}</p>
                </div>
              </div>
              <span v-if="tab === 'pending'" class="inline-flex items-center gap-1 text-[11px] font-mono shrink-0" :class="app.email_verified ? 'text-senpai-700' : 'text-gray-400'">
                <CheckCircleIcon v-if="app.email_verified" class="h-3.5 w-3.5" />
                <EnvelopeIcon v-else class="h-3.5 w-3.5" />
                {{ app.email_verified ? 'CONFIRMED' : 'UNCONFIRMED' }}
              </span>
              <span v-else class="text-[11px] font-mono text-red-500 shrink-0">DECLINED</span>
            </div>

            <div class="space-y-1 text-sm text-gray-600 mb-4">
              <p>{{ app.profile.primary_skill?.name || 'No skill set' }}</p>
              <p class="text-gray-400">{{ app.profile.city }}, {{ app.profile.country }}</p>
              <p class="font-mono text-xs text-gray-400">Applied {{ new Date(app.created_at).toLocaleDateString() }}</p>
              <p v-if="app.referred_by_scout_name" class="inline-flex items-center gap-1.5 text-amber-700">
                <span class="h-4 w-4 rounded-full overflow-hidden shrink-0 bg-amber-100">
                  <img v-if="app.referred_by_scout_photo_url" :src="app.referred_by_scout_photo_url" :alt="app.referred_by_scout_name" class="h-full w-full object-cover" />
                  <span v-else class="h-full w-full flex items-center justify-center text-[8px] font-medium text-amber-700">{{ initials(app.referred_by_scout_name) }}</span>
                </span>
                Referred by {{ app.referred_by_scout_name }}
              </p>
              <p v-if="tab === 'declined' && app.decline_reason" class="text-gray-500 italic">"{{ app.decline_reason }}"</p>
            </div>

            <div class="mt-auto pt-3 border-t border-gray-100 flex items-center gap-3 text-sm font-medium" @click.stop>
              <template v-if="tab === 'pending'">
                <button class="text-senpai-600 hover:text-senpai-700 disabled:opacity-50" :disabled="busyId === app.id" @click="approve(app.id, app.profile.full_name)">Approve</button>
                <button class="text-red-600 hover:text-red-700 disabled:opacity-50" :disabled="busyId === app.id" @click="decline(app.id, app.profile.full_name)">Decline</button>
              </template>
              <RouterLink :to="`/admin/applications/${app.id}`" class="ml-auto text-gray-400 hover:text-gray-600">Review →</RouterLink>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div
          v-if="adminStore.applicationsPagination && adminStore.applicationsPagination.total_pages > 1"
          class="mt-4 bg-white rounded-2xl border border-gray-200 px-5 py-3 flex items-center justify-between"
        >
          <p class="text-sm text-gray-500">
            Page {{ adminStore.applicationsPagination.current_page }} of {{ adminStore.applicationsPagination.total_pages }}
          </p>
          <div class="flex gap-2">
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.applicationsPagination.has_prev"
            >
              Previous
            </BaseButton>
            <BaseButton
              variant="outline"
              size="sm"
              :disabled="!adminStore.applicationsPagination.has_next"
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
