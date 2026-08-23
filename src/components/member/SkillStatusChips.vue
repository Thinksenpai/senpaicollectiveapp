<script setup lang="ts">
import { ref, watch } from 'vue'
import { reviewsApi } from '@/api'
import type { MemberSkill, MemberSkillStatus } from '@/types'

// Read-only skill-verification status for a member — claimed/nominated/verified
// pills. Self-contained: given a memberId it fetches its own data, so any
// profile layout can drop it in without wiring up loading state itself.
interface Props {
  memberId: string
}
const props = defineProps<Props>()

const skills = ref<MemberSkill[]>([])
const loading = ref(true)

const statusStyle: Record<MemberSkillStatus, string> = {
  claimed: 'bg-gray-100 text-gray-600',
  nominated: 'bg-amber-50 text-amber-700',
  verified: 'bg-green-50 text-green-700',
  dormant: 'bg-gray-50 text-gray-400'
}

async function load() {
  loading.value = true
  try {
    const res = await reviewsApi.getMemberSkillsVerification(props.memberId)
    // dormant skills are a later availability flag, not part of the v1 flow —
    // don't clutter the profile with them.
    skills.value = (res.data || []).filter((s) => s.status !== 'dormant')
  } finally {
    loading.value = false
  }
}

watch(() => props.memberId, load, { immediate: true })
</script>

<template>
  <div v-if="!loading && skills.length" class="py-6 border-b border-gray-200">
    <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1">Skill verification</h2>
    <p class="text-xs text-gray-400 mb-3">Verified skills are earned through reviewed work — never self-assigned.</p>

    <div class="space-y-2">
      <div v-for="s in skills" :key="s.skill_id" class="flex flex-wrap items-center gap-2">
        <span :class="['inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium', statusStyle[s.status]]">
          {{ s.skill_name }}
          <span class="text-xs opacity-75">· {{ s.status }}</span>
        </span>

        <!-- Progress is only meaningful before verification. Showing how far off
             a skill is turns verification from an opaque event into something
             a member can actually chase. -->
        <span v-if="s.progress && s.status !== 'verified'" class="text-xs text-gray-500 font-mono">
          {{ s.progress.contribution_count }}/{{ s.progress.required_contributions }} reviewed
          · {{ s.progress.distinct_raters }}/{{ s.progress.required_raters }} raters
          <template v-if="s.progress.contribution_count > 0">
            · avg {{ s.progress.weighted_avg_score.toFixed(1) }}/{{ s.progress.required_avg_score }}
          </template>
          <span v-if="!s.progress.has_verified_rater && s.progress.contribution_count > 0" class="text-amber-600">
            · needs a verified reviewer
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
