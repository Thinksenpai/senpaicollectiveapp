<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
import { vReveal } from '@/composables/useScrollReveal'
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
            <RouterLink
              to="/"
              class="hidden sm:block text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Home
            </RouterLink>
            <RouterLink
              to="/join"
              class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition active:scale-[0.97]"
            >
              Apply to Join
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>

    <!-- Bounded reading column — the sections below have full-bleed color
         backgrounds; capping the page here (rather than at the viewport)
         keeps those from turning into wide empty gutters on large screens. -->
    <div class="max-w-5xl mx-auto lg:border-x lg:border-gray-100">

    <!-- Hero -->
    <section class="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gray-900 overflow-hidden">
      <div
        class="absolute -top-32 left-1/2 -translate-x-1/2 w-[560px] h-[560px] rounded-full bg-senpai-500/20 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />
      <div class="relative max-w-3xl mx-auto text-center">
        <p v-reveal.now class="text-senpai-400 font-medium tracking-wide uppercase mb-6">The Senpai Collective</p>
        <h1 v-reveal.now="80" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
          Manifesto
        </h1>
        <p v-reveal.now="160" class="text-xl text-gray-400 italic">
          "A declaration of who we are, what we believe, and why we build."
        </p>
      </div>
    </section>

    <!-- The Manifesto Content -->
    <article class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">

        <!-- Opening Declaration -->
        <section class="mb-20">
          <p v-reveal class="text-2xl sm:text-3xl font-bold text-gray-900 leading-relaxed mb-8">
            {{ SENPAI_MANIFESTO.declarationHeadline }}
          </p>
          <p v-reveal="80" class="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{{ SENPAI_MANIFESTO.declarationBody }}</p>
        </section>

        <!-- The World As It Is -->
        <section class="mb-20">
          <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">The World As It Is</h2>
          <p v-reveal="80" class="text-lg text-gray-700 leading-relaxed whitespace-pre-line">{{ SENPAI_MANIFESTO.worldAsItIs }}</p>
        </section>

        <!-- What We Believe -->
        <section class="mb-20">
          <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">What We Believe</h2>
          <div class="space-y-6">
            <p
              v-for="(belief, index) in SENPAI_MANIFESTO.beliefs"
              :key="index"
              v-reveal="index * 60"
              class="text-lg text-gray-900 leading-relaxed"
            >
              <span class="font-bold">We believe</span> {{ belief }}
            </p>
          </div>
        </section>

        <!-- How We Change This -->
        <section class="mb-20">
          <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">How We Change This</h2>
          <div class="space-y-6">
            <p
              v-for="(line, index) in SENPAI_MANIFESTO.howWeChange"
              :key="index"
              v-reveal="index * 60"
              class="text-lg text-gray-900 leading-relaxed"
            >
              {{ line }}
            </p>
          </div>
        </section>

        <!-- What We Reject -->
        <section v-reveal class="mb-20 bg-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12">
          <div class="max-w-3xl mx-auto">
            <h2 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">What We Reject</h2>
            <div class="space-y-4 text-lg text-gray-800">
              <p v-for="(rejection, index) in SENPAI_MANIFESTO.rejections" :key="index">
                <span class="font-bold text-gray-900">We reject</span> {{ rejection }}
              </p>
            </div>
          </div>
        </section>

        <!-- Our Commitment -->
        <section class="mb-20">
          <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Our Commitment</h2>
          <p v-reveal="60" class="text-lg text-gray-700 leading-relaxed mb-8">
            To every member who joins this collective, we make these promises:
          </p>
          <div class="space-y-8">
            <div v-for="(commitment, index) in SENPAI_MANIFESTO.commitments" :key="commitment.title" v-reveal="index * 60">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ commitment.title }}</h3>
              <p class="text-gray-700">{{ commitment.description }}</p>
            </div>
          </div>
        </section>

        <!-- Core Values -->
        <section class="mb-20">
          <img v-reveal src="/corevalues.svg" alt="" class="h-16 w-16 mb-6" />
          <h2 v-reveal="40" class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Core Values</h2>
          <p v-reveal="100" class="text-lg text-gray-700 leading-relaxed mb-8">
            These are not aspirations. These are how we live:
          </p>
          <div class="space-y-8">
            <div
              v-for="(value, index) in SENPAI_MANIFESTO.values"
              :key="value.name"
              v-reveal="index * 60"
              class="border-l-4 border-gray-900 pl-6"
            >
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ value.name }}</h3>
              <p class="text-gray-700">{{ value.description }}</p>
            </div>
          </div>
        </section>

        <!-- What We're Building -->
        <section class="mb-20">
          <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">What We're Building</h2>
          <p v-reveal="60" class="text-lg text-gray-700 leading-relaxed mb-8">
            The Senpai Collective builds across five pillars. Not because we chose them arbitrarily, but because these are the domains that shape civilizations:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              v-for="(pillar, index) in SENPAI_MANIFESTO.pillars"
              :key="pillar.name"
              v-reveal="index * 60"
              class="bg-gray-50 rounded-xl p-6"
              :class="{ 'sm:col-span-2': pillar.name === 'Systems' }"
            >
              <span class="text-2xl mb-3 block">{{ pillar.emoji }}</span>
              <h3 class="font-bold text-gray-900 mb-2">{{ pillar.name }}</h3>
              <p class="text-sm text-gray-600">{{ pillar.description }}</p>
            </div>
          </div>
        </section>

      </div>
    </article>

    <!-- The Pledge Section -->
    <section id="creed" class="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div class="max-w-3xl mx-auto">
        <h2 v-reveal class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-8 text-center">The Pledge</h2>

        <div class="text-center space-y-6">
          <p
            v-for="(line, index) in SENPAI_MANIFESTO.creed"
            :key="index"
            v-reveal="index * 50"
            :class="{
              'text-2xl sm:text-3xl font-bold text-white': index >= SENPAI_MANIFESTO.creed.length - 2,
              'text-xl text-gray-300': index < SENPAI_MANIFESTO.creed.length - 2
            }"
          >
            {{ line }}
          </p>
        </div>
      </div>
    </section>

    <!-- Closing -->
    <section class="py-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-3xl mx-auto">
        <h2 v-reveal class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">The Invitation</h2>

        <p v-reveal="60" class="text-lg text-gray-700 leading-relaxed mb-6">
          This manifesto is not a marketing document. It is a declaration of war — against mediocrity, against isolation, against the systems that have failed our people.
        </p>

        <p v-reveal="120" class="text-lg text-gray-700 leading-relaxed mb-6">
          If you read this and felt something stir — that's the signal. That restlessness, that recognition, that sense of "finally, someone said it" — that's how you know you might belong here.
        </p>

        <p v-reveal="180" class="text-lg text-gray-700 leading-relaxed mb-8">
          We are not looking for spectators. We are looking for builders. People who will show up, do the work, challenge themselves, and lift others as they climb.
        </p>

        <p v-reveal="240" class="text-xl font-bold text-gray-900 mb-8">
          If that's you — we're ready when you are.
        </p>

        <RouterLink
          v-reveal="300"
          to="/join"
          class="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition active:scale-[0.97]"
        >
          Apply to Join the Collective
        </RouterLink>
      </div>
    </section>

    <!-- Signature -->
    <section class="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div class="max-w-3xl mx-auto">
        <p class="text-gray-400 text-sm">
          Est. {{ SENPAI_MANIFESTO.founding.established }}. Reaffirmed {{ new Date().getFullYear() }}.
        </p>
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
          </div>
          <p class="text-sm">
            &copy; {{ new Date().getFullYear() }} Senpai Collective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>

    </div>
  </div>
</template>
