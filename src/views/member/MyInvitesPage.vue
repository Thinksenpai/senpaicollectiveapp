<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useReviewsStore } from '@/stores/reviews'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { EnvelopeIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'

const reviewsStore = useReviewsStore()
const loading = ref(true)
const respondingId = ref<string | null>(null)

const pending = computed(() => reviewsStore.myInvites.filter((i) => i.status === 'pending'))
const decided = computed(() => reviewsStore.myInvites.filter((i) => i.status !== 'pending'))

async function respond(inviteId: string, accept: boolean) {
  if (!accept && !confirm('Decline this invite?')) return
  respondingId.value = inviteId
  try {
    await reviewsStore.respondToInvite(inviteId, accept)
  } finally {
    respondingId.value = null
  }
}

onMounted(async () => {
  try {
    await reviewsStore.fetchMyInvites()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-2">Someone wants you on their team</p>
        <h1 class="text-4xl font-black text-gray-900 leading-[1.3]">My Invites</h1>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <div v-if="!reviewsStore.myInvites.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
          <EnvelopeIcon class="mx-auto h-10 w-10 text-gray-300 mb-3" />
          <p class="text-sm text-gray-500">No invites yet.</p>
        </div>

        <div v-if="pending.length" class="space-y-3 mb-8">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Pending</h2>
          <div v-for="i in pending" :key="i.id" class="border border-gray-200 rounded-xl p-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <RouterLink :to="`/projects/${i.project_id}`" class="text-sm font-semibold text-gray-900 hover:text-senpai-700">
                  {{ i.project_title || 'A project' }}
                </RouterLink>
                <p v-if="i.job_role_name" class="text-xs text-gray-500 mt-0.5">as {{ i.job_role_name }}</p>
                <p v-if="i.inviter_name" class="text-xs text-gray-400 mt-0.5">Invited by {{ i.inviter_name }}</p>
                <p v-if="i.note" class="text-sm text-gray-600 mt-2 italic">"{{ i.note }}"</p>
              </div>
              <div class="flex items-center gap-2 shrink-0">
                <button
                  class="text-xs font-medium text-gray-500 hover:text-gray-700"
                  :disabled="respondingId === i.id"
                  @click="respond(i.id, false)"
                >Decline</button>
                <BaseButton size="sm" :loading="respondingId === i.id" @click="respond(i.id, true)">Accept</BaseButton>
              </div>
            </div>
          </div>
        </div>

        <div v-if="decided.length" class="space-y-2">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Past invites</h2>
          <div v-for="i in decided" :key="i.id" class="flex items-center justify-between gap-3 px-4 py-3 border border-gray-100 rounded-lg">
            <div class="min-w-0">
              <RouterLink :to="`/projects/${i.project_id}`" class="text-sm text-gray-700 hover:text-senpai-700 inline-flex items-center gap-1">
                {{ i.project_title || 'A project' }} <ArrowRightIcon class="h-3 w-3" />
              </RouterLink>
            </div>
            <span
              class="text-xs font-mono uppercase"
              :class="i.status === 'accepted' ? 'text-senpai-600' : 'text-gray-400'"
            >{{ i.status }}</span>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
