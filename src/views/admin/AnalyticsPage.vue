<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAdminStore } from '@/stores/admin'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { ArrowLeftIcon, ChartBarIcon } from '@heroicons/vue/24/outline'

const adminStore = useAdminStore()

onMounted(() => {
  adminStore.fetchStatistics()
  adminStore.fetchAnalytics()
})
</script>

<template>
  <AppLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <RouterLink
          to="/admin"
          class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon class="h-4 w-4 mr-1" />
          Back to Dashboard
        </RouterLink>
        <h1 class="text-2xl font-bold text-gray-900">Analytics</h1>
        <p class="mt-1 text-gray-600">
          Platform insights and member distribution.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="adminStore.statsLoading" class="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>

      <template v-else>
        <!-- Overview Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-500">Total Members</p>
            <p class="text-3xl font-bold text-gray-900">{{ adminStore.stats?.total_members || 0 }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-500">Approval Rate</p>
            <p class="text-3xl font-bold text-gray-900">{{ adminStore.stats?.approval_rate || 0 }}%</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-500">Active Scouts</p>
            <p class="text-3xl font-bold text-gray-900">{{ adminStore.stats?.active_scouts || 0 }}</p>
          </div>
          <div class="bg-white rounded-lg shadow-sm p-6">
            <p class="text-sm text-gray-500">Growth This Month</p>
            <p class="text-3xl font-bold text-green-600">+{{ adminStore.stats?.growth_this_month || 0 }}</p>
          </div>
        </div>

        <!-- Skill Distribution -->
        <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div class="flex items-center mb-6">
            <ChartBarIcon class="h-5 w-5 text-indigo-600 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">Skills Distribution</h2>
          </div>

          <div v-if="!adminStore.analytics?.skill_distribution?.length" class="text-center py-8 text-gray-500">
            No skill data available
          </div>

          <div v-else class="space-y-4">
            <div
              v-for="skill in adminStore.analytics.skill_distribution"
              :key="skill.skill_name"
              class="flex items-center"
            >
              <div class="w-32 sm:w-48 text-sm text-gray-700 truncate">
                {{ skill.skill_name }}
              </div>
              <div class="flex-1 mx-4">
                <div class="bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    class="bg-indigo-600 h-4 rounded-full transition-all duration-500"
                    :style="{
                      width: `${(skill.count / Math.max(...adminStore.analytics.skill_distribution.map(s => s.count))) * 100}%`
                    }"
                  />
                </div>
              </div>
              <div class="w-12 text-sm text-gray-600 text-right">
                {{ skill.count }}
              </div>
            </div>
          </div>
        </div>

        <!-- Location Distribution -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center mb-6">
            <ChartBarIcon class="h-5 w-5 text-green-600 mr-2" />
            <h2 class="text-lg font-semibold text-gray-900">Location Distribution</h2>
          </div>

          <div v-if="!adminStore.analytics?.location_distribution?.length" class="text-center py-8 text-gray-500">
            No location data available
          </div>

          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="location in adminStore.analytics.location_distribution"
              :key="`${location.city}-${location.country}`"
              class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p class="font-medium text-gray-900">{{ location.city }}</p>
                <p class="text-sm text-gray-500">{{ location.country }}</p>
              </div>
              <span class="text-lg font-semibold text-gray-700">{{ location.count }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>
