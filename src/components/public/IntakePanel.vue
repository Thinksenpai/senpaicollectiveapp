<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { intakeApi } from '@/api'
import type { IntakeSnapshot } from '@/types'

const intake = ref<IntakeSnapshot | null>(null)

onMounted(async () => {
  try {
    const res = await intakeApi.getStatus()
    intake.value = res.data ?? null
  } catch {
    // A counter is not worth breaking the hero over. If it fails to load,
    // the panel stays hidden and the Apply CTA below it is unaffected.
    intake.value = null
  }
})

// Only shown while a cohort is actually taking applications. A closed intake
// renders nothing rather than a "0 days left" tombstone.
const visible = computed(() => intake.value?.is_open === true)

const closesLabel = computed(() => {
  const iso = intake.value?.closes_at
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
})

const daysLeft = computed(() => intake.value?.days_left ?? null)

// Past the target the cohort keeps taking people, so the seat count stops
// being the honest framing and the headcount takes over.
const seatsLabel = computed(() => {
  const i = intake.value
  if (!i) return ''
  return i.over_target ? `${i.accepted}` : `${i.spots_left}`
})
const seatsCaption = computed(() => {
  const i = intake.value
  if (!i) return ''
  return i.over_target ? 'Members accepted' : `Spots left of ${i.target_size}`
})
</script>

<template>
  <div v-if="visible && intake" class="max-w-md mx-auto">
    <div class="border border-gray-200 bg-white">
      <!-- Status line: which cohort, and that it is open right now. -->
      <div class="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100">
        <span class="relative flex h-2 w-2">
          <span class="absolute inline-flex h-full w-full bg-senpai-500 opacity-60 intake-ping" />
          <span class="relative inline-flex h-2 w-2 bg-senpai-500" />
        </span>
        <span class="text-xs font-medium tracking-wide uppercase text-gray-900">
          {{ intake.cohort_name }}
        </span>
        <span class="text-xs text-gray-400">·</span>
        <span class="text-xs text-gray-500">Intake open</span>
      </div>

      <!-- The two numbers that matter to someone deciding whether to apply. -->
      <div class="grid grid-cols-2 divide-x divide-gray-100 text-center">
        <div class="px-4 py-4">
          <div class="text-2xl font-bold text-gray-900 tabular-nums">{{ seatsLabel }}</div>
          <div class="mt-1 text-xs text-gray-500">{{ seatsCaption }}</div>
        </div>
        <div class="px-4 py-4">
          <div class="text-2xl font-bold text-gray-900 tabular-nums">
            {{ daysLeft ?? '—' }}
          </div>
          <div class="mt-1 text-xs text-gray-500">
            {{ daysLeft === 1 ? 'Day to apply' : 'Days to apply' }}
          </div>
        </div>
      </div>

      <div v-if="closesLabel" class="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
        <p class="text-xs text-gray-500">
          Applications close {{ closesLabel }}. Induction the same evening.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* A slow pulse on the status dot — the one moving thing, signalling "live"
   without competing with the photo strip above it. */
.intake-ping {
  animation: intake-ping 2.4s cubic-bezier(0, 0, 0.2, 1) infinite;
}
@keyframes intake-ping {
  0% { transform: scale(1); opacity: 0.6; }
  75%, 100% { transform: scale(2.4); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .intake-ping { animation: none; }
}
</style>
