<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { jobsApi } from '@/api'
import type { ClientReviewData } from '@/types'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'
import { StarIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'

const route = useRoute()
const token = computed(() => route.params.token as string)

const form = ref<ClientReviewData>({
  overall_rating: 0,
  quality_rating: 0,
  communication_rating: 0,
  timeliness_rating: 0,
  professionalism_rating: 0,
  review_text: '',
  would_hire_again: false,
  client_name: '',
  client_email: ''
})

const errors = ref<Record<string, string>>({})
const loading = ref(false)
const submitted = ref(false)
const apiError = ref<string | null>(null)

const ratingCategories = [
  { key: 'overall_rating', label: 'Overall Experience', description: 'How would you rate your overall experience?' },
  { key: 'quality_rating', label: 'Quality of Work', description: 'Did the deliverables meet your expectations?' },
  { key: 'communication_rating', label: 'Communication', description: 'How responsive and clear was the communication?' },
  { key: 'timeliness_rating', label: 'Timeliness', description: 'Was the work delivered on time?' },
  { key: 'professionalism_rating', label: 'Professionalism', description: 'How professional was the overall interaction?' }
]

function setRating(key: string, value: number) {
  (form.value as any)[key] = value
}

function validate(): boolean {
  errors.value = {}

  if (form.value.overall_rating === 0) {
    errors.value.overall_rating = 'Please provide an overall rating'
  }
  if (form.value.quality_rating === 0) {
    errors.value.quality_rating = 'Please rate the quality of work'
  }
  if (form.value.communication_rating === 0) {
    errors.value.communication_rating = 'Please rate communication'
  }
  if (form.value.timeliness_rating === 0) {
    errors.value.timeliness_rating = 'Please rate timeliness'
  }
  if (form.value.professionalism_rating === 0) {
    errors.value.professionalism_rating = 'Please rate professionalism'
  }
  if (!form.value.client_name || form.value.client_name.length < 2) {
    errors.value.client_name = 'Please enter your name'
  }
  if (!form.value.client_email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.client_email)) {
    errors.value.client_email = 'Please enter a valid email'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  apiError.value = null

  try {
    const response = await jobsApi.submitClientReview(token.value, form.value)
    if (response.status) {
      submitted.value = true
    } else {
      apiError.value = response.message || 'Failed to submit review'
    }
  } catch (e: any) {
    apiError.value = e.response?.data?.message || e.message || 'Failed to submit review'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <RouterLink to="/" class="text-xl font-bold text-senpai-600">
            Senpai Collective
          </RouterLink>
        </div>
      </div>
    </header>

    <main class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- Success State -->
      <div v-if="submitted" class="text-center">
        <div class="bg-white rounded-lg shadow-sm p-8">
          <CheckCircleIcon class="mx-auto h-16 w-16 text-green-500" />
          <h1 class="mt-4 text-2xl font-bold text-gray-900">Thank You!</h1>
          <p class="mt-2 text-gray-600 max-w-md mx-auto">
            Your review has been submitted successfully. We appreciate your feedback and it helps us maintain the quality of our community.
          </p>
          <div class="mt-8">
            <RouterLink
              to="/"
              class="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-senpai-600 hover:bg-senpai-700"
            >
              Back to Home
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Review Form -->
      <div v-else>
        <div class="text-center mb-8">
          <StarIcon class="mx-auto h-12 w-12 text-senpai-500" />
          <h1 class="mt-4 text-3xl font-bold text-gray-900">Leave a Review</h1>
          <p class="mt-2 text-gray-600">
            Your feedback helps our community members grow and improve.
          </p>
        </div>

        <BaseAlert v-if="apiError" type="error" dismissible @dismiss="apiError = null" class="mb-6">
          {{ apiError }}
        </BaseAlert>

        <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-8">
          <!-- Rating Categories -->
          <div class="space-y-6">
            <div
              v-for="category in ratingCategories"
              :key="category.key"
              class="space-y-2"
            >
              <div class="flex items-center justify-between">
                <div>
                  <label class="block text-sm font-medium text-gray-900">
                    {{ category.label }}
                  </label>
                  <p class="text-sm text-gray-500">{{ category.description }}</p>
                </div>
              </div>
              <div class="flex items-center gap-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  type="button"
                  @click="setRating(category.key, star)"
                  class="p-1 focus:outline-none focus:ring-2 focus:ring-senpai-500 rounded"
                >
                  <component
                    :is="star <= (form as any)[category.key] ? StarIconSolid : StarIcon"
                    :class="[
                      'h-8 w-8 transition-colors',
                      star <= (form as any)[category.key] ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                    ]"
                  />
                </button>
              </div>
              <p v-if="errors[category.key]" class="text-sm text-red-600">
                {{ errors[category.key] }}
              </p>
            </div>
          </div>

          <!-- Written Review -->
          <div>
            <BaseTextarea
              v-model="form.review_text"
              label="Your Review (Optional)"
              placeholder="Share your experience working with this member..."
              :rows="4"
              hint="Your written feedback is valuable and helps others understand what to expect."
            />
          </div>

          <!-- Would Hire Again -->
          <div class="p-4 bg-gray-50 rounded-lg">
            <BaseCheckbox
              v-model="form.would_hire_again"
              label="I would hire this member again"
            />
          </div>

          <!-- Contact Information -->
          <div class="space-y-4 pt-6 border-t">
            <h3 class="text-lg font-medium text-gray-900">Your Information</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <BaseInput
                v-model="form.client_name"
                label="Your Name"
                placeholder="John Doe"
                :error="errors.client_name"
                required
              />
              <BaseInput
                v-model="form.client_email"
                label="Email Address"
                type="email"
                placeholder="john@company.com"
                :error="errors.client_email"
                required
              />
            </div>
          </div>

          <!-- Submit -->
          <div class="pt-6 border-t">
            <BaseButton
              type="submit"
              :loading="loading"
              :disabled="loading"
              class="w-full"
            >
              Submit Review
            </BaseButton>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>
