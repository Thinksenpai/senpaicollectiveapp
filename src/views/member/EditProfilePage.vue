<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { membersApi, engineApi } from '@/api'
import type { WorkStatus, SchoolStatus, EnrichmentPayload } from '@/types'
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

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const form = ref({
  full_name: '',
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
  additional_links: [{ label: '', url: '' }] as { label: string; url: string }[]
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
  { value: 'graduated', label: 'Graduated' }
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
    form.value.phone = p.phone || ''
    form.value.city = p.city || ''
    form.value.country = p.country || ''
    form.value.photo_url = p.photo_url || ''
    form.value.bio = p.bio || ''
    form.value.recent_work = p.recent_work || ''
    form.value.unique_view = p.unique_view || ''
    form.value.portfolio_url = p.portfolio_url || ''
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
  if (!form.value.full_name || form.value.full_name.length < 2) {
    errors.value.full_name = 'Full name must be at least 2 characters'
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
      full_name: form.value.full_name,
      phone: form.value.phone || undefined,
      city: form.value.city,
      country: form.value.country,
      bio: form.value.bio,
      recent_work: form.value.recent_work || undefined,
      unique_view: form.value.unique_view || undefined,
      portfolio_url: form.value.portfolio_url ? ensureHttps(form.value.portfolio_url) : undefined,
      additional_links: additionalLinks.length > 0 ? additionalLinks : undefined,
      photo_url: form.value.photo_url || undefined
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

      <form class="space-y-10" @submit.prevent="save">
        <!-- Identity -->
        <section class="space-y-5">
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

          <BaseInput v-model="form.full_name" label="Full name" :error="errors.full_name" required />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.city" label="City" :error="errors.city" required />
            <BaseInput v-model="form.country" label="Country" :error="errors.country" required />
          </div>
          <BaseInput v-model="form.phone" label="Phone / WhatsApp" placeholder="+234123456789" />

          <p class="text-sm text-gray-500">
            Experience level: <span class="text-gray-700">{{ profile?.experience_level ? experienceLevelLabels[profile.experience_level] : 'Not set' }}</span>
            — set when you applied, not editable here.
          </p>
        </section>

        <!-- Goal -->
        <section>
          <BaseTextarea
            v-model="form.goal"
            label="What does success look like for you in the next 1–3 years?"
            placeholder="Better clients, remote work, starting a company… whatever sovereignty means to you."
            :rows="3"
          />
        </section>

        <!-- About -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">About</h2>
          <BaseTextarea v-model="form.bio" label="Bio" placeholder="Tell us about yourself, your background, and what you're passionate about." :maxlength="500" :rows="4" :error="errors.bio" required />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.school_status" :options="schoolStatusOptions" label="School status" placeholder="Select" />
            <BaseInput v-if="showSchoolName" v-model="form.school_name" label="Which school?" placeholder="University of Lagos" />
          </div>
        </section>

        <!-- You -->
        <section class="space-y-5">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">You</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.mbti" :options="mbtiOptions" label="Personality type (MBTI)" placeholder="Select if you know it" />
            <BaseInput v-model="form.date_of_birth" type="date" label="Date of birth" name="bday" autocomplete="bday" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseInput v-model="form.job_title" label="Current role" placeholder="Product Designer" />
            <BaseInput v-model="form.organization" label="Organization" placeholder="Where you work" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.work_status" :options="workStatusOptions" label="Work status" placeholder="Select" />
            <BaseInput v-model="form.weekly_commitment_hours" type="number" label="Hours/week you can commit" placeholder="5" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <BaseSelect v-model="form.timezone" :options="timezoneOptions" label="Timezone" placeholder="Select your timezone" />
            <BaseInput v-model="form.languages" label="Languages" placeholder="English, Igbo, French" />
          </div>
          <BaseInput v-model="form.gender" label="Gender (optional)" placeholder="Self-describe" />
        </section>

        <!-- Skills (read-only, set at application) -->
        <section v-if="member?.skills && member.skills.length > 0">
          <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Skills</h2>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="skill in member.skills"
              :key="skill.id"
              :class="[
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                skill.id === profile?.primary_skill_id ? 'bg-senpai-100 text-senpai-700' : 'bg-gray-100 text-gray-700'
              ]"
            >
              {{ skill.name }}
            </span>
          </div>
          <p class="text-sm text-gray-400 mt-2">Skills are set at application and aren't editable here.</p>
        </section>

        <!-- Building -->
        <section>
          <BaseTextarea v-model="form.recent_work" label="Building" placeholder="Tell us about your recent projects, work, or creative endeavors. What are you most proud of?" :maxlength="1000" :rows="4" />
        </section>

        <!-- Unique view -->
        <section>
          <BaseTextarea v-model="form.unique_view" label="Unique view" placeholder="Share your perspective, philosophy, or approach to creativity and work. What drives you?" :maxlength="1000" :rows="4" />
        </section>

        <!-- Links -->
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
