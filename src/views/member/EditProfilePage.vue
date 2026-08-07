<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { membersApi, engineApi, skillsApi } from '@/api'
import type { WorkStatus, SchoolStatus, EnrichmentPayload, Skill } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import {
  UserCircleIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)
const errors = ref<Record<string, string>>({})
const photoUploading = ref(false)
const photoInput = ref<HTMLInputElement | null>(null)

const profile = computed(() => authStore.member?.profile)
const member = computed(() => authStore.member)

// Skills — self-declared after joining too, not just at application. This is
// the only unlock for claiming open tasks tagged with a role picked up later.
const allSkills = ref<Skill[]>([])
const skillBusyId = ref<number | null>(null)
const addSkillId = ref('')
const mySkillIds = computed(() => new Set((member.value?.skills ?? []).map((s) => s.id)))
const addableSkills = computed(() => allSkills.value.filter((s) => !mySkillIds.value.has(s.id)))

skillsApi.getSkills().then((res) => { allSkills.value = res.data ?? [] }).catch(() => {})

async function addSkill() {
  if (!addSkillId.value) return
  const id = Number(addSkillId.value)
  skillBusyId.value = id
  try {
    await skillsApi.addMySkill(id)
    await authStore.fetchCurrentMember()
    addSkillId.value = ''
  } finally {
    skillBusyId.value = null
  }
}
async function removeSkill(id: number) {
  skillBusyId.value = id
  try {
    await skillsApi.removeMySkill(id)
    await authStore.fetchCurrentMember()
  } finally {
    skillBusyId.value = null
  }
}
async function makePrimary(id: number) {
  skillBusyId.value = id
  try {
    await skillsApi.setMyPrimarySkill(id)
    await authStore.fetchCurrentMember()
  } finally {
    skillBusyId.value = null
  }
}

