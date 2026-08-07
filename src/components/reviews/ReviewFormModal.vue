<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { reviewsApi } from '@/api'
import type { ReviewSourceType, SoftDimension, JobRoleSkill } from '@/types'
import BaseModal from '@/components/common/BaseModal.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'

// Shared review-submission modal — scores the seat's job-role recipe skills
// plus the 3 fixed soft-skill dimensions. v1 scope: recipe skills only, no
// ad-hoc extra skills (that's the "work reveals talent" auto-claim path,
// which still works server-side for future review types — just not exposed
// as a form control here yet).
interface Props {
  show: boolean
  sourceType: ReviewSourceType
  sourceId: string
  rateeId: string
  rateeName?: string
  jobRoleId?: number | null
}
const props = defineProps<Props>()
const emit = defineEmits<{ close: []; submitted: [] }>()

const softDimensions: { key: SoftDimension; label: string }[] = [
  { key: 'collaboration', label: 'Collaboration' },
  { key: 'communication', label: 'Communication' },
  { key: 'reliability', label: 'Reliability' }
]

const loadingRecipe = ref(false)
const recipeSkills = ref<JobRoleSkill[]>([])
const skillScores = reactive<Record<number, number>>({})
const softScores = reactive<Record<SoftDimension, number>>({ collaboration: 4, communication: 4, reliability: 4 })
const comment = ref('')
const submitting = ref(false)
const error = ref('')

async function loadRecipe() {
  recipeSkills.value = []
  for (const k of Object.keys(skillScores)) delete skillScores[Number(k)]
  if (!props.jobRoleId) return
  loadingRecipe.value = true
  try {
    const res = await reviewsApi.getJobRole(props.jobRoleId)
    recipeSkills.value = res.data?.skills || []
    for (const s of recipeSkills.value) skillScores[s.skill_id] = 4
  } finally {
    loadingRecipe.value = false
  }
}

watch(() => [props.show, props.jobRoleId], ([show]) => {
  if (show) {
    comment.value = ''
    softScores.collaboration = 4
    softScores.communication = 4
    softScores.reliability = 4
    error.value = ''
    loadRecipe()
  }
})

async function submit() {
  error.value = ''
  if (!recipeSkills.value.length) {
    error.value = "This seat isn't tagged with a job role, so there's nothing to score yet."
    return
  }
  submitting.value = true
  try {
    const res = await reviewsApi.submitReview({
      source_type: props.sourceType,
      source_id: props.sourceId,
      ratee_id: props.rateeId,
      job_role_id: props.jobRoleId ?? undefined,
      comment: comment.value.trim() || undefined,
      skill_scores: recipeSkills.value.map((s) => ({ skill_id: s.skill_id, score: skillScores[s.skill_id] ?? 4, in_recipe: true })),
      soft_scores: softDimensions.map((d) => ({ dimension: d.key, score: softScores[d.key] }))
    })
    if (res.status) {
      emit('submitted')
      emit('close')
    } else {
      error.value = res.message || 'Failed to submit review'
    }
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Failed to submit review'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <BaseModal :show="show" :title="rateeName ? `Rate ${rateeName}` : 'Submit a review'" @close="emit('close')">
    <div class="space-y-5">
      <BaseAlert v-if="error" type="error">{{ error }}</BaseAlert>

      <div v-if="loadingRecipe" class="text-sm text-gray-400 py-4 text-center">Loading recipe…</div>

      <template v-else>
        <div v-if="!recipeSkills.length" class="text-sm text-gray-500">
          This seat isn't tagged with a job role, so there's nothing to score yet.
        </div>

        <div v-else class="space-y-4">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Skills</p>
          <div v-for="s in recipeSkills" :key="s.skill_id">
            <div class="flex items-center justify-between mb-1">
              <label class="text-sm font-medium text-gray-700">{{ s.skill_name }}<span v-if="!s.required" class="text-gray-400 font-normal"> (bonus)</span></label>
              <span class="text-sm font-mono text-senpai-600">{{ skillScores[s.skill_id] }}/5</span>
            </div>
            <input v-model.number="skillScores[s.skill_id]" type="range" min="1" max="5" step="1" class="w-full accent-senpai-600" />
          </div>
        </div>

        <div class="space-y-4 pt-2 border-t border-gray-100">
          <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">Working with them</p>
          <div v-for="d in softDimensions" :key="d.key">
            <div class="flex items-center justify-between mb-1">
              <label class="text-sm font-medium text-gray-700">{{ d.label }}</label>
              <span class="text-sm font-mono text-senpai-600">{{ softScores[d.key] }}/5</span>
            </div>
            <input v-model.number="softScores[d.key]" type="range" min="1" max="5" step="1" class="w-full accent-senpai-600" />
          </div>
        </div>

        <BaseTextarea v-model="comment" label="Comment (optional)" :rows="3" placeholder="Anything worth noting about the work…" />
      </template>
    </div>
    <template #footer>
      <button class="px-4 py-2 text-sm text-gray-600 hover:text-gray-900" @click="emit('close')">Cancel</button>
      <BaseButton :loading="submitting" :disabled="loadingRecipe || !recipeSkills.length" @click="submit">Submit review</BaseButton>
    </template>
  </BaseModal>
</template>
