<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useReviewsStore } from '@/stores/reviews'
import { useSkillsStore } from '@/stores/skills'
import { membersApi } from '@/api'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const reviewsStore = useReviewsStore()
const skillsStore = useSkillsStore()

const loading = ref(true)
const toast = ref('')
function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

// Nominated skills only carry member_id + skill_name — no display name. Resolve
// names client-side; the queue is small enough that per-row lookups are fine.
const memberNames = reactive<Record<string, string>>({})
async function hydrateMemberNames() {
  const ids = [...new Set(reviewsStore.nominatedSkills.map((s) => s.member_id))].filter((id) => !(id in memberNames))
  await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await membersApi.getMember(id)
        memberNames[id] = res.data?.full_name || id
      } catch {
        memberNames[id] = id
      }
    })
  )
}

const confirmingKey = ref<string | null>(null)
function rowKey(memberId: string, skillId: number) {
  return `${memberId}:${skillId}`
}
async function confirm(memberId: string, skillId: number, memberName: string, skillName: string) {
  if (!window.confirm(`Confirm ${memberName} as verified in ${skillName}?`)) return
  confirmingKey.value = rowKey(memberId, skillId)
  try {
    const result = await reviewsStore.confirmSkillVerification(memberId, skillId)
    flash(result.success ? `${memberName} verified in ${skillName}` : result.error || 'Failed to confirm')
  } finally {
    confirmingKey.value = null
  }
}

// ---- seed-verify: bootstrap override for founding members, bypassing the
// normal review-threshold path entirely ----
const skillOptions = computed(() => skillsStore.skills.map((s) => ({ value: s.id, label: s.name })))
const seedMemberSearch = ref('')
const seedMemberResults = ref<{ id: string; full_name: string }[]>([])
const seedMemberId = ref<string | null>(null)
const seedMemberName = ref('')
const seedSkillId = ref<number | null>(null)
const seeding = ref(false)
let seedSearchTimeout: ReturnType<typeof setTimeout>
async function searchSeedMembers() {
  if (!seedMemberSearch.value.trim()) { seedMemberResults.value = []; return }
  const res = await membersApi.getMembers({ search: seedMemberSearch.value.trim(), limit: 8 })
  seedMemberResults.value = (res.data || []).map((m: any) => ({ id: m.id, full_name: m.full_name || m.profile?.full_name || '' }))
}
function onSeedSearchInput() {
  clearTimeout(seedSearchTimeout)
  seedSearchTimeout = setTimeout(searchSeedMembers, 300)
}
function pickSeedMember(m: { id: string; full_name: string }) {
  seedMemberId.value = m.id
  seedMemberName.value = m.full_name
  seedMemberSearch.value = m.full_name
  seedMemberResults.value = []
}
async function seedVerify() {
  if (!seedMemberId.value || !seedSkillId.value) return
  const skillName = skillsStore.getSkillName(seedSkillId.value)
  if (!window.confirm(`Bootstrap-verify ${seedMemberName.value} in ${skillName}? This skips the normal review-threshold path.`)) return
  seeding.value = true
  try {
    const result = await reviewsStore.seedVerifySkill(seedMemberId.value, seedSkillId.value)
    if (result.success) {
      flash(`${seedMemberName.value} seed-verified in ${skillName}`)
      seedMemberId.value = null
      seedMemberName.value = ''
      seedMemberSearch.value = ''
      seedSkillId.value = null
    } else {
      flash(result.error || 'Failed to seed-verify')
    }
  } finally {
    seeding.value = false
  }
}

onMounted(async () => {
  try {
    await Promise.all([reviewsStore.fetchNominatedSkills(), skillsStore.fetchSkills()])
    await hydrateMemberNames()
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <AdminLayout>
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <p class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-2">The confirmation step</p>
        <h1 class="text-4xl font-black text-gray-900 leading-[1.3]">Skill Verification</h1>
        <p class="text-gray-500 mt-2 max-w-md">The system nominates once thresholds trip — an admin confirms. Nothing verifies itself.</p>
      </div>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <template v-else>
        <div v-if="!reviewsStore.nominatedSkills.length" class="border border-dashed border-gray-300 rounded-xl p-10 text-center mb-10">
          <p class="text-sm text-gray-500">No skills pending confirmation right now.</p>
        </div>

        <div v-else class="border border-gray-200 divide-y divide-gray-100 rounded-xl overflow-hidden mb-10">
          <div
            v-for="s in reviewsStore.nominatedSkills"
            :key="rowKey(s.member_id, s.skill_id)"
            class="flex items-center justify-between gap-3 px-4 py-3"
          >
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 truncate">{{ memberNames[s.member_id] || s.member_id }}</p>
              <p class="text-xs text-gray-500">{{ s.skill_name }} · nominated</p>
            </div>
            <BaseButton
              size="sm"
              :loading="confirmingKey === rowKey(s.member_id, s.skill_id)"
              @click="confirm(s.member_id, s.skill_id, memberNames[s.member_id] || s.member_id, s.skill_name || 'this skill')"
            >
              Confirm verified
            </BaseButton>
          </div>
        </div>

        <div class="border-t border-gray-200 pt-8">
          <h2 class="text-lg font-bold text-gray-900 mb-1">Seed-verify (bootstrap override)</h2>
          <p class="text-sm text-gray-500 mb-4 max-w-md">Hand-verify a founding member directly, bypassing the review-threshold path. Use this to seed the first weighted raters — not a substitute for the normal flow.</p>
          <div class="border border-gray-200 rounded-xl p-5 space-y-4 max-w-sm">
            <div class="relative">
              <label class="block text-sm font-medium text-gray-700 mb-1">Member</label>
              <input
                v-model="seedMemberSearch"
                type="text"
                placeholder="Search by name…"
                class="w-full rounded-lg border border-gray-300 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-senpai-500 focus:border-senpai-500"
                @input="onSeedSearchInput"
              />
              <div v-if="seedMemberResults.length" class="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                <button
                  v-for="m in seedMemberResults"
                  :key="m.id"
                  type="button"
                  class="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                  @click="pickSeedMember(m)"
                >
                  {{ m.full_name }}
                </button>
              </div>
            </div>
            <BaseSelect v-model="seedSkillId" :options="skillOptions" label="Skill" placeholder="Select a skill" />
            <BaseButton :loading="seeding" :disabled="!seedMemberId || !seedSkillId" @click="seedVerify">Seed-verify</BaseButton>
          </div>
        </div>
      </template>
    </div>

    <div v-if="toast" class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{{ toast }}</div>
  </AdminLayout>
</template>
