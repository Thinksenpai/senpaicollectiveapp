<script setup lang="ts">
import AppHeader from './AppHeader.vue'
import MobileTabBar from './MobileTabBar.vue'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <main class="pb-16 sm:pb-0">
      <slot />
    </main>
    <MobileTabBar />
  </div>
</template>
