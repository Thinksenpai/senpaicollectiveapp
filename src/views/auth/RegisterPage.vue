<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSkillsStore } from '@/stores/skills'
import { scoutsApi } from '@/api'
import type { ExperienceLevel, DiscoverySource } from '@/types'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseMultiSelect from '@/components/common/BaseMultiSelect.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { SENPAI_MANIFESTO } from '@/content/manifesto'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const skillsStore = useSkillsStore()
const scoutCode = (route.query.ref as string) || (route.query.scout as string) || ''

const currentStep = ref(0) // Start at step 0 (philosophy intro)
const totalSteps = 6 // Now 6 steps (0-5)
const registrationComplete = ref(false)

const form = ref({
  // Step 1: Basic Info
  full_name: '',
  email: '',
  password: '',
  password_confirm: '',
  phone: '',
  city: '',
  country: '',

  // Step 2: Skills & Work
  primary_skill_id: null as number | null,
  other_skill_ids: [] as number[],
  experience_level: '' as ExperienceLevel | '',
  portfolio_url: '',
  additional_links: [{ label: '', url: '' }] as { label: string; url: string }[],

  // Step 3: About You
  bio: '',
  cover_letter: '',
  recent_work: '',
  unique_view: '',

  // Step 4: Community History
  is_og_member: false,
  og_member_details: '',
  discovery_source: (scoutCode ? 'scout' : '') as DiscoverySource | '',
  scout_code: scoutCode,

  // Step 5: Agreement
  agree_terms: false,
  agree_privacy: false,
  agree_profile_visible: false
})

const errors = ref<Record<string, string>>({})

const experienceLevelOptions = [
  { value: 'none', label: 'No professional experience yet' },
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-level (2-5 years)' },
  { value: 'senior', label: 'Senior (5+ years)' }
]

const discoverySourceOptions = [
  { value: 'scout', label: 'Invited by a Scout' },
  { value: 'social', label: 'Social media' },
  { value: 'friend', label: 'Friend or colleague' },
  { value: 'event', label: 'Event or workshop' },
  { value: 'returning', label: "I'm a returning member" },
  { value: 'other', label: 'Other' }
]

const skillOptions = computed(() => {
  return skillsStore.skills.map(skill => ({
    value: skill.id,
    label: skill.name
  }))
})

const otherSkillOptions = computed(() => {
  return skillOptions.value.filter(opt => opt.value !== form.value.primary_skill_id)
})

const stepTitles = [
  'Before You Apply',
  'Basic Information',
  'Skills & Work',
  'About You',
  'Community History',
  'Terms & Agreement'
]

onMounted(() => {
  skillsStore.fetchSkills()

  // Track scout link click if there's a scout code in the URL
  if (scoutCode) {
    scoutsApi.trackClick(scoutCode).catch(() => {
      // Silently ignore tracking errors
    })
  }
})

function validateStep(step: number): boolean {
  errors.value = {}

  // Step 0: Philosophy intro - no validation needed, just informational
  if (step === 0) {
    return true
  }

  if (step === 1) {
    if (!form.value.full_name || form.value.full_name.length < 2) {
      errors.value.full_name = 'Full name must be at least 2 characters'
    }
    if (!form.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      errors.value.email = 'Please enter a valid email'
    }
    if (!form.value.password || form.value.password.length < 8) {
      errors.value.password = 'Password must be at least 8 characters'
    }
    if (form.value.password !== form.value.password_confirm) {
      errors.value.password_confirm = 'Passwords do not match'
    }
    if (!form.value.city || form.value.city.length < 2) {
      errors.value.city = 'City is required'
    }
    if (!form.value.country || form.value.country.length < 2) {
      errors.value.country = 'Country is required'
    }
  }

  if (step === 2) {
    if (!form.value.primary_skill_id) {
      errors.value.primary_skill_id = 'Please select your primary skill'
    }
    if (!form.value.experience_level) {
      errors.value.experience_level = 'Please select your experience level'
    }
    if (!form.value.portfolio_url) {
      errors.value.portfolio_url = 'Portfolio URL is required'
    } else if (!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(form.value.portfolio_url)) {
      errors.value.portfolio_url = 'Please enter a valid URL (e.g., www.example.com or https://example.com)'
    }
  }

  if (step === 3) {
    if (!form.value.bio || form.value.bio.length < 10) {
      errors.value.bio = 'Bio must be at least 10 characters'
    }
    if (!form.value.recent_work || form.value.recent_work.length < 10) {
      errors.value.recent_work = 'Please tell us about your recent work (at least 10 characters)'
    }
    if (!form.value.unique_view || form.value.unique_view.length < 10) {
      errors.value.unique_view = 'Please share your unique view (at least 10 characters)'
    }
  }

  if (step === 4) {
    if (!form.value.discovery_source) {
      errors.value.discovery_source = 'Please tell us how you heard about us'
    }
  }

  if (step === 5) {
    if (!form.value.agree_terms) {
      errors.value.agree_terms = 'You must agree to the Terms of Membership'
    }
    if (!form.value.agree_privacy) {
      errors.value.agree_privacy = 'You must agree to the Privacy Policy'
    }
    if (!form.value.agree_profile_visible) {
      errors.value.agree_profile_visible = 'You must acknowledge that your profile will be visible'
    }
  }

  return Object.keys(errors.value).length === 0
}

