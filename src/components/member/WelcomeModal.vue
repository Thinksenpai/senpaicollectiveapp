<script setup lang="ts">
import { ref, computed } from 'vue'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
import { engineApi } from '@/api'
import BaseButton from '@/components/common/BaseButton.vue'

defineProps<{
  memberName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const currentSlide = ref(0)
const totalSlides = 3
const acceptingPledge = ref(false)

// Pledge checkboxes — one per creed line
const pledgeChecks = ref<boolean[]>(new Array(SENPAI_MANIFESTO.creed.length).fill(false))

const allPledgesChecked = computed(() => {
  return pledgeChecks.value.every(checked => checked)
})

function nextSlide() {
  if (currentSlide.value < totalSlides - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

// The actual moment of acceptance — recorded server-side so it's a real,
// permanent record (like Community Guidelines), not just a browser flag
// that forgets you on a new device.
async function acceptPledge() {
  acceptingPledge.value = true
  try {
    await engineApi.acceptPledge()
  } finally {
    acceptingPledge.value = false
  }
  nextSlide()
}

function handleComplete() {
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm" />

    <!-- Modal -->
    <div class="relative min-h-screen flex items-center justify-center p-4">
      <div class="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <!-- Progress dots -->
        <div class="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          <div
            v-for="i in totalSlides"
            :key="i"
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentSlide >= i - 1 ? 'bg-gray-900' : 'bg-gray-300'"
          />
        </div>

        <!-- Slide 1: Welcome -->
        <div v-if="currentSlide === 0" class="p-8 pt-12">
          <div class="text-center mb-6">
            <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 mb-4">
              <svg class="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Senpai, {{ memberName }}!
            </h2>
            <p class="text-gray-600">
              You've been approved. Let's build something great.
            </p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <p class="text-gray-700 leading-relaxed text-center">
              {{ SENPAI_MANIFESTO.promise.headline }}
            </p>
            <p class="text-gray-500 text-sm mt-3 text-center">
              {{ SENPAI_MANIFESTO.promise.description }}
            </p>
          </div>

          <div class="flex justify-end">
            <BaseButton @click="nextSlide">
              Continue
              <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </BaseButton>
          </div>
        </div>

        <!-- Slide 2: The Pledge -->
        <div v-if="currentSlide === 1" class="p-8 pt-12">
          <div class="text-center mb-4">
            <h2 class="text-xl font-bold text-gray-900 mb-1">The Senpai Pledge</h2>
            <p class="text-sm text-gray-500">As a member of the Senpai Collective, you commit to:</p>
          </div>

          <div class="bg-gray-50 rounded-xl p-6 mb-6 border-2 border-gray-200">
            <div class="space-y-4">
              <label
                v-for="(line, index) in SENPAI_MANIFESTO.creed"
                :key="index"
                class="flex items-start cursor-pointer group"
              >
                <input
                  type="checkbox"
                  v-model="pledgeChecks[index]"
                  class="mt-1 h-5 w-5 rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                />
                <span class="ml-3 text-gray-700 group-hover:text-gray-900">{{ line }}</span>
              </label>
            </div>
          </div>

          <p v-if="!allPledgesChecked" class="text-sm text-gray-500 text-center mb-4">
            Check all items to continue
          </p>

          <div class="flex justify-between">
            <BaseButton variant="outline" @click="prevSlide">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </BaseButton>
            <BaseButton
              @click="acceptPledge"
              :disabled="!allPledgesChecked"
              :loading="acceptingPledge"
              :class="allPledgesChecked ? 'bg-gray-900 hover:bg-gray-800' : 'bg-gray-300 cursor-not-allowed'"
            >
              I Accept This Pledge
            </BaseButton>
          </div>
        </div>

        <!-- Slide 3: Your First Steps -->
        <div v-if="currentSlide === 2" class="p-8 pt-12">
          <div class="text-center mb-6">
            <h2 class="text-xl font-bold text-gray-900 mb-1">Your First Steps</h2>
            <p class="text-sm text-gray-500">Start your journey with these actions</p>
          </div>

          <div class="space-y-4 mb-6">
            <div class="flex items-start p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm mr-4 shrink-0">
                1
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Complete Your Profile</h4>
                <p class="text-sm text-gray-600">Add a photo and fill in all details to be discoverable</p>
              </div>
            </div>

            <div class="flex items-start p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm mr-4 shrink-0">
                2
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Explore the Directory</h4>
                <p class="text-sm text-gray-600">Discover other creatives and make your first connection</p>
              </div>
            </div>

            <div class="flex items-start p-4 bg-gray-50 rounded-xl">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-bold text-sm mr-4 shrink-0">
                3
              </div>
              <div>
                <h4 class="font-semibold text-gray-900">Pay It Forward</h4>
                <p class="text-sm text-gray-600">Help another member, share a resource, or give feedback</p>
              </div>
            </div>
          </div>

          <div class="bg-gray-900 rounded-xl p-4 mb-6 text-center">
            <p class="text-white text-sm font-medium">
              Remember: When we help each other grow, we help the world become a better place.
            </p>
          </div>

          <div class="flex justify-between">
            <BaseButton variant="outline" @click="prevSlide">
              <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </BaseButton>
            <BaseButton @click="handleComplete" class="bg-gray-900 hover:bg-gray-800">
              Let's Go!
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
