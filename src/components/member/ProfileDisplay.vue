<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Role, Skill } from '@/types'
import {
  UserCircleIcon,
  PencilIcon,
  GlobeAltIcon,
  LinkIcon,
  AcademicCapIcon,
  BriefcaseIcon
} from '@heroicons/vue/24/outline'
import {
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon as SparklesSolidIcon
} from '@heroicons/vue/24/solid'

// One shared presentational layout for "a member's profile" — used for both
// your own profile (full data, editable) and another member's profile in the
// directory (public-safe subset, read-only). Sections simply don't render
// when their data isn't passed in, so the two callers can differ in content
// without forking the template.
interface Props {
  fullName?: string
  photoUrl?: string
  isOGMember?: boolean
  roles?: Role[]
  mbti?: string
  subtitle?: string
  experienceLabel?: string
  memberSince?: string
  editHref?: string
  goal?: string
  bio?: string
  schoolLine?: string
  skills?: Skill[]
  primarySkillId?: number
  recentWork?: string
  workLine?: string
  uniqueView?: string
  links?: { label: string; url: string }[]
  logisticsLine?: string
}

const props = withDefaults(defineProps<Props>(), {
  roles: () => [],
  skills: () => [],
  links: () => []
})

const initials = computed(() => {
  const name = props.fullName?.trim()
  if (!name) return '?'
  const parts = name.split(/\s+/)
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase()
})

const getRoleStyle = (roleName: string) => {
  switch (roleName.toLowerCase()) {
    case 'admin':
      return { bg: 'bg-red-50', text: 'text-red-700', icon: ShieldCheckIcon, iconColor: 'text-red-500' }
    case 'scout':
      return { bg: 'bg-amber-50', text: 'text-amber-700', icon: StarIcon, iconColor: 'text-amber-500' }
    default:
      return { bg: 'bg-senpai-50', text: 'text-senpai-700', icon: SparklesSolidIcon, iconColor: 'text-senpai-500' }
  }
}

const hasAnyContent = computed(() =>
  !!props.bio || !!props.recentWork || !!props.uniqueView || !!props.goal ||
  props.skills!.length > 0 || props.links!.length > 0
)
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Identity -->
    <div class="flex items-start gap-4 pb-6 border-b border-gray-200">
      <div v-if="photoUrl" class="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-gray-100 shrink-0">
        <img :src="photoUrl" :alt="fullName" class="h-full w-full object-cover" />
      </div>
      <div v-else class="h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-senpai-100 flex items-center justify-center shrink-0">
        <span v-if="fullName" class="text-2xl font-semibold text-senpai-600">{{ initials }}</span>
        <UserCircleIcon v-else class="h-12 w-12 text-gray-400" />
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="text-2xl font-bold text-gray-900">{{ fullName }}</h1>
          <span
            v-if="isOGMember"
            class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-senpai-50 text-senpai-700"
          >
            <SparklesSolidIcon class="h-3 w-3" /> OG
          </span>
          <span
            v-for="role in roles"
            :key="role.id"
            :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', getRoleStyle(role.name).bg, getRoleStyle(role.name).text]"
          >
            <component :is="getRoleStyle(role.name).icon" :class="['h-3 w-3', getRoleStyle(role.name).iconColor]" />
            {{ role.name.charAt(0).toUpperCase() + role.name.slice(1) }}
          </span>
          <span
            v-if="mbti"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-gray-300 text-gray-600"
          >
            {{ mbti }}
          </span>
        </div>
        <p v-if="subtitle" class="text-gray-600 mt-0.5">{{ subtitle }}</p>
        <p v-if="experienceLabel" class="text-gray-600 mt-1">{{ experienceLabel }}</p>
        <p v-if="memberSince" class="text-sm text-gray-400 mt-1">{{ memberSince }}</p>
      </div>

      <RouterLink
        v-if="editHref"
        :to="editHref"
        class="shrink-0 inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        <PencilIcon class="h-4 w-4 mr-1.5" />
        Edit
      </RouterLink>
    </div>

    <!-- Goal -->
    <div v-if="goal" class="py-6 border-b border-gray-200">
      <p class="font-voice text-lg text-gray-900 leading-relaxed">"{{ goal }}"</p>
    </div>

    <!-- About, with schooling as a quiet contextual line underneath -->
    <div v-if="bio || schoolLine" class="py-6 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">About</h2>
      <p v-if="bio" class="text-gray-700 leading-relaxed whitespace-pre-line">{{ bio }}</p>
      <p v-if="schoolLine" class="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
        <AcademicCapIcon class="h-4 w-4" /> {{ schoolLine }}
      </p>
    </div>

    <!-- Links — moved up, right after About -->
    <div v-if="links.length > 0" class="py-6 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Links</h2>
      <div class="flex flex-wrap gap-2">
        <a
          v-for="link in links"
          :key="link.url"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:border-senpai-400 hover:text-senpai-700 transition-colors"
        >
          <GlobeAltIcon v-if="link.label === 'Portfolio'" class="h-4 w-4" />
          <LinkIcon v-else class="h-4 w-4" />
          {{ link.label }}
        </a>
      </div>
    </div>

    <!-- Skills -->
    <div v-if="skills.length > 0" class="py-6 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Skills</h2>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="skill in skills"
          :key="skill.id"
          :class="[
            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
            skill.id === primarySkillId ? 'bg-senpai-100 text-senpai-700' : 'bg-gray-100 text-gray-700'
          ]"
        >
          {{ skill.name }}
        </span>
      </div>
    </div>

    <!-- Building, with work status as a quiet contextual line underneath -->
    <div v-if="recentWork || workLine" class="py-6 border-b border-gray-200">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Building</h2>
      <p v-if="recentWork" class="text-gray-700 leading-relaxed whitespace-pre-line">{{ recentWork }}</p>
      <p v-if="workLine" class="flex items-center gap-1.5 text-sm text-gray-500 mt-3">
        <BriefcaseIcon class="h-4 w-4" /> {{ workLine }}
      </p>
    </div>

    <!-- Unique view — now the last content section before logistics -->
    <div v-if="uniqueView" :class="['py-6', logisticsLine ? 'border-b border-gray-200' : '']">
      <h2 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Unique view</h2>
      <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ uniqueView }}</p>
    </div>

    <!-- Logistics — quiet, last -->
    <p v-if="logisticsLine" class="pt-6 text-sm text-gray-400">{{ logisticsLine }}</p>

    <!-- Empty state -->
    <div v-if="!hasAnyContent" class="text-center py-12">
      <UserCircleIcon class="mx-auto h-12 w-12 text-gray-300" />
      <h3 class="mt-4 text-lg font-medium text-gray-900">
        {{ editHref ? "Your profile is just getting started" : "This profile is still pretty empty" }}
      </h3>
      <p class="mt-2 text-gray-500">
        {{ editHref ? "Add a bio, your skills, and a few links so the collective can see what you're about." : "This member hasn't filled in their profile yet." }}
      </p>
      <RouterLink
        v-if="editHref"
        :to="editHref"
        class="mt-5 inline-flex items-center px-4 py-2 bg-senpai-600 text-white rounded-lg text-sm font-medium hover:bg-senpai-700"
      >
        <PencilIcon class="h-4 w-4 mr-1.5" /> Edit your profile
      </RouterLink>
    </div>
  </div>
</template>
