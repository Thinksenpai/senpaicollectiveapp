<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { engineApi } from '@/api'
import type { Program } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const loading = ref(true)
const tracks = ref<Program[]>([])

onMounted(async () => {
  try {
    const res = await engineApi.listCircleTracks()
    tracks.value = res.data ?? []
  } finally {
    loading.value = false
  }
})

const circleLabel: Record<string, string> = {
  content: 'Content Circle',
  product: 'Product Circle',
  growth: 'Growth Circle'
}
function trackLabel(t: Program): string {
  return (t.circle && circleLabel[t.circle]) || t.circle || 'Track'
}

const byCircle = computed(() => {
  const groups: Record<string, Program[]> = {}
  for (const t of tracks.value) {
    const key = t.circle || 'other'
    groups[key] = groups[key] || []
    groups[key].push(t)
  }
  return groups
})
</script>

<template>
  <AppLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="mb-8">
        <p class="text-xs font-mono uppercase tracking-widest text-senpai-600">Structured on-ramps</p>
        <h1 class="text-2xl font-bold text-gray-900 mt-1">Programs</h1>
        <p class="text-sm text-gray-500 mt-1">
          Ordered tracks into each circle's work. Finish one and it's on your record.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-24"><LoadingSpinner size="lg" /></div>

      <div v-else-if="!tracks.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center">
        <p class="text-sm text-gray-500">No tracks published yet — check back as the circles set up their on-ramps.</p>
      </div>

      <div v-else class="space-y-8">
        <section v-for="(group, circle) in byCircle" :key="circle">
          <h2 class="text-[11px] font-mono uppercase tracking-widest text-gray-400 mb-2 px-1">
            // {{ circleLabel[circle] || circle }}
          </h2>
          <div class="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            <RouterLink
              v-for="t in group"
              :key="t.id"
              :to="`/programs/${t.id}`"
              class="flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div class="min-w-0 flex-1">
                <p class="font-medium text-gray-900">{{ t.name }}</p>
                <p v-if="t.description" class="text-sm text-gray-500 mt-0.5 line-clamp-2">{{ t.description }}</p>
              </div>
              <span class="text-[10px] font-mono text-gray-400 shrink-0 mt-1">{{ trackLabel(t) }}</span>
            </RouterLink>
          </div>
        </section>
      </div>
    </div>
  </AppLayout>
</template>
