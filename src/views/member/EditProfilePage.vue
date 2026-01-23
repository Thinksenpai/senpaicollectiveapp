<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { membersApi } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import {
  UserCircleIcon,
  MapPinIcon,
  LinkIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// Track which section is being edited
const editingSection = ref<string | null>(null)

const form = ref({
  full_name: '',
  phone: '',
  city: '',
  country: '',
  bio: '',
  recent_work: '',
  unique_view: '',
  portfolio_url: '',
  additional_links: [{ label: '', url: '' }] as { label: string; url: string }[],
  photo_url: ''
})

// Store original values for cancel functionality
const originalForm = ref({ ...form.value })

const errors = ref<Record<string, string>>({})

const profile = computed(() => authStore.member?.profile)
const member = computed(() => authStore.member)

const experienceLevelLabels: Record<string, string> = {
  none: 'No professional experience',
  junior: 'Junior (0-2 years)',
  mid: 'Mid-level (2-5 years)',
  senior: 'Senior (5+ years)'
}

const badges = computed(() => {
  const result: string[] = []
  if (profile.value?.is_og_member) result.push('OG Member')
  if (authStore.isScout) result.push('Scout')
  if (authStore.isAdmin) result.push('Admin')
  return result
})

onMounted(() => {
  if (authStore.member?.profile) {
    const p = authStore.member.profile
    const formData = {
      full_name: p.full_name || '',
      phone: p.phone || '',
      city: p.city || '',
      country: p.country || '',
      bio: p.bio || '',
      recent_work: p.recent_work || '',
      unique_view: p.unique_view || '',
      portfolio_url: p.portfolio_url || '',
      additional_links: p.additional_links && p.additional_links.length > 0
        ? p.additional_links.map(link => ({
            label: typeof link === 'string' ? '' : (link.label || ''),
            url: typeof link === 'string' ? link : link.url
          }))
        : [{ label: '', url: '' }],
      photo_url: p.photo_url || ''
    }
    form.value = { ...formData }
    originalForm.value = JSON.parse(JSON.stringify(formData))
  }
})

function startEditing(section: string) {
  editingSection.value = section
  // Store current values for potential cancel
  originalForm.value = JSON.parse(JSON.stringify(form.value))
}

function cancelEditing() {
  // Restore original values
  form.value = JSON.parse(JSON.stringify(originalForm.value))
  editingSection.value = null
  errors.value = {}
}

function validateSection(section: string): boolean {
  errors.value = {}

  if (section === 'header') {
    if (!form.value.full_name || form.value.full_name.length < 2) {
      errors.value.full_name = 'Full name must be at least 2 characters'
    }
  }

  if (section === 'location') {
    if (!form.value.city || form.value.city.length < 2) {
      errors.value.city = 'City is required'
    }
    if (!form.value.country || form.value.country.length < 2) {
      errors.value.country = 'Country is required'
    }
  }

  if (section === 'bio') {
    if (!form.value.bio || form.value.bio.length < 10) {
      errors.value.bio = 'Bio must be at least 10 characters'
    }
  }

  if (section === 'recent_work') {
    if (!form.value.recent_work || form.value.recent_work.length < 10) {
      errors.value.recent_work = 'Please tell us about your recent work'
    }
  }

  if (section === 'unique_view') {
    if (!form.value.unique_view || form.value.unique_view.length < 10) {
      errors.value.unique_view = 'Please share your unique view'
    }
  }

  if (section === 'links') {
    if (!form.value.portfolio_url) {
      errors.value.portfolio_url = 'Portfolio URL is required'
    } else if (!/^https?:\/\/.+/.test(form.value.portfolio_url)) {
      errors.value.portfolio_url = 'Please enter a valid URL'
    }
  }

  return Object.keys(errors.value).length === 0
}

function ensureHttps(url: string): string {
  if (!url) return url
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

async function saveSection(section: string) {
  if (!validateSection(section)) return

  loading.value = true
  error.value = null

  try {
    const additionalLinks = form.value.additional_links
      .filter(link => link.url.trim() !== '')
      .map(link => ({
        label: link.label.trim() || undefined,
        url: ensureHttps(link.url)
      }))

    await membersApi.updateMe({
      full_name: form.value.full_name,
      phone: form.value.phone || undefined,
      city: form.value.city,
      country: form.value.country,
      bio: form.value.bio,
      recent_work: form.value.recent_work || undefined,
      unique_view: form.value.unique_view || undefined,
      portfolio_url: ensureHttps(form.value.portfolio_url),
      additional_links: additionalLinks.length > 0 ? additionalLinks : undefined,
      photo_url: form.value.photo_url || undefined
    })

    await authStore.fetchCurrentMember()
    editingSection.value = null
    success.value = true
    setTimeout(() => {
      success.value = false
    }, 3000)
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
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

function goBack() {
  router.push('/profile')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Success Alert -->
      <BaseAlert v-if="success" type="success" class="mb-6" dismissible @dismiss="success = false">
        Profile updated successfully!
      </BaseAlert>

      <!-- Error Alert -->
      <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
        {{ error }}
      </BaseAlert>

      <!-- Profile Header -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="h-32 bg-gradient-to-r from-indigo-500 to-purple-600" />
        <div class="px-6 pb-6">
          <div class="flex flex-col sm:flex-row sm:items-end -mt-12 sm:-mt-16">
            <!-- Photo -->
            <div class="flex-shrink-0 relative group">
              <div v-if="form.photo_url" class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white overflow-hidden bg-white">
                <img :src="form.photo_url" :alt="form.full_name" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                <UserCircleIcon class="h-16 w-16 sm:h-20 sm:w-20 text-gray-400" />
              </div>
              <button
                v-if="editingSection !== 'photo'"
                @click="startEditing('photo')"
                class="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <PencilIcon class="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <!-- Name & Title -->
            <div class="mt-4 sm:mt-0 sm:ml-6 sm:pb-1 flex-1">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div v-if="editingSection !== 'header'" class="group">
                  <div class="flex items-center gap-2">
                    <h1 class="text-2xl font-bold text-gray-900">{{ form.full_name }}</h1>
                    <button
                      @click="startEditing('header')"
                      class="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <PencilIcon class="h-4 w-4" />
                    </button>
                  </div>
                  <p class="text-gray-600">{{ profile?.primary_skill?.name }}</p>
                </div>
                <div v-else class="space-y-3 flex-1 max-w-md">
                  <BaseInput
                    v-model="form.full_name"
                    placeholder="Full Name"
                    :error="errors.full_name"
                  />
                  <div class="flex gap-2">
                    <BaseButton size="sm" @click="saveSection('header')" :loading="loading">
                      <CheckIcon class="h-4 w-4 mr-1" />
                      Save
                    </BaseButton>
                    <BaseButton size="sm" variant="outline" @click="cancelEditing">
                      <XMarkIcon class="h-4 w-4 mr-1" />
                      Cancel
                    </BaseButton>
                  </div>
                </div>
                <button
                  @click="goBack"
                  class="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Done Editing
                </button>
              </div>
            </div>
          </div>

          <!-- Photo URL Edit -->
          <div v-if="editingSection === 'photo'" class="mt-4 p-4 bg-gray-50 rounded-lg">
            <BaseInput
              v-model="form.photo_url"
              label="Photo URL"
              placeholder="https://example.com/your-photo.jpg"
              hint="Enter a URL to your profile photo"
            />
            <div class="flex gap-2 mt-3">
              <BaseButton size="sm" @click="saveSection('photo')" :loading="loading">
                <CheckIcon class="h-4 w-4 mr-1" />
                Save
              </BaseButton>
              <BaseButton size="sm" variant="outline" @click="cancelEditing">
                <XMarkIcon class="h-4 w-4 mr-1" />
                Cancel
              </BaseButton>
            </div>
          </div>

          <!-- Badges -->
          <div v-if="badges.length > 0" class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="badge in badges"
              :key="badge"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
            >
              {{ badge }}
            </span>
          </div>

          <!-- Location & Member Info -->
          <div class="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div v-if="editingSection !== 'location'" class="flex items-center group">
              <MapPinIcon class="h-4 w-4 mr-1" />
              {{ form.city }}, {{ form.country }}
              <button
                @click="startEditing('location')"
                class="ml-2 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PencilIcon class="h-3 w-3" />
              </button>
            </div>
            <div v-else class="flex items-center gap-2 flex-wrap">
              <BaseInput
                v-model="form.city"
                placeholder="City"
                :error="errors.city"
                class="w-32"
              />
              <BaseInput
                v-model="form.country"
                placeholder="Country"
                :error="errors.country"
                class="w-32"
              />
              <BaseButton size="sm" @click="saveSection('location')" :loading="loading">
                <CheckIcon class="h-4 w-4" />
              </BaseButton>
              <BaseButton size="sm" variant="outline" @click="cancelEditing">
                <XMarkIcon class="h-4 w-4" />
              </BaseButton>
            </div>
            <div class="flex items-center">
              <span class="capitalize">{{ experienceLevelLabels[profile?.experience_level || 'none'] }}</span>
            </div>
            <div>
              Member since {{ new Date(member?.created_at || '').toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
            </div>
          </div>

          <!-- Phone (optional display) -->
          <div v-if="editingSection !== 'phone'" class="mt-3 group">
            <button
              @click="startEditing('phone')"
              class="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              {{ form.phone || 'Add phone/WhatsApp' }}
              <PencilIcon class="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
          <div v-else class="mt-3 flex items-center gap-2">
            <BaseInput
              v-model="form.phone"
              placeholder="+234123456789"
              class="w-48"
            />
            <BaseButton size="sm" @click="saveSection('phone')" :loading="loading">
              <CheckIcon class="h-4 w-4" />
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="cancelEditing">
              <XMarkIcon class="h-4 w-4" />
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Bio Section -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">About</h2>
          <button
            v-if="editingSection !== 'bio'"
            @click="startEditing('bio')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon class="h-4 w-4" />
          </button>
        </div>
        <div v-if="editingSection !== 'bio'">
          <p class="text-gray-700 whitespace-pre-line">{{ form.bio || 'Tell us about yourself...' }}</p>
        </div>
        <div v-else class="space-y-3">
          <BaseTextarea
            v-model="form.bio"
            placeholder="Tell us about yourself, your background, and what you're passionate about..."
            :maxlength="500"
            :rows="4"
            :error="errors.bio"
          />
          <div class="flex gap-2">
            <BaseButton size="sm" @click="saveSection('bio')" :loading="loading">
              <CheckIcon class="h-4 w-4 mr-1" />
              Save
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="cancelEditing">
              <XMarkIcon class="h-4 w-4 mr-1" />
              Cancel
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Skills Section (Read-only - skills are set during registration) -->
      <div v-if="member?.skills && member.skills.length > 0" class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="skill in member.skills"
            :key="skill.id"
            :class="[
              'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
              skill.id === profile?.primary_skill_id
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ skill.name }}
            <span v-if="skill.id === profile?.primary_skill_id" class="ml-1 text-xs">(Primary)</span>
          </span>
        </div>
      </div>

      <!-- Recent Work Section -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">Recent Work</h2>
          <button
            v-if="editingSection !== 'recent_work'"
            @click="startEditing('recent_work')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon class="h-4 w-4" />
          </button>
        </div>
        <div v-if="editingSection !== 'recent_work'">
          <p class="text-gray-700 whitespace-pre-line">{{ form.recent_work || 'Share what you\'ve been building or creating...' }}</p>
        </div>
        <div v-else class="space-y-3">
          <BaseTextarea
            v-model="form.recent_work"
            placeholder="Tell us about your recent projects, work, or creative endeavors. What are you most proud of?"
            :maxlength="1000"
            :rows="4"
            :error="errors.recent_work"
          />
          <div class="flex gap-2">
            <BaseButton size="sm" @click="saveSection('recent_work')" :loading="loading">
              <CheckIcon class="h-4 w-4 mr-1" />
              Save
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="cancelEditing">
              <XMarkIcon class="h-4 w-4 mr-1" />
              Cancel
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Unique View Section -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">My Unique View</h2>
          <button
            v-if="editingSection !== 'unique_view'"
            @click="startEditing('unique_view')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon class="h-4 w-4" />
          </button>
        </div>
        <div v-if="editingSection !== 'unique_view'">
          <p class="text-gray-700 whitespace-pre-line">{{ form.unique_view || 'Share your perspective on creativity and work...' }}</p>
        </div>
        <div v-else class="space-y-3">
          <BaseTextarea
            v-model="form.unique_view"
            placeholder="Share your perspective, philosophy, or approach to creativity and work. What drives you?"
            :maxlength="1000"
            :rows="4"
            :error="errors.unique_view"
          />
          <div class="flex gap-2">
            <BaseButton size="sm" @click="saveSection('unique_view')" :loading="loading">
              <CheckIcon class="h-4 w-4 mr-1" />
              Save
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="cancelEditing">
              <XMarkIcon class="h-4 w-4 mr-1" />
              Cancel
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Links Section -->
      <div class="mt-6 bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-lg font-semibold text-gray-900">Links</h2>
          <button
            v-if="editingSection !== 'links'"
            @click="startEditing('links')"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <PencilIcon class="h-4 w-4" />
          </button>
        </div>
        <div v-if="editingSection !== 'links'" class="space-y-2">
          <a
            v-if="form.portfolio_url"
            :href="form.portfolio_url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center text-indigo-600 hover:text-indigo-800"
          >
            <LinkIcon class="h-4 w-4 mr-2" />
            {{ form.portfolio_url }}
          </a>
          <template v-for="(link, index) in form.additional_links" :key="index">
            <a
              v-if="link.url"
              :href="ensureHttps(link.url)"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center text-indigo-600 hover:text-indigo-800"
            >
              <LinkIcon class="h-4 w-4 mr-2" />
              <span v-if="link.label" class="text-gray-500 mr-1">{{ link.label }}:</span>
              {{ link.url }}
            </a>
          </template>
          <p v-if="!form.portfolio_url && form.additional_links.every(l => !l.url)" class="text-gray-500">
            Add your portfolio and social links...
          </p>
        </div>
        <div v-else class="space-y-4">
          <BaseInput
            v-model="form.portfolio_url"
            label="Portfolio URL"
            placeholder="https://yourportfolio.com"
            :error="errors.portfolio_url"
          />
          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Additional Links</label>
            <div
              v-for="(link, index) in form.additional_links"
              :key="index"
              class="flex items-start gap-2 p-3 bg-gray-50 rounded-lg"
            >
              <div class="flex-1 space-y-2">
                <BaseInput
                  v-model="link.label"
                  placeholder="Label (e.g., GitHub, LinkedIn)"
                  class="text-sm"
                />
                <BaseInput
                  v-model="link.url"
                  :placeholder="index === 0 ? 'https://github.com/username' : 'https://...'"
                />
              </div>
              <button
                v-if="form.additional_links.length > 1"
                type="button"
                @click="removeLink(index)"
                class="p-2 text-gray-400 hover:text-red-500 transition-colors mt-1"
                title="Remove link"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
            <button
              v-if="form.additional_links.length < 5"
              type="button"
              @click="addLink"
              class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <PlusIcon class="h-5 w-5" />
              Add another link
            </button>
          </div>
          <div class="flex gap-2 pt-2">
            <BaseButton size="sm" @click="saveSection('links')" :loading="loading">
              <CheckIcon class="h-4 w-4 mr-1" />
              Save
            </BaseButton>
            <BaseButton size="sm" variant="outline" @click="cancelEditing">
              <XMarkIcon class="h-4 w-4 mr-1" />
              Cancel
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
