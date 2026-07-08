<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  EnvelopeIcon,
  StarIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const adminStore = useAdminStore()

const loading = ref(true)
const actionLoading = ref(false)
const error = ref<string | null>(null)
// An application under review always has a submitted profile — narrow the
// type to match, rather than threading ?. through every field below.
const application = computed(() => {
  const member = adminStore.currentMember?.member
  return member ? (member as typeof member & { profile: NonNullable<typeof member.profile> }) : null
})

const showApproveModal = ref(false)
const showDeclineModal = ref(false)
const adminNotes = ref('')
const declineReason = ref('')

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const discoverySourceLabels: Record<string, string> = {
  scout: 'Invited by a Scout',
  social: 'Social media',
  friend: 'Friend or colleague',
  event: 'Event or workshop',
  returning: 'Returning member',
  other: 'Other'
}

const primarySkill = computed(() =>
  application.value?.skills?.find((s) => s.id === application.value?.profile?.primary_skill_id)
)
const otherSkills = computed(() =>
  (application.value?.skills || []).filter((s) => s.id !== application.value?.profile?.primary_skill_id)
)

onMounted(async () => {
  loading.value = true
  await adminStore.fetchMember(route.params.id as string)
  loading.value = false
})

async function handleApprove() {
  actionLoading.value = true
  error.value = null

  const result = await adminStore.approveApplication(route.params.id as string, adminNotes.value)

  if (result.success) {
    showApproveModal.value = false
    router.push('/admin/applications')
  } else {
    error.value = result.error || 'Failed to approve application'
  }

  actionLoading.value = false
}

async function handleDecline() {
  if (!declineReason.value.trim()) {
    error.value = 'Please provide a reason for declining'
    return
  }

  actionLoading.value = true
  error.value = null

  const result = await adminStore.declineApplication(
    route.params.id as string,
    declineReason.value,
    adminNotes.value
  )

  if (result.success) {
    showDeclineModal.value = false
    router.push('/admin/applications')
  } else {
    error.value = result.error || 'Failed to decline application'
  }

  actionLoading.value = false
}
</script>

