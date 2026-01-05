<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { membersApi } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

const form = ref({
  full_name: '',
  phone: '',
  city: '',
  country: '',
  bio: '',
  want_to_learn: '',
  can_teach: '',
  portfolio_url: '',
  additional_links: ['', '', ''],
  photo_url: ''
})

const errors = ref<Record<string, string>>({})

onMounted(() => {
  if (authStore.member?.profile) {
    const profile = authStore.member.profile
    form.value = {
      full_name: profile.full_name || '',
      phone: profile.phone || '',
      city: profile.city || '',
      country: profile.country || '',
      bio: profile.bio || '',
      want_to_learn: profile.want_to_learn || '',
      can_teach: profile.can_teach || '',
      portfolio_url: profile.portfolio_url || '',
      additional_links: [
        profile.additional_links?.[0] || '',
        profile.additional_links?.[1] || '',
        profile.additional_links?.[2] || ''
      ],
      photo_url: profile.photo_url || ''
    }
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

  if (!form.value.portfolio_url) {
    errors.value.portfolio_url = 'Portfolio URL is required'
  } else if (!/^https?:\/\/.+/.test(form.value.portfolio_url)) {
    errors.value.portfolio_url = 'Please enter a valid URL'
  }

  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validate()) return

  loading.value = true
  error.value = null
  success.value = false

  try {
    const additionalLinks = form.value.additional_links.filter(link => link.trim() !== '')

    await membersApi.updateMe({
      full_name: form.value.full_name,
      phone: form.value.phone || undefined,
      city: form.value.city,
      country: form.value.country,
      bio: form.value.bio,
      want_to_learn: form.value.want_to_learn || undefined,
      can_teach: form.value.can_teach || undefined,
      portfolio_url: form.value.portfolio_url,
      additional_links: additionalLinks.length > 0 ? additionalLinks : undefined,
      photo_url: form.value.photo_url || undefined
    })

    success.value = true
    await authStore.fetchCurrentMember()

    setTimeout(() => {
      router.push('/profile')
    }, 1500)
  } catch (e: any) {
    error.value = e.response?.data?.message || e.message || 'Failed to update profile'
  } finally {
    loading.value = false
  }
}

function cancel() {
  router.push('/profile')
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p class="mt-1 text-gray-600">Update your profile information.</p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <BaseAlert v-if="error" type="error" class="mb-6" dismissible @dismiss="error = null">
          {{ error }}
        </BaseAlert>

        <BaseAlert v-if="success" type="success" class="mb-6">
          Profile updated successfully! Redirecting...
        </BaseAlert>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <BaseInput
            v-model="form.full_name"
            label="Full Name"
            placeholder="John Doe"
            :error="errors.full_name"
            required
          />

          <BaseInput
            v-model="form.phone"
            label="Phone/WhatsApp"
            placeholder="+234123456789"
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

          <BaseTextarea
            v-model="form.bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            :maxlength="500"
            :rows="4"
            :error="errors.bio"
            required
          />

          <BaseTextarea
            v-model="form.want_to_learn"
            label="What do you want to learn?"
            placeholder="Skills you want to develop..."
            :maxlength="300"
            :rows="3"
          />

          <BaseTextarea
            v-model="form.can_teach"
            label="What can you teach others?"
            placeholder="Skills or knowledge you'd be happy to share..."
            :maxlength="300"
            :rows="3"
          />

          <BaseInput
            v-model="form.portfolio_url"
            label="Portfolio URL"
            placeholder="https://yourportfolio.com"
            :error="errors.portfolio_url"
            required
          />

          <div class="space-y-3">
            <label class="block text-sm font-medium text-gray-700">Additional Links</label>
            <BaseInput
              v-model="form.additional_links[0]"
              placeholder="https://github.com/username"
            />
            <BaseInput
              v-model="form.additional_links[1]"
              placeholder="https://linkedin.com/in/username"
            />
            <BaseInput
              v-model="form.additional_links[2]"
              placeholder="https://twitter.com/username"
            />
          </div>

          <BaseInput
            v-model="form.photo_url"
            label="Photo URL"
            placeholder="https://example.com/your-photo.jpg"
            hint="Enter a URL to your profile photo"
          />

          <div class="flex justify-end gap-3 pt-4">
            <BaseButton type="button" variant="outline" @click="cancel">
              Cancel
            </BaseButton>
            <BaseButton type="submit" :loading="loading">
              Save Changes
            </BaseButton>
          </div>
        </form>
      </div>
    </div>
  </AppLayout>
</template>
