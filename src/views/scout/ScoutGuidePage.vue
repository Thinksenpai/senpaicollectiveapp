<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { scoutsApi } from '@/api'
import type { MyScoutRequestStatus } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { SparklesIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/vue/24/outline'

const loading = ref(true)
const status = ref<MyScoutRequestStatus | null>(null)
const requesting = ref(false)
const toast = ref('')

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

onMounted(async () => {
  try {
    const res = await scoutsApi.getMyRequestStatus()
    status.value = res.data ?? null
  } finally {
    loading.value = false
  }
})

async function apply() {
  requesting.value = true
  try {
    const res = await scoutsApi.requestToBecomeScout()
    if (res.status) {
      flash("Request sent — we'll review it soon")
      status.value = { is_scout: false, has_pending: true }
    } else {
      flash(res.message || 'Failed to send request')
    }
  } catch (e: any) {
    flash(e.response?.data?.message || 'Failed to send request')
  } finally {
    requesting.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">// Scout guide</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Bringing people into the collective</h1>
        <p class="mt-2 text-gray-600">
          A Scout invites people whose work and values would raise the bar here — not just fill a seat.
          This page covers what we're actually looking for, how to reach out well, and what happens after.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-12"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <!-- CTA card — one of three states -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div v-if="status?.is_scout" class="flex items-center justify-between gap-4">
            <div class="flex items-center gap-2 text-senpai-700">
              <SparklesIcon class="h-5 w-5" />
              <span class="font-medium">You're already a Scout.</span>
            </div>
            <RouterLink to="/scout" class="text-sm font-medium text-senpai-600 hover:text-senpai-700 shrink-0">Go to your dashboard &rarr;</RouterLink>
          </div>
          <div v-else-if="status?.has_pending" class="flex items-center gap-2 text-amber-600">
            <CheckCircleIcon class="h-5 w-5" />
            <span class="font-medium">Your request is in — an admin will review it soon.</span>
          </div>
          <div v-else-if="status?.last_status === 'declined'" class="space-y-3">
            <div class="flex items-center gap-2 text-gray-500">
              <XCircleIcon class="h-5 w-5" />
              <span class="font-medium">Your last request wasn't approved.</span>
            </div>
            <BaseButton :loading="requesting" @click="apply">Request again</BaseButton>
          </div>
          <div v-else class="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p class="font-medium text-gray-900">Think you'd be a good Scout?</p>
              <p class="text-sm text-gray-500 mt-0.5">One click — an admin reviews it, no forms.</p>
            </div>
            <BaseButton :loading="requesting" @click="apply">Apply to be a Scout</BaseButton>
          </div>
        </div>

        <div class="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">What we're looking for</h2>
            <p>
              We hold a high bar for who joins — every recruit reflects on you as much as them. Look for people
              already doing real work: shipping, building, writing, designing — not just talking about it. The
              collective's whole premise is that Africa's future systems get built by <em>us</em>; a good recruit
              is someone who'd add to that, not just consume it.
            </p>
          </section>

          <section>
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">How to actually recruit</h2>
            <ul class="space-y-2">
              <li class="flex items-start gap-2">
                <CheckCircleIcon class="h-5 w-5 mr-1 shrink-0 text-senpai-500" />
                Invite people whose work you've personally seen and admire — not a mass blast to your whole contact list.
              </li>
              <li class="flex items-start gap-2">
                <CheckCircleIcon class="h-5 w-5 mr-1 shrink-0 text-senpai-500" />
                Share the link over a personal DM, with a line on why you thought of them specifically.
              </li>
              <li class="flex items-start gap-2">
                <CheckCircleIcon class="h-5 w-5 mr-1 shrink-0 text-senpai-500" />
                Focus on quality over quantity — your Scout score rewards approval rate, not invite volume.
              </li>
              <li class="flex items-start gap-2">
                <CheckCircleIcon class="h-5 w-5 mr-1 shrink-0 text-senpai-500" />
                Add a note on each recruit from your dashboard — it gives admins real context during review.
              </li>
            </ul>
          </section>

          <section>
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">What happens after you invite someone</h2>
            <p class="mb-2">
              They click your link, register, and their application goes through the same review as anyone else's —
              scouting gets someone a look, not a pass. Once reviewed:
            </p>
            <ul class="space-y-2">
              <li><strong class="text-gray-900">Approved</strong> — they're in, and it counts toward your Scout score.</li>
              <li><strong class="text-gray-900">Declined</strong> — no penalty for one miss, but a pattern of declines will bring your score down.</li>
            </ul>
            <p class="mt-2 text-sm text-gray-500">
              Your score is your approval rate, scaled down until you have a real track record (five registered
              recruits) — so one lucky or unlucky outcome early on can't swing it to either extreme.
            </p>
          </section>

          <section>
            <h2 class="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-2">Do's and don'ts</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="bg-senpai-50 rounded-xl p-4">
                <p class="text-xs font-mono uppercase tracking-widest text-senpai-700 mb-2">Do</p>
                <ul class="text-sm space-y-1.5 text-gray-700">
                  <li>Vouch for people you'd stake your own reputation on</li>
                  <li>Set expectations before they apply — what this actually is</li>
                  <li>Keep inviting even after a decline, one miss isn't a trend</li>
                </ul>
              </div>
              <div class="bg-gray-50 rounded-xl p-4">
                <p class="text-xs font-mono uppercase tracking-widest text-gray-500 mb-2">Don't</p>
                <ul class="text-sm space-y-1.5 text-gray-700">
                  <li>Post your invite link publicly or in group chats</li>
                  <li>Invite people just to inflate your invite count</li>
                  <li>Promise anyone an automatic approval — it's never that</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </template>
    </div>

    <transition enter-from-class="opacity-0 translate-y-2" enter-active-class="transition duration-200" leave-active-class="transition duration-200" leave-to-class="opacity-0 translate-y-2">
      <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
    </transition>
  </AppLayout>
</template>
