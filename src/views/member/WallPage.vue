<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { engineApi } from '@/api'
import type { WallPost } from '@/types'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ArrowTopRightOnSquareIcon } from '@heroicons/vue/24/outline'

const posts = ref<WallPost[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await engineApi.getWall()
    posts.value = res.data ?? []
  } finally {
    loading.value = false
  }
})

// How many distinct people have put something up. "12 posts" flatters a wall
// where one person wrote twelve; the number that matters is how much of the
// cohort has actually shown up.
const voices = computed(() => new Set(posts.value.map((p) => p.member_id)).size)

function initial(name: string) {
  return (name || '?').charAt(0).toUpperCase()
}
function timeAgo(iso?: string | null) {
  if (!iso) return ''
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return days === 1 ? 'yesterday' : `${days}d ago`
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">The Wall</h1>
        <p class="text-sm text-gray-500 mt-1">
          What your cohort has written. People join on a rolling basis, so this fills up as the
          cohort does — check back.
        </p>
        <p v-if="voices" class="text-xs text-gray-400 mt-2">
          {{ voices }} {{ voices === 1 ? 'person has' : 'people have' }} posted so far
        </p>
      </header>

      <div v-if="loading" class="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

      <!-- An empty wall is an invitation, not a dead end — so it says what to
           do next rather than reporting that there is nothing here. -->
      <div v-else-if="!posts.length" class="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <p class="font-medium text-gray-900">Nothing on the wall yet</p>
        <p class="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Be the first. Your introduction is part of the induction track, and everyone who joins
          after you will read it.
        </p>
        <RouterLink to="/tasks" class="inline-block mt-4 text-sm font-medium text-senpai-600 hover:text-senpai-700">
          Go to your tasks →
        </RouterLink>
      </div>

      <div v-else class="space-y-4">
        <article
          v-for="post in posts"
          :key="post.assignment_id"
          class="bg-white rounded-2xl border p-5"
          :class="post.is_mine ? 'border-senpai-200' : 'border-gray-200'"
        >
          <div class="flex items-start gap-3">
            <RouterLink :to="`/members/${post.member_id}`" class="shrink-0">
              <img
                v-if="post.photo_url"
                :src="post.photo_url"
                :alt="post.full_name"
                class="w-10 h-10 rounded-full object-cover"
              />
              <span
                v-else
                class="w-10 h-10 rounded-full bg-senpai-100 flex items-center justify-center text-sm font-bold text-senpai-700"
              >{{ initial(post.full_name) }}</span>
            </RouterLink>

            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-baseline gap-x-2">
                <RouterLink :to="`/members/${post.member_id}`" class="font-medium text-gray-900 hover:text-senpai-700">
                  {{ post.full_name }}
                </RouterLink>
                <span v-if="post.is_mine" class="text-[11px] font-medium text-senpai-700">You</span>
                <span v-if="post.primary_skill" class="text-xs text-gray-500">{{ post.primary_skill }}</span>
                <span class="text-xs text-gray-400 ml-auto">{{ timeAgo(post.submitted_at) }}</span>
              </div>

              <!-- Which question this answers. Without it a feed of mixed
                   prompts reads as people talking past each other. -->
              <p class="text-[11px] font-mono uppercase tracking-wider text-gray-400 mt-1">
                {{ post.task_title }}
              </p>

              <p v-if="post.body" class="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">{{ post.body }}</p>

              <a
                v-if="post.link_url"
                :href="post.link_url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 mt-2 text-sm text-senpai-600 hover:text-senpai-700 break-all"
              >
                {{ post.link_url }} <ArrowTopRightOnSquareIcon class="h-3.5 w-3.5 shrink-0" />
              </a>
            </div>
          </div>
        </article>
      </div>
    </div>
  </AppLayout>
</template>
