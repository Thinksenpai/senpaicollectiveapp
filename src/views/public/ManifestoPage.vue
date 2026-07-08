<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav class="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <RouterLink to="/" class="flex items-center">
            <img src="/senpai_logo.svg" alt="Senpai Collective" class="h-8 w-auto" />
          </RouterLink>
          <div class="flex items-center gap-4">
            <!-- Desktop only navigation -->
            <div class="hidden sm:flex items-center gap-4">
              <RouterLink
                to="/"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Home
              </RouterLink>
            </div>
            <RouterLink
              to="/join"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Apply to Join
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div class="max-w-3xl mx-auto text-center">
        <p class="text-gray-600 font-medium mb-4">{{ SENPAI_MANIFESTO.founding.relationship }}</p>
        <h1 class="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
          The Senpai Collective Manifesto
        </h1>
        <p class="text-xl text-gray-600">
          The future of creativity, design, and technology.
        </p>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Our Mission</h2>
        <div class="bg-gray-900 rounded-2xl p-8">
          <p class="text-white text-lg leading-relaxed whitespace-pre-line">{{ SENPAI_MANIFESTO.mission }}</p>
        </div>
      </div>
    </section>

    <!-- Identity Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">Who We Are</h2>
        <div class="prose prose-lg text-gray-700">
          <p class="whitespace-pre-line leading-relaxed">{{ SENPAI_MANIFESTO.identity }}</p>
        </div>
      </div>
    </section>

    <!-- For Ambitious Creatives Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-gray-900 mb-6">{{ SENPAI_MANIFESTO.promise.headline }}</h2>
        <p class="text-xl text-gray-700 leading-relaxed">
          {{ SENPAI_MANIFESTO.promise.description }}
        </p>
      </div>
    </section>

    <!-- Core Values Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto">
        <div class="text-center mb-16">
          <img src="/corevalues.svg" alt="Core Values" class="mx-auto h-24 w-auto mb-6" />
          <h2 class="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
          <p class="text-gray-600 text-lg">
            Come back here from time to time to remind yourself of these values.
            We hold each other accountable to them.
          </p>
        </div>

        <div class="space-y-12">
          <div
            v-for="(value, index) in SENPAI_MANIFESTO.values"
            :key="value.name"
            class="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div class="p-8">
              <div class="flex items-start gap-6">
                <div class="w-12 h-12 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-xl font-bold shrink-0">
                  {{ index + 1 }}
                </div>
                <div class="flex-1">
                  <h3 class="text-xl font-bold text-gray-900 mb-4">{{ value.name }}</h3>
                  <p class="text-gray-700 leading-relaxed mb-4">{{ value.description }}</p>
                  <div class="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p class="text-gray-700 italic">"{{ value.insight }}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- The Creed Section -->
    <section id="creed" class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-2xl font-bold text-white mb-2">The Senpai Creed</h2>
        <p class="text-gray-400 mb-12">This is who we are. This is how we operate.</p>
        <div class="space-y-4">
          <p
            v-for="(line, index) in SENPAI_MANIFESTO.creed"
            :key="index"
            class="text-white font-medium"
            :class="{
              'text-2xl sm:text-3xl font-bold text-white': index === 0 || index === SENPAI_MANIFESTO.creed.length - 1,
              'text-lg sm:text-xl': index !== 0 && index !== SENPAI_MANIFESTO.creed.length - 1
            }"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </section>

    <!-- Why It Matters Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold text-gray-900 mb-8 text-center">Why This Matters</h2>

        <div class="space-y-6">
          <div class="bg-red-50 rounded-xl p-6 border border-red-100">
            <h3 class="font-semibold text-red-900 mb-2 flex items-center">
              <span class="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mr-3 text-sm font-bold">!</span>
              The Challenge
            </h3>
            <p class="text-red-800">{{ SENPAI_MANIFESTO.whyItMatters.problem }}</p>
          </div>

          <div class="bg-gray-100 rounded-xl p-6 border border-gray-200">
            <h3 class="font-semibold text-gray-900 mb-2 flex items-center">
              <span class="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center mr-3 text-sm font-bold">→</span>
              Our Response
            </h3>
            <p class="text-gray-700">{{ SENPAI_MANIFESTO.whyItMatters.solution }}</p>
          </div>

          <div class="bg-green-50 rounded-xl p-6 border border-green-100">
            <h3 class="font-semibold text-green-900 mb-2 flex items-center">
              <span class="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-3 text-sm font-bold">✓</span>
              The Impact
            </h3>
            <p class="text-green-800">{{ SENPAI_MANIFESTO.whyItMatters.impact }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Expect Section -->
    <section class="py-16 px-4 sm:px-6 lg:px-8 bg-amber-50">
      <div class="max-w-3xl mx-auto">
        <div class="text-center mb-10">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">What We Expect From Members</h2>
          <p class="text-gray-600">Being part of the Collective is a commitment.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="expectation in SENPAI_MANIFESTO.expectations"
            :key="expectation.title"
            class="bg-white rounded-xl p-6 border border-amber-100"
          >
            <h4 class="font-semibold text-gray-900 mb-2">{{ expectation.title }}</h4>
            <p class="text-gray-600 text-sm">{{ expectation.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div class="max-w-3xl mx-auto text-center">
        <h2 class="text-3xl font-bold text-white mb-4">Ready to Join?</h2>
        <p class="text-gray-400 mb-8 text-lg">
          {{ SENPAI_MANIFESTO.promise.commitment }}
        </p>
        <RouterLink
          to="/join"
          class="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-white text-gray-900 text-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Apply to Join the Collective
        </RouterLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-8 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex items-center mb-4 md:mb-0">
            <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="flex items-center hover:opacity-80 transition-opacity">
              <span class="text-sm text-gray-500">An extension of</span>
              <img src="/senpai.svg" alt="Senpai" class="h-6 w-auto ml-2" />
              <span class="ml-2 text-sm font-medium text-gray-400">SENPAI</span>
            </a>
            <span class="mx-2 text-gray-600">·</span>
            <span class="text-sm text-gray-500">Est. {{ SENPAI_MANIFESTO.founding.established }}</span>
          </div>
          <p class="text-sm">
            &copy; {{ new Date().getFullYear() }} Senpai Collective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
