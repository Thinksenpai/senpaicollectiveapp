<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="text-center">
      <p class="text-6xl font-bold text-indigo-600">404</p>
      <h1 class="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
      <p class="mt-4 text-lg text-gray-600 max-w-md mx-auto">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div class="mt-8">
        <RouterLink
          to="/"
          class="inline-flex items-center px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors"
        >
          Go back home
        </RouterLink>
      </div>
    </div>
  </div>
</template>