function nextStep() {
  if (validateStep(currentStep.value)) {
    if (currentStep.value < totalSteps - 1) {
      currentStep.value++
      window.scrollTo(0, 0)
    }
  }
}


function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
    window.scrollTo(0, 0)
  }
}

// Helper to ensure URL has protocol
function ensureHttps(url: string): string {
  if (!url) return url
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`
  }
  return url
}

async function handleSubmit() {
  if (!validateStep(currentStep.value)) return

  authStore.clearError()

  const additionalLinks = form.value.additional_links
    .filter(link => link.url.trim() !== '')
    .map(link => ({
      label: link.label.trim() || undefined,
      url: ensureHttps(link.url)
    }))

  const result = await authStore.register({
    full_name: form.value.full_name,
    email: form.value.email,
    password: form.value.password,
    password_confirm: form.value.password_confirm,
    phone: form.value.phone || undefined,
    city: form.value.city,
    country: form.value.country,
    primary_skill_id: form.value.primary_skill_id!,
    other_skill_ids: form.value.other_skill_ids.length > 0 ? form.value.other_skill_ids : undefined,
    experience_level: form.value.experience_level as ExperienceLevel,
    portfolio_url: ensureHttps(form.value.portfolio_url),
    additional_links: additionalLinks.length > 0 ? additionalLinks : undefined,
    bio: form.value.bio,
    cover_letter: form.value.cover_letter || undefined,
    recent_work: form.value.recent_work,
    unique_view: form.value.unique_view,
    is_og_member: form.value.is_og_member,
    og_member_details: form.value.og_member_details || undefined,
    discovery_source: form.value.discovery_source as DiscoverySource,
    scout_code: form.value.scout_code || undefined
  })

  if (result.success) {
    registrationComplete.value = true
  }
}

function goToLogin() {
  router.push('/login')
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
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="flex justify-center">
          <img src="/senpai_logo.svg" alt="Senpai" class="h-12 w-auto" />
        </RouterLink>
        <h1 class="mt-4 text-2xl font-bold text-gray-900">Join the Collective</h1>
        <p class="mt-2 text-gray-600">
          Already have an account?
          <RouterLink to="/login" class="text-gray-900 hover:text-gray-700 font-medium">Sign in</RouterLink>
        </p>
      </div>

      <!-- Registration Complete -->
      <div v-if="registrationComplete" class="bg-white rounded-lg shadow-sm p-8 text-center">
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h2>
        <p class="text-gray-600 mb-6">
          Thank you for applying to join Senpai Collective. Please check your email to verify your account.
          Once verified, our team will review your application.
        </p>
        <p class="text-sm text-gray-500 mb-8">
          We review every application carefully and will email you once we've made a decision.
        </p>
        <BaseButton @click="goToLogin">Go to Login</BaseButton>
      </div>

      <!-- Registration Form -->
      <div v-else class="bg-white rounded-lg shadow-sm">
        <!-- Progress Bar -->
        <div class="px-6 pt-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-gray-900">Step {{ currentStep + 1 }} of {{ totalSteps }}</span>
            <span class="text-sm text-gray-500">{{ stepTitles[currentStep] }}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-gray-900 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${((currentStep + 1) / totalSteps) * 100}%` }"
            />
          </div>
        </div>

        <!-- Loading -->
        <div v-if="skillsStore.loading" class="p-12 flex justify-center">
          <LoadingSpinner size="lg" />
        </div>

        <!-- Form Steps -->
        <form v-else @submit.prevent="currentStep === 5 ? handleSubmit() : nextStep()" class="p-6">
          <!-- Scout invite confirmation (auto-applied from a ?ref= invite link) -->
          <div
            v-if="scoutCode"
            class="mb-6 flex items-start gap-2 rounded-lg bg-senpai-50 border border-senpai-200 px-4 py-3 text-sm text-senpai-800"
          >
            <svg class="h-5 w-5 flex-shrink-0 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              You were invited by a scout — invite code
              <span class="font-mono font-semibold">{{ scoutCode }}</span>
              is applied to your application.
            </span>
          </div>

          <BaseAlert v-if="authStore.error" type="error" class="mb-6" dismissible @dismiss="authStore.clearError">
            {{ authStore.error }}
          </BaseAlert>

          <!-- Step 0: Philosophy Intro -->
          <div v-if="currentStep === 0" class="space-y-8">
            <!-- Header -->
            <div class="text-center">
              <p class="text-sm text-gray-500 mb-2 uppercase tracking-wide">Senpai Collective</p>
              <h2 class="text-2xl font-bold text-gray-900 mb-2">Before You Apply</h2>
              <p class="text-gray-600">Read this carefully. This is who we are.</p>
            </div>

            <!-- Mission - Full Version -->
            <div class="bg-gray-100 rounded-2xl p-8 border border-gray-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Our Mission</h3>
              <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ SENPAI_MANIFESTO.mission }}</p>
            </div>

            <!-- Core Values - Vertical List -->
            <div>
              <div class="flex items-center gap-3 mb-4">
                <img src="/corevalues.svg" alt="Core Values" class="h-10 w-auto" />
                <h3 class="text-lg font-semibold text-gray-900">Our Six Core Values</h3>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(value, index) in SENPAI_MANIFESTO.values"
                  :key="value.name"
                  class="flex items-start p-4 bg-gray-50 rounded-xl"
                >
                  <span class="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold mr-4 shrink-0">
                    {{ index + 1 }}
                  </span>
                  <div>
                    <h4 class="font-semibold text-gray-900 mb-1">{{ value.name }}</h4>
                    <p class="text-sm text-gray-600">{{ value.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- What We Expect -->
            <div class="bg-amber-50 rounded-xl p-6 border border-amber-100">
              <h3 class="text-lg font-semibold text-amber-900 mb-4">What We Expect From Members</h3>
              <ul class="space-y-3">
                <li
                  v-for="(expectation, index) in SENPAI_MANIFESTO.expectations"
                  :key="index"
                  class="flex items-start"
                >
                  <svg class="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span class="font-medium text-amber-900">{{ expectation.title }}:</span>
                    <span class="text-amber-800"> {{ expectation.description }}</span>
                  </div>
                </li>
              </ul>
            </div>

            <!-- Action Buttons -->
            <div class="pt-4">
              <BaseButton
                type="button"
                @click="nextStep"
                class="w-full py-4 bg-gray-900 hover:bg-gray-800 text-lg"
              >
                I Want to Apply
              </BaseButton>
              <div class="text-center mt-4">
                <RouterLink
                  to="/"
                  class="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  No thanks, take me back
                </RouterLink>
              </div>
            </div>

            <!-- Footer -->
            <div class="text-center pt-4 border-t border-gray-200">
              <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 text-sm text-gray-500 hover:opacity-80 transition-opacity">
                <span>An extension of</span>
                <img src="/senpai.svg" alt="Senpai" class="h-5 w-auto" />
                <span class="font-medium text-gray-700">SENPAI</span>
              </a>
            </div>
          </div>

          <!-- Step 1: Basic Info -->
          <div v-if="currentStep === 1" class="space-y-6">
            <BaseInput
              v-model="form.full_name"
              label="Full Name"
              placeholder="John Doe"
              :error="errors.full_name"
              required
            />

            <BaseInput
              v-model="form.email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              :error="errors.email"
              required
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput
                v-model="form.password"
                type="password"
                label="Password"
                placeholder="Min 8 characters"
                :error="errors.password"
                required
              />

              <BaseInput
                v-model="form.password_confirm"
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                :error="errors.password_confirm"
                required
              />
            </div>

            <BaseInput
              v-model="form.phone"
              label="Phone/WhatsApp"
              placeholder="+234123456789"
              hint="Optional - for easier communication"
            />

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput
                v-model="form.city"
                label="City"
                placeholder="Lagos"
                :error="errors.city"
                required
              />

              <BaseInput
                v-model="form.country"
                label="Country"
                placeholder="Nigeria"
                :error="errors.country"
                required
              />
            </div>
          </div>

          <!-- Step 2: Skills & Work -->
          <div v-if="currentStep === 2" class="space-y-6">
            <BaseSelect
              v-model="form.primary_skill_id"
              :options="skillOptions"
              label="Primary Skill"
              placeholder="Select your main skill"
              :error="errors.primary_skill_id"
              required
            />

            <BaseMultiSelect
              v-model="form.other_skill_ids"
              :options="otherSkillOptions"
              label="Other Skills"
              placeholder="Select additional skills"
              :max="5"
            />

            <BaseSelect
              v-model="form.experience_level"
              :options="experienceLevelOptions"
              label="Experience Level"
              placeholder="Select your experience level"
              :error="errors.experience_level"
              required
            />

            <BaseInput
              v-model="form.portfolio_url"
              label="Portfolio/Work Link"
              placeholder="https://yourportfolio.com"
              :error="errors.portfolio_url"
              hint="Share your best work - Behance, Dribbble, personal site, etc."
              required
            />

            <div class="space-y-4">
              <label class="block text-sm font-medium text-gray-700">Additional Links (Optional)</label>
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
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <button
                v-if="form.additional_links.length < 5"
                type="button"
                @click="addLink"
                class="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add another link
              </button>
            </div>
          </div>

          <!-- Step 3: About You -->
          <div v-if="currentStep === 3" class="space-y-6">
            <BaseTextarea
              v-model="form.bio"
              label="Bio"
              placeholder="Tell us about yourself, your background, and what you're passionate about..."
              :maxlength="500"
              :rows="4"
              :error="errors.bio"
              required
            />

            <BaseTextarea
              v-model="form.recent_work"
              label="What have you built or created lately?"
              placeholder="Tell us about your recent projects, work, or creative endeavors. What are you most proud of?"
              :maxlength="1000"
              :rows="4"
              :error="errors.recent_work"
              required
            />

            <BaseTextarea
              v-model="form.unique_view"
              label="What is your unique view on life?"
              placeholder="Share your perspective, philosophy, or approach to creativity and work. What drives you?"
              :maxlength="1000"
              :rows="4"
              :error="errors.unique_view"
              required
            />

            <BaseTextarea
              v-model="form.cover_letter"
              label="Why do you want to join Senpai? (Optional)"
              placeholder="What excites you about joining this community? What are you hoping to gain and contribute?"
              :maxlength="2000"
              :rows="4"
            />
          </div>

          <!-- Step 4: Community History -->
          <div v-if="currentStep === 4" class="space-y-6">
            <div>
              <BaseCheckbox
                v-model="form.is_og_member"
                label="Were you part of the original Senpai community?"
              />

              <div v-if="form.is_og_member" class="mt-4 ml-7">
                <BaseTextarea
                  v-model="form.og_member_details"
                  label="How were you involved?"
                  placeholder="Tell us about your previous involvement with Senpai..."
                  :maxlength="500"
                  :rows="3"
                />
              </div>
            </div>

            <BaseSelect
              v-model="form.discovery_source"
              :options="discoverySourceOptions"
              label="How did you hear about Senpai?"
              placeholder="Select an option"
              :error="errors.discovery_source"
              required
            />

            <BaseInput
              v-model="form.scout_code"
              label="Scout/Referral Code"
              placeholder="ABC123"
              hint="If someone invited you, enter their code here"
            />
          </div>

          <!-- Step 5: Terms & Agreement -->
          <div v-if="currentStep === 5" class="space-y-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-4">Before you submit</h3>
              <p class="text-sm text-gray-600 mb-4">
                Please review and agree to the following to complete your application:
              </p>

              <div class="space-y-4">
                <BaseCheckbox v-model="form.agree_terms" :error="errors.agree_terms">
                  I agree to the
                  <RouterLink
                    to="/terms"
                    target="_blank"
                    class="text-senpai-600 underline hover:text-senpai-700"
                    @click.stop
                  >Terms of Membership</RouterLink>
                </BaseCheckbox>

                <BaseCheckbox v-model="form.agree_privacy" :error="errors.agree_privacy">
                  I agree to the
                  <RouterLink
                    to="/privacy"
                    target="_blank"
                    class="text-senpai-600 underline hover:text-senpai-700"
                    @click.stop
                  >Privacy Policy</RouterLink>
                </BaseCheckbox>

                <BaseCheckbox
                  v-model="form.agree_profile_visible"
                  label="I understand my profile will be visible to other members (if accepted)"
                  :error="errors.agree_profile_visible"
                />
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 class="font-medium text-gray-900 mb-2">What happens next?</h4>
              <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>You'll receive an email to verify your account</li>
                <li>Our team will review your application</li>
                <li>We'll email you our decision — we review every application carefully</li>
              </ol>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div v-if="currentStep > 0" class="mt-8 flex justify-between">
            <BaseButton
              v-if="currentStep > 1"
              type="button"
              variant="outline"
              @click="prevStep"
            >
              Previous
            </BaseButton>
            <div v-else />

            <BaseButton
              type="submit"
              :loading="authStore.loading"
            >
              {{ currentStep === 5 ? 'Submit Application' : 'Continue' }}
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