<template>
  <AdminLayout back-to="/admin/applications" back-label="Back to Applications">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <!-- Not Found -->
      <div v-else-if="!application" class="text-center py-12 bg-white rounded-2xl border border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">Application not found</h3>
        <RouterLink
          to="/admin/applications"
          class="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-senpai-600 hover:bg-senpai-700"
        >
          Back to Applications
        </RouterLink>
      </div>

      <!-- Application Detail -->
      <template v-else>
        <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
          {{ error }}
        </BaseAlert>

        <div class="flex flex-col lg:flex-row gap-6 items-start">
          <!-- Main column — the whole application reads as one document, not a
               grid of boxed fragments. Sections are separated by rules, not cards. -->
          <div class="flex-1 min-w-0 w-full bg-white rounded-2xl border border-gray-200 p-6 sm:p-8">
            <!-- Identity -->
            <div class="flex items-start gap-4 pb-6 border-b border-gray-200">
              <div class="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                <img v-if="application.profile.photo_url" :src="application.profile.photo_url" :alt="application.profile.full_name" class="h-full w-full object-cover" />
                <UserCircleIcon v-else class="h-12 w-12 text-gray-400" />
              </div>
              <div class="min-w-0">
                <h1 class="text-xl font-bold text-gray-900 truncate">{{ application.profile.full_name }}</h1>
                <p class="text-gray-600 truncate">{{ application.email }}</p>
                <p v-if="application.profile.phone" class="text-gray-500 text-sm truncate">{{ application.profile.phone }}</p>
              </div>
            </div>

            <!-- Skills — primary and secondary are separate fields, not one mixed chip row -->
            <div v-if="application.skills?.length" class="py-6 border-b border-gray-200 space-y-4">
              <div v-if="primarySkill">
                <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Primary skill</h2>
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-senpai-100 text-senpai-700">
                  {{ primarySkill.name }}
                </span>
              </div>
              <div v-if="otherSkills.length">
                <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Also skilled in</h2>
                <div class="flex flex-wrap gap-2">
                  <span v-for="skill in otherSkills" :key="skill.id" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {{ skill.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bio -->
            <div class="py-6 border-b border-gray-200">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Bio</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ application.profile.bio }}</p>
            </div>

            <!-- Recent Work -->
            <div class="py-6 border-b border-gray-200">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Recent work</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ application.profile.recent_work || 'Not provided.' }}</p>
            </div>

            <!-- Unique View -->
            <div class="py-6 border-b border-gray-200">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Unique view on life</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ application.profile.unique_view || 'Not provided.' }}</p>
            </div>

            <!-- Cover Letter (if provided) -->
            <div v-if="application.profile.cover_letter" class="py-6 border-b border-gray-200">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Why they want to join</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ application.profile.cover_letter }}</p>
            </div>

            <!-- OG member details (if applicable) -->
            <div v-if="application.profile.is_og_member && application.profile.og_member_details" class="py-6 border-b border-gray-200">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">OG member history</h2>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ application.profile.og_member_details }}</p>
            </div>

            <!-- Portfolio -->
            <div class="pt-6">
              <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Portfolio & links</h2>
              <div class="flex flex-wrap gap-2">
                <a
                  :href="application.profile.portfolio_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-senpai-400 hover:text-senpai-700 transition-colors"
                >
                  <LinkIcon class="h-4 w-4" /> Portfolio
                </a>
                <a
                  v-for="(link, index) in application.profile.additional_links"
                  :key="index"
                  :href="link.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-senpai-400 hover:text-senpai-700 transition-colors"
                >
                  <LinkIcon class="h-4 w-4" /> {{ link.label || link.url }}
                </a>
              </div>
            </div>
          </div>

          <!-- Sidebar — status, quick facts, actions -->
          <div class="w-full lg:w-72 shrink-0 lg:sticky lg:top-6 space-y-4">
            <div class="bg-white rounded-2xl border border-gray-200 p-5">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400">// Status</p>
                <span v-if="application.status === 'declined'" class="text-[11px] font-mono text-red-500">DECLINED</span>
                <span v-else class="inline-flex items-center gap-1 text-[11px] font-mono" :class="application.email_verified ? 'text-senpai-700' : 'text-gray-400'">
                  <CheckCircleIcon v-if="application.email_verified" class="h-3.5 w-3.5" />
                  <EnvelopeIcon v-else class="h-3.5 w-3.5" />
                  {{ application.email_verified ? 'CONFIRMED' : 'UNCONFIRMED' }}
                </span>
              </div>

              <dl class="space-y-2.5 text-sm">
                <div>
                  <dt class="text-xs text-gray-400">Primary skill</dt>
                  <dd class="text-gray-900">{{ application.profile.primary_skill?.name || '—' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Experience</dt>
                  <dd class="text-gray-900">{{ experienceLevelLabels[application.profile.experience_level] }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Location</dt>
                  <dd class="text-gray-900">{{ application.profile.city }}, {{ application.profile.country }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">Applied</dt>
                  <dd class="font-mono text-xs text-gray-500">{{ new Date(application.created_at).toLocaleDateString() }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-gray-400">How they heard about Senpai</dt>
                  <dd class="text-gray-900">{{ discoverySourceLabels[application.profile.discovery_source] }}</dd>
                </div>
                <div v-if="application.profile.is_og_member">
                  <dt class="text-xs text-gray-400">OG member</dt>
                  <dd class="text-gray-900">Yes</dd>
                </div>
                <div v-if="application.status === 'declined' && application.decline_reason">
                  <dt class="text-xs text-gray-400">Decline reason</dt>
                  <dd class="text-gray-900 italic">"{{ application.decline_reason }}"</dd>
                </div>
                <div v-if="application.referred_by_scout_name">
                  <dt class="text-xs text-gray-400">Referred by</dt>
                  <dd class="text-gray-900 inline-flex items-center gap-1.5">
                    <span class="h-5 w-5 rounded-full overflow-hidden shrink-0 bg-amber-100">
                      <img v-if="application.referred_by_scout_photo_url" :src="application.referred_by_scout_photo_url" :alt="application.referred_by_scout_name" class="h-full w-full object-cover" />
                      <span v-else class="h-full w-full flex items-center justify-center text-[9px] font-medium text-amber-700">
                        <StarIcon class="h-3 w-3 text-amber-500" />
                      </span>
                    </span>
                    {{ application.referred_by_scout_name }}
                  </dd>
                </div>
                <div v-if="application.status !== 'declined' && application.scout_note">
                  <dt class="text-xs text-gray-400">Scout's note</dt>
                  <dd class="text-gray-900 italic">"{{ application.scout_note }}"</dd>
                </div>
              </dl>
            </div>

            <div v-if="application.status !== 'declined'" class="bg-white rounded-2xl border border-gray-200 p-5">
              <p class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-3">// Actions</p>
              <div class="flex flex-col gap-2">
                <BaseButton class="w-full" @click="showApproveModal = true">
                  <CheckCircleIcon class="h-5 w-5 mr-2" />
                  Approve Application
                </BaseButton>
                <BaseButton class="w-full" variant="danger" @click="showDeclineModal = true">
                  <XCircleIcon class="h-5 w-5 mr-2" />
                  Decline Application
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Approve Modal -->
    <BaseModal :show="showApproveModal" title="Approve application" @close="showApproveModal = false">
      <div class="space-y-4">
        <div class="flex items-start gap-3 bg-senpai-50 rounded-xl p-4">
          <CheckCircleIcon class="h-5 w-5 text-senpai-600 shrink-0 mt-0.5" />
          <p class="text-sm text-senpai-800">
            {{ application?.profile.full_name }} will be approved and immediately receive a welcome email.
          </p>
        </div>
        <BaseTextarea
          v-model="adminNotes"
          label="Admin notes (optional, internal only)"
          placeholder="Internal notes for reference..."
          :rows="3"
        />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="showApproveModal = false">Cancel</button>
        <BaseButton :loading="actionLoading" @click="handleApprove">Approve & send email</BaseButton>
      </template>
    </BaseModal>

    <!-- Decline Modal -->
    <BaseModal :show="showDeclineModal" title="Decline application" @close="showDeclineModal = false">
      <div class="space-y-4">
        <div class="flex items-start gap-3 bg-red-50 rounded-xl p-4">
          <XCircleIcon class="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
          <p class="text-sm text-red-800">
            {{ application?.profile.full_name }} will be declined. We never ghost applicants — the reason below is sent to them by email, so keep it kind and specific.
          </p>
        </div>
        <BaseAlert v-if="error" type="error">{{ error }}</BaseAlert>
        <BaseTextarea
          v-model="declineReason"
          label="Reason (sent to the applicant)"
          placeholder="e.g. We're looking for more portfolio depth in this round — we'd love to see you reapply once you have a few more shipped projects."
          :rows="3"
          required
        />
        <BaseTextarea
          v-model="adminNotes"
          label="Admin notes (optional, internal only)"
          placeholder="Internal notes for reference..."
          :rows="2"
        />
      </div>
      <template #footer>
        <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="showDeclineModal = false">Cancel</button>
        <BaseButton variant="danger" :loading="actionLoading" @click="handleDecline">Decline & send email</BaseButton>
      </template>
    </BaseModal>
  </AdminLayout>
</template>
