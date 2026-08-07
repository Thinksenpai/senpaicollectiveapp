<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { reviewsApi } from '@/api'
import type { Review, SoftDimension } from '@/types'
import { ChevronDownIcon, UsersIcon, ChatBubbleLeftRightIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

// Read-only history of reviews a member has received — rater, per-skill
// scores, soft-skill scores, and any comment. Self-contained, same pattern
// as SkillStatusChips: fetches its own data given a memberId.
//
// Collapsed by default, but the collapsed header itself is a real summary
// (average skill score + averaged soft-skill dimensions) rather than a bare
// "Reviews received" label, so there's something to see before expanding.
interface Props {
  memberId: string
}
const props = defineProps<Props>()

const reviews = ref<Review[]>([])
const loading = ref(true)
const expanded = ref(false)

const softLabels: Record<SoftDimension, string> = {
  collaboration: 'Collaboration',
  communication: 'Communication',
  reliability: 'Reliability'
}
const softIcons: Record<SoftDimension, typeof UsersIcon> = {
  collaboration: UsersIcon,
  communication: ChatBubbleLeftRightIcon,
  reliability: ShieldCheckIcon
}

const averageScore = computed(() => {
  const all = reviews.value.flatMap((r) => (r.skill_scores || []).map((s) => s.score))
  if (!all.length) return null
  return (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1)
})

const softAverages = computed(() => {
  const buckets: Record<string, number[]> = {}
  for (const r of reviews.value) {
    for (const s of r.soft_scores || []) {
      ;(buckets[s.dimension] ||= []).push(s.score)
    }
  }
  return (['collaboration', 'communication', 'reliability'] as SoftDimension[])
    .filter((d) => buckets[d]?.length)
    .map((d) => {
      const scores = buckets[d]!
      return { dimension: d, avg: (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) }
    })
})

async function load() {
  loading.value = true
  try {
    const res = await reviewsApi.getMemberReviews(props.memberId)
    reviews.value = res.data || []
  } finally {
    loading.value = false
  }
}

watch(() => props.memberId, load, { immediate: true })
</script>

<template>
  <div v-if="!loading && reviews.length" class="py-6 border-b border-gray-200">
    <button type="button" class="flex items-center justify-between w-full mb-1" @click="expanded = !expanded">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Reviews received</h2>
      <ChevronDownIcon class="h-4 w-4 text-gray-400 transition-transform" :class="expanded ? 'rotate-180' : ''" />
    </button>

    <button type="button" class="w-full text-left" @click="expanded = !expanded">
      <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2">
        <span v-if="averageScore" class="text-sm font-semibold text-gray-900">{{ averageScore }}/5 <span class="font-normal text-gray-400">· {{ reviews.length }} review{{ reviews.length === 1 ? '' : 's' }}</span></span>
        <span v-for="s in softAverages" :key="s.dimension" class="inline-flex items-center gap-1 text-xs text-gray-500">
          <component :is="softIcons[s.dimension]" class="h-3.5 w-3.5 text-gray-400" />
          {{ softLabels[s.dimension] }} {{ s.avg }}
        </span>
      </div>
    </button>

    <div v-if="expanded" class="space-y-4 mt-4">
      <div v-for="r in reviews" :key="r.id" class="border border-gray-200 rounded-xl p-4">
        <div class="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-gray-100">
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-900">
              {{ r.job_role_name || 'Work review' }}
            </p>
            <RouterLink v-if="r.work_url" :to="r.work_url" class="text-xs text-senpai-600 hover:text-senpai-700 hover:underline truncate block">
              {{ r.work_title || (r.source_type === 'project' ? 'View project' : 'View task') }}
            </RouterLink>
            <p v-else class="text-xs text-gray-400">{{ r.source_type === 'project' ? 'Project' : 'Task' }} work</p>
          </div>
          <p class="text-xs text-gray-400 shrink-0">{{ new Date(r.created_at).toLocaleDateString() }}</p>
        </div>

        <div v-if="r.skill_scores?.length" class="mb-3">
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Skill ratings</p>
          <div class="space-y-1.5">
            <div v-for="s in r.skill_scores" :key="s.skill_id" class="flex items-center gap-2">
              <span class="text-sm text-gray-700 w-32 shrink-0 truncate">{{ s.skill_name }}<span v-if="!s.in_recipe" class="text-gray-400"> (bonus)</span></span>
              <span class="flex items-center gap-0.5">
                <span v-for="n in 5" :key="n" class="h-2 w-2 rounded-full" :class="n <= s.score ? 'bg-senpai-500' : 'bg-gray-200'" />
              </span>
              <span class="text-xs font-mono text-gray-400">{{ s.score }}/5</span>
            </div>
          </div>
        </div>

        <div v-if="r.soft_scores?.length" class="mb-3">
          <p class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Working with them</p>
          <div class="flex flex-wrap gap-x-5 gap-y-1.5">
            <span v-for="s in r.soft_scores" :key="s.dimension" class="inline-flex items-center gap-1.5">
              <component :is="softIcons[s.dimension]" class="h-4 w-4 text-gray-400" />
              <span class="text-xs text-gray-700">{{ softLabels[s.dimension] }}</span>
              <span class="flex items-center gap-0.5">
                <span v-for="n in 5" :key="n" class="h-1.5 w-1.5 rounded-full" :class="n <= s.score ? 'bg-senpai-500' : 'bg-gray-200'" />
              </span>
            </span>
          </div>
        </div>

        <blockquote v-if="r.comment" class="text-sm text-gray-700 leading-relaxed border-l-2 border-senpai-200 pl-3 mt-3">
          "{{ r.comment }}"
        </blockquote>

        <p class="text-xs text-gray-400 mt-3">— {{ r.rater_name || 'A teammate' }}</p>
      </div>
    </div>
  </div>
</template>