const experienceLevelOptions = [
  { value: 'none', label: 'No professional experience' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-level (2-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' }
]

const form = ref({
  full_name: '',
  first_name: '',
  middle_name: '',
  last_name: '',
  phone: '',
  city: '',
  country: '',
  photo_url: '',
  bio: '',
  goal: '',
  work_status: '' as WorkStatus | '',
  school_status: '' as SchoolStatus | '',
  school_name: '',
  timezone: '',
  date_of_birth: '',
  mbti: '',
  job_title: '',
  organization: '',
  weekly_commitment_hours: '' as number | '',
  languages: '',
  gender: '',
  recent_work: '',
  unique_view: '',
  portfolio_url: '',
  additional_links: [{ label: '', url: '' }] as { label: string; url: string }[],
  // Self-described, not verified — same status as self-declared skills.
  experience_level: '' as string
})

const timezoneOptions = [
  'Africa/Lagos', 'Africa/Accra', 'Africa/Abidjan', 'Africa/Nairobi', 'Africa/Cairo',
  'Africa/Johannesburg', 'Africa/Kigali', 'Africa/Casablanca', 'Europe/London',
  'Europe/Berlin', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Asia/Dubai'
].map((t) => ({ value: t, label: t }))
const workStatusOptions = [
  { value: 'student', label: 'Student' },
  { value: 'employed', label: 'Employed' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'founder', label: 'Founder, building' },
  { value: 'between_roles', label: 'Between roles' },
  { value: 'other', label: 'Other' }
]
const schoolStatusOptions = [
  { value: 'not_student', label: 'Not a student' },
  { value: 'undergrad', label: 'Undergrad' },
  { value: 'postgrad', label: 'Postgrad' },
  { value: 'bootcamp', label: 'Bootcamp / self-taught' },
  { value: 'graduated', label: 'Graduated' },
  { value: 'dropout', label: 'Dropped out' }
]
const mbtiOptions = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
].map((t) => ({ value: t, label: t }))

const showSchoolName = computed(() => !!form.value.school_status && form.value.school_status !== 'not_student')

onMounted(async () => {
  if (profile.value) {
    const p = profile.value
    form.value.full_name = p.full_name || ''
    // Fallback for any profile that somehow still has parts unset (should be
    // rare — the backend backfills these — but a blank name field reads as
    // data loss, so split full_name client-side rather than show empty boxes.
    if (p.first_name || p.last_name) {
      form.value.first_name = p.first_name || ''
      form.value.middle_name = p.middle_name || ''
      form.value.last_name = p.last_name || ''
    } else if (p.full_name) {
      const parts = p.full_name.trim().split(/\s+/)
      form.value.first_name = parts[0] || ''
      form.value.last_name = parts.length > 1 ? (parts[parts.length - 1] ?? '') : ''
      form.value.middle_name = parts.length > 2 ? parts.slice(1, -1).join(' ') : ''
    }
    form.value.phone = p.phone || ''
    form.value.city = p.city || ''
    form.value.country = p.country || ''
    form.value.photo_url = p.photo_url || ''
    form.value.bio = p.bio || ''
    form.value.recent_work = p.recent_work || ''
    form.value.unique_view = p.unique_view || ''
    form.value.portfolio_url = p.portfolio_url || ''
    form.value.experience_level = p.experience_level || ''
    form.value.additional_links = p.additional_links && p.additional_links.length > 0
      ? p.additional_links.map((link) => ({
          label: typeof link === 'string' ? '' : (link.label || ''),
          url: typeof link === 'string' ? link : link.url
        }))
      : [{ label: '', url: '' }]
  }

  try {
    const res = await engineApi.getEnrichment()
    const e = res.data
    if (e) {
      form.value.goal = e.goal || ''
      form.value.timezone = e.timezone || ''
      form.value.date_of_birth = e.date_of_birth ? e.date_of_birth.slice(0, 10) : ''
      form.value.work_status = (e.work_status as WorkStatus) || ''
      form.value.school_status = (e.school_status as SchoolStatus) || ''
      form.value.school_name = e.school_name || ''
      form.value.mbti = e.mbti || ''
      form.value.job_title = e.job_title || ''
      form.value.organization = e.organization || ''
      form.value.weekly_commitment_hours = e.weekly_commitment_hours ?? ''
      form.value.languages = e.languages || ''
      form.value.gender = e.gender || ''
    }
  } catch {
    // no enrichment yet — the form just starts empty
  }
})

function validate(): boolean {
  errors.value = {}
  if (!form.value.first_name || form.value.first_name.length < 1) {
    errors.value.first_name = 'First name is required'
  }
  if (!form.value.last_name || form.value.last_name.length < 1) {
    errors.value.last_name = 'Last name is required'
  }
  if (!form.value.city || form.value.city.length < 2) {
    errors.value.city = 'City is required'
  }
  if (!form.value.country || form.value.country.length < 2) {
    errors.value.country = 'Country is required'
  }
  if (!form.value.bio || form.value.bio.length < 10) {
    errors.value.bio = 'Bio must be at least 10 characters'
  }
  if (form.value.portfolio_url && !/^https?:\/\/.+/.test(ensureHttps(form.value.portfolio_url))) {
    errors.value.portfolio_url = 'Please enter a valid URL'
  }
  return Object.keys(errors.value).length === 0
}

function ensureHttps(url: string): string {
  if (!url) return url
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

function addLink() {
  if (form.value.additional_links.length < 5) {
    form.value.additional_links.push({ label: '', url: '' })
  }
}
function removeLink(index: number) {
  if (form.value.additional_links.length > 1) {
    form.value.additional_links.splice(index, 1)
  }
}

async function save() {
  if (!validate()) {
    error.value = 'Please fix the highlighted fields'
    return
  }
  loading.value = true
  error.value = null
  try {
    const additionalLinks = form.value.additional_links
      .filter((l) => l.url.trim() !== '')
      .map((l) => ({ label: l.label.trim() || undefined, url: ensureHttps(l.url) }))

    await membersApi.updateMe({
      first_name: form.value.first_name.trim(),
      middle_name: form.value.middle_name.trim() || undefined,
      last_name: form.value.last_name.trim(),
      phone: form.value.phone || undefined,
      city: form.value.city,
      country: form.value.country,
      bio: form.value.bio,
      recent_work: form.value.recent_work || undefined,
      unique_view: form.value.unique_view || undefined,
      portfolio_url: form.value.portfolio_url ? ensureHttps(form.value.portfolio_url) : undefined,
      additional_links: additionalLinks.length > 0 ? additionalLinks : undefined,
      photo_url: form.value.photo_url || undefined,
      experience_level: form.value.experience_level || undefined
    })

    const enrichmentPayload: EnrichmentPayload = {
      goal: form.value.goal || undefined,
      timezone: form.value.timezone || undefined,
      date_of_birth: form.value.date_of_birth ? new Date(form.value.date_of_birth).toISOString() : undefined,
      work_status: (form.value.work_status || undefined) as WorkStatus | undefined,
      school_status: (form.value.school_status || undefined) as SchoolStatus | undefined,
      school_name: showSchoolName.value && form.value.school_name ? form.value.school_name : undefined,
      mbti: form.value.mbti || undefined,
      job_title: form.value.job_title || undefined,
      organization: form.value.organization || undefined,
      weekly_commitment_hours: form.value.weekly_commitment_hours === '' ? undefined : Number(form.value.weekly_commitment_hours),
      languages: form.value.languages || undefined,
      gender: form.value.gender || undefined
    }
    await engineApi.saveEnrichment(enrichmentPayload)

    await authStore.fetchCurrentMember()
    success.value = true
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to update your profile'
  } finally {
    loading.value = false
  }
}

function goBack() {
  router.push('/profile')
}

function pickPhoto() {
  photoInput.value?.click()
}

async function onPhotoSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoUploading.value = true
  error.value = null
  try {
    const res = await membersApi.uploadPhoto(file)
    form.value.photo_url = res.data!.url
    await authStore.fetchCurrentMember()
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to upload photo'
  } finally {
    photoUploading.value = false
    if (photoInput.value) photoInput.value.value = ''
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Edit your profile</h1>
        <button class="text-sm text-gray-500 hover:text-gray-700" @click="goBack">Done</button>
      </div>

      <BaseAlert v-if="success" type="success" class="mb-6" dismissible @dismiss="success = false">
        Profile updated.
      </BaseAlert>
      <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
        {{ error }}
      </BaseAlert>

      <form class="space-y-12" @submit.prevent="save">
        <!-- 1. Photo & basics -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Photo & basics</h2>
          <div class="flex items-center gap-4">
            <div v-if="form.photo_url" class="h-20 w-20 rounded-full overflow-hidden bg-gray-100 shrink-0">
              <img :src="form.photo_url" :alt="form.full_name" class="h-full w-full object-cover" />
            </div>
            <div v-else class="h-20 w-20 rounded-full bg-senpai-100 flex items-center justify-center shrink-0">
              <UserCircleIcon class="h-12 w-12 text-senpai-400" />
            </div>
            <div class="flex-1">
              <input
                ref="photoInput"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                class="hidden"
                @change="onPhotoSelected"
              />
              <BaseButton type="button" variant="secondary" :loading="photoUploading" @click="pickPhoto">
                {{ form.photo_url ? 'Change photo' : 'Upload photo' }}
              </BaseButton>
              <p class="text-xs text-gray-500 mt-1.5">JPEG, PNG, GIF or WebP. Max 5MB.</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <BaseInput v-model="form.first_name" label="First name" :error="errors.first_name" required />
            <BaseInput v-model="form.middle_name" label="Middle name (optional)" />
            <BaseInput v-model="form.last_name" label="Last name" :error="errors.last_name" required />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.city" label="City" :error="errors.city" required />
            <BaseInput v-model="form.country" label="Country" :error="errors.country" required />
          </div>
          <BaseInput v-model="form.phone" label="Phone / WhatsApp" placeholder="+234123456789" />
        </section>

        <!-- 2. About -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h2>
          <BaseTextarea v-model="form.bio" label="Bio" placeholder="Tell us about yourself, your background, and what you're passionate about." :maxlength="500" :rows="4" :error="errors.bio" required />
          <BaseTextarea v-model="form.unique_view" label="Unique view" placeholder="Share your perspective, philosophy, or approach to creativity and work. What drives you?" :maxlength="1000" :rows="4" />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.mbti" :options="mbtiOptions" label="Personality type (MBTI)" placeholder="Select if you know it" />
            <BaseInput v-model="form.date_of_birth" type="date" label="Date of birth" name="bday" autocomplete="bday" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.languages" label="Languages" placeholder="English, Igbo, French" />
            <BaseInput v-model="form.gender" label="Gender (optional)" placeholder="Self-describe" />
          </div>
        </section>

        <!-- 3. Education -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Education</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.school_status" :options="schoolStatusOptions" label="School status" placeholder="Select" />
            <BaseInput v-if="showSchoolName" v-model="form.school_name" label="Which school?" placeholder="University of Lagos" />
          </div>
        </section>

        <!-- 5. Work -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Work</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.job_title" label="Current role" placeholder="Product Designer" />
            <BaseInput v-model="form.organization" label="Organization" placeholder="Where you work" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.work_status" :options="workStatusOptions" label="Work status" placeholder="Select" />
            <BaseInput v-model="form.weekly_commitment_hours" type="number" label="Hours/week you can commit" placeholder="5" />
          </div>
          <BaseSelect v-model="form.timezone" :options="timezoneOptions" label="Timezone" placeholder="Select your timezone" />
          <BaseTextarea v-model="form.recent_work" label="Building" placeholder="Tell us about your recent projects, work, or creative endeavors. What are you most proud of?" :maxlength="1000" :rows="4" />
        </section>

        <!-- 6. Skills & experience — editable; adding a skill unlocks claiming open tasks tagged with it -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Skills & experience</h2>

          <BaseSelect v-model="form.experience_level" :options="experienceLevelOptions" label="Experience level" placeholder="Select" />
          <p class="text-xs text-gray-400 -mt-3">Self-described — not a verified rating.</p>

          <div>
            <div v-if="member?.skills && member.skills.length > 0" class="flex flex-wrap gap-2 mb-3">
              <span
                v-for="skill in member.skills"
                :key="skill.id"
                :class="[
                  'inline-flex items-center gap-1.5 pl-3 pr-2 py-1 rounded-full text-sm font-medium',
                  skill.id === profile?.primary_skill_id ? 'bg-senpai-100 text-senpai-700' : 'bg-gray-100 text-gray-700'
                ]"
              >
                <button
                  v-if="skill.id !== profile?.primary_skill_id"
                  type="button"
                  class="hover:underline"
                  :disabled="skillBusyId === skill.id"
                  @click="makePrimary(skill.id)"
                >{{ skill.name }}</button>
                <span v-else>{{ skill.name }} ★</span>
                <button
                  type="button"
                  class="text-current opacity-50 hover:opacity-100"
                  :disabled="skillBusyId === skill.id"
                  title="Remove"
                  @click="removeSkill(skill.id)"
                >
                  <XMarkIcon class="h-3.5 w-3.5" />
                </button>
              </span>
            </div>
            <p v-else class="text-sm text-gray-400 mb-3">No skills yet — add one below.</p>

            <div class="flex items-center gap-2">
              <select v-model="addSkillId" class="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                <option value="">Add a skill…</option>
                <option v-for="s in addableSkills" :key="s.id" :value="String(s.id)">{{ s.name }}</option>
              </select>
              <BaseButton variant="outline" :disabled="!addSkillId" :loading="skillBusyId === Number(addSkillId)" @click="addSkill">
                <PlusIcon class="h-4 w-4" />
              </BaseButton>
            </div>
            <p class="text-xs text-gray-400 mt-2">Click a skill to make it primary. Skills tag your work and unlock matching open tasks.</p>
          </div>
        </section>

        <!-- 7. Your goal -->
        <section class="space-y-3">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Your goal</h2>
          <BaseTextarea
            v-model="form.goal"
            label="What does success look like for you in the next 1–3 years?"
            placeholder="Better clients, remote work, starting a company… whatever sovereignty means to you."
            :rows="3"
          />
        </section>

        <!-- 8. Links -->
        <section class="space-y-4">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">Links</h2>
          <BaseInput v-model="form.portfolio_url" label="Portfolio URL" placeholder="https://yourportfolio.com" :error="errors.portfolio_url" />
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Additional links</label>
            <p class="text-xs text-gray-500 -mt-1">GitHub, LinkedIn, X — add them here, each with a label.</p>
            <div
              v-for="(link, index) in form.additional_links"
              :key="index"
              class="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 space-y-2">
                <BaseInput v-model="link.label" placeholder="Label (e.g. GitHub, LinkedIn)" class="text-sm" />
                <BaseInput v-model="link.url" :placeholder="index === 0 ? 'https://github.com/username' : 'https://...'" />
              </div>
              <button
                v-if="form.additional_links.length > 1"
                type="button"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors mt-1"
                title="Remove link"
                @click="removeLink(index)"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <button
              v-if="form.additional_links.length < 5"
              type="button"
              class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              @click="addLink"
            >
              <PlusIcon class="h-5 w-5" />
              Add another link
            </button>
          </div>
        </section>

        <!-- Save -->
        <div class="flex items-center gap-4 pt-2 border-t border-gray-200">
          <BaseButton type="submit" :loading="loading" class="mt-6">Save changes</BaseButton>
          <button type="button" class="mt-6 text-sm text-gray-500 hover:text-gray-700" @click="goBack">Cancel</button>
        </div>
      </form>
    </div>
  </AppLayout>
</template>
