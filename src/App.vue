<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { apiClient } from '@/api'

const authStore = useAuthStore()

onMounted(async () => {
  // If we have a token, try to fetch the current member
  if (apiClient.getToken()) {
    await authStore.fetchCurrentMember()
  }
})
</script>

<template>
  <RouterView />
</template>
