<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { engineApi } from '@/api'
import type { Circle } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const loading = ref(true)
const circles = ref<Circle[]>([])

onMounted(async () => {
  try {
    const res = await engineApi.listCircles()
    circles.value = res.data ?? []
  } finally {
    loading.value = false
  }
})

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  proposed: 'bg-amber-50 text-amber-700 border-amber-200',
  dormant: 'bg-gray-100 text-gray-500 border-gray-200',
  closed: 'bg-gray-100 text-gray-400 border-gray-200'
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900">Circles</h1>
      <p class="mt-2 text-gray-600 max-w-2xl">
        The standing machines. A circle is a capped crew running one part of the collective
        with a charter, a cadence and metrics it exists to move — separate from a pod, which
        is where you belong, and a project team, which forms for one outcome and dissolves.
      </p>

      <LoadingSpinner v-if="loading" class="mt-10" />

      <p v-else-if="!circles.length" class="mt-10 text-sm text-gray-500">
        No circles yet.
      </p>

      <div v-else class="mt-8 space-y-4">
        <RouterLink
          v-for="c in circles"
          :key="c.id"
          :to="`/circles/${c.slug}`"
          class="block bg-white border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <h2 class="text-lg font-semibold text-gray-900">{{ c.name }}</h2>
                <span
                  class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                  :class="statusStyles[c.status] ?? statusStyles.dormant"
                >
                  {{ c.status }}
                </span>
              </div>
              <p v-if="c.tagline" class="mt-1 text-sm text-gray-600">{{ c.tagline }}</p>
            </div>

            <!-- Cadence is only meaningful once a circle is actually running.
                 Showing "off cadence" on a proposed circle would read as a
                 failure rather than a circle that has not started. -->
            <div v-if="c.status === 'active'" class="shrink-0 text-right">
              <span
                class="text-[10px] font-mono uppercase px-2 py-1 rounded"
                :class="c.cadence?.on_cadence
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'"
              >
                {{ c.cadence?.on_cadence ? 'On cadence' : 'Off cadence' }}
              </span>
              <p
                v-if="!c.cadence?.on_cadence && c.cadence?.days_since_call != null"
                class="mt-1 text-[11px] text-gray-500"
              >
                No call in {{ c.cadence.days_since_call }}d
              </p>
            </div>
          </div>

          <div class="mt-4 flex items-center gap-5 text-xs text-gray-500">
            <span>
              <strong class="text-gray-900">{{ c.seat_count }}</strong>
              <span v-if="c.seat_cap">/{{ c.seat_cap }}</span>
              {{ c.seat_count === 1 ? 'seat' : 'seats' }}
            </span>
            <span>
              <strong class="text-gray-900">{{ c.open_tasks }}</strong>
              open {{ c.open_tasks === 1 ? 'task' : 'tasks' }}
            </span>
            <span v-if="c.lead_name">Led by {{ c.lead_name }}</span>
          </div>

          <p v-if="c.status === 'proposed'" class="mt-3 text-xs text-amber-700">
            Not yet running. Its charter sets out what has to be true before it opens seats.
          </p>
        </RouterLink>
      </div>
    </div>
  </AppLayout>
</template>
