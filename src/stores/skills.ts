import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { skillsApi } from '@/api'
import type { Skill, SkillCategory } from '@/types'

export const useSkillsStore = defineStore('skills', () => {
  const skills = ref<Skill[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const fetched = ref(false)

  const skillsByCategory = computed(() => {
    const grouped: Record<SkillCategory, Skill[]> = {
      design: [],
      media: [],
      tech: [],
      content: [],
      business: [],
      other: []
    }

    skills.value.forEach(skill => {
      if (grouped[skill.category]) {
        grouped[skill.category].push(skill)
      }
    })

    return grouped
  })

  const categoryLabels: Record<SkillCategory, string> = {
    design: 'Design',
    media: 'Media & Production',
    tech: 'Technology',
    content: 'Content & Writing',
    business: 'Business',
    other: 'Other'
  }

  async function fetchSkills() {
    if (fetched.value) return

    loading.value = true
    error.value = null

    try {
      const response = await skillsApi.getSkills()
      if (response.status && response.data) {
        skills.value = response.data
        fetched.value = true
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || e.message || 'Failed to fetch skills'
    } finally {
      loading.value = false
    }
  }

  function getSkillById(id: number): Skill | undefined {
    return skills.value.find(s => s.id === id)
  }

  function getSkillName(id: number): string {
    return getSkillById(id)?.name ?? 'Unknown'
  }

  return {
    skills,
    loading,
    error,
    skillsByCategory,
    categoryLabels,
    fetchSkills,
    getSkillById,
    getSkillName
  }
})
