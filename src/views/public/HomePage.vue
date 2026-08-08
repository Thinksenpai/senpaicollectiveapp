<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useWindowScroll } from '@vueuse/core'
import { useAuthStore } from '@/stores/auth'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
import { ALUMNI } from '@/content/alumni'
import { vReveal } from '@/composables/useScrollReveal'
import AlumniMarquee from '@/components/public/AlumniMarquee.vue'
import { BriefcaseIcon } from '@heroicons/vue/24/outline'

const authStore = useAuthStore()

// Nav gains weight (more opaque, a hairline shadow) once content scrolls under it —
// a translucent material should read heavier over busy content, not float unchanged forever.
const { y: scrollY } = useWindowScroll()
</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b transition-colors duration-300"
      :class="scrollY > 8
        ? 'bg-white/90 border-gray-200 shadow-sm'
        : 'bg-white/70 border-transparent'"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <RouterLink to="/" class="flex items-center">
            <img src="/senpai_logo.svg" alt="Senpai Collective" class="h-8 w-auto" />
          </RouterLink>
          <div class="flex items-center gap-4">
            <!-- Desktop only navigation -->
            <div class="hidden sm:flex items-center gap-4">
              <RouterLink
                to="/manifesto"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Manifesto
              </RouterLink>
              <RouterLink
                to="/submit-job"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Post a Job
              </RouterLink>
              <template v-if="authStore.isAuthenticated">
                <RouterLink
                  to="/dashboard"
                  class="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </RouterLink>
              </template>
            </div>
            <!-- Sign in + Apply: visible at every width, not just desktop -->
            <template v-if="!authStore.isAuthenticated">
              <RouterLink
                to="/login"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign in
              </RouterLink>
              <RouterLink
                to="/join"
                class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition active:scale-[0.97]"
              >
                Apply Now
              </RouterLink>
            </template>
            <template v-else>
              <RouterLink
                to="/dashboard"
                class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition active:scale-[0.97]"
              >
                Dashboard
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div v-reveal.now class="mb-6">
          <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span class="font-medium tracking-wide uppercase">Senpai Collective</span>
            <span class="text-gray-300">·</span>
            <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 hover:opacity-80 transition-opacity">
              Powered by
              <img src="/senpai.svg" alt="Senpai" class="h-4 w-auto" />
            </a>
          </div>
        </div>
        <h1 v-reveal.now="80" class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Africa's Future Systems Will Be Built By
          <span class="relative inline-block text-senpai-500">
            US.
            <span class="hero-underline absolute left-0 -bottom-1 h-1 w-full rounded-full bg-senpai-300/70" />
          </span>
        </h1>
      </div>

      <!-- Member photo grid — moving strip of member photos, sharp corners -->
      <div v-reveal.now="140" class="mt-8 photo-grid-mask">
        <div class="photo-grid-track">
          <img
            v-for="(person, i) in [...ALUMNI, ...ALUMNI]"
            :key="`${person.name}-${i}`"
            :src="person.photoUrl"
            :alt="person.name"
            loading="lazy"
            class="photo-grid-item"
          />
        </div>
      </div>

      <div class="max-w-4xl mx-auto text-center">
        <p v-reveal.now="160" class="mt-8 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Senpai Collective is an elite community of creatives building the future of Africa through culture, technology, business, art, and systems. This is not a network. It's a movement.
        </p>
        <!-- Apply CTA -->
        <div v-reveal.now="240" class="mt-10">
          <!-- Apply Now CTA -->
          <div class="max-w-md mx-auto">
            <RouterLink
              to="/join"
              class="inline-flex w-full items-center justify-center px-8 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition active:scale-[0.97]"
            >
              Apply Now
            </RouterLink>
            <p class="text-gray-500 text-sm mt-3">Applications are open. Not everyone gets in — and that's the point.</p>
          </div>

          <!-- Manifesto Link -->
          <div class="mt-6">
            <RouterLink
              to="/manifesto"
              class="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-gray-300 text-gray-700 text-lg font-medium hover:bg-gray-50 transition active:scale-[0.97]"
            >
              Read the Manifesto
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- The Problem + What We're Building Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 v-reveal class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6">
          The Old Way Is Broken
        </h2>
        <p v-reveal="80" class="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Africa has no shortage of talent. What we lack is infrastructure.
        </p>

        <!-- The Problems - Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <!-- Left: The systemic failures -->
          <div class="space-y-6">
            <div v-reveal class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">1</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Schools don't prepare us</h3>
                <p class="text-gray-600">
                  Traditional education moves too slow. We graduate with degrees but not the skills the world actually needs.
                </p>
              </div>
            </div>

            <div v-reveal="100" class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">2</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Investors don't fund us</h3>
                <p class="text-gray-600">
                  Capital flows elsewhere. African founders get overlooked. We're told to prove ourselves ten times over.
                </p>
              </div>
            </div>

            <div v-reveal="200" class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">3</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Clients don't hire us</h3>
                <p class="text-gray-600">
                  Global opportunities go to the usual suspects. African creatives are invisible — not for lack of skill, but lack of access.
                </p>
              </div>
            </div>

            <div v-reveal="300" class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">4</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Platforms ban us by default</h3>
                <p class="text-gray-600">
                  To the global work economy, our whole country is a risk score. Locked out before we type a word — no matter how good we are.
                </p>
              </div>
            </div>
          </div>

          <!-- Right: The consequence -->
          <div v-reveal="120" class="bg-gray-900 rounded-2xl p-8 text-white">
            <h3 class="text-xl font-bold mb-4">The Cost of Broken Systems</h3>
            <p class="text-gray-300 mb-4">
              When legitimate paths to success are blocked, talented people find other ways. Some give up. Others take shortcuts.
            </p>
            <p class="text-gray-300 mb-4">
              Fraud. Scams. Quick money schemes. A generation of brilliant minds choosing degeneracy over value creation — not because they lack ambition, but because they lack <span class="text-white font-semibold">infrastructure</span>.
            </p>
            <p class="text-gray-300">
              We refuse to accept this as inevitable. We believe that given real opportunity, real mentorship, and real community — our people will build, not destroy.
            </p>
          </div>
        </div>

        <!-- The Pivot -->
        <div v-reveal class="text-center">
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            So we're building these systems ourselves.
          </p>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Joining Senpai Collective means signing up to work on these hard problems — together. On a platform we fully own, that no one can ban us from. We're creating the infrastructure that should have existed.
          </p>
        </div>
      </div>
    </section>

    <!-- What We're Building (Five Pillars) -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 v-reveal class="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">What We're Building</h3>
        <p v-reveal="80" class="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Senpai Collective members are building across five pillars. We don't just participate in these spaces. We build them.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div v-reveal="0" class="bg-white p-7 border border-gray-200">
            <h4 class="text-3xl font-black uppercase tracking-tight text-amber-500 mb-3">Culture</h4>
            <p class="text-gray-600">The stories, art, and ideas that shape how Africa sees itself — and how the world sees us.</p>
          </div>

          <div v-reveal="60" class="bg-white p-7 border border-gray-200">
            <h4 class="text-3xl font-black uppercase tracking-tight text-blue-500 mb-3">Technology</h4>
            <p class="text-gray-600">Products, platforms, and tools that solve real problems and create new possibilities.</p>
          </div>

          <div v-reveal="120" class="bg-white p-7 border border-gray-200">
            <h4 class="text-3xl font-black uppercase tracking-tight text-green-500 mb-3">Business</h4>
            <p class="text-gray-600">Companies, ventures, and systems that create wealth and opportunity for our communities.</p>
          </div>

          <div v-reveal="180" class="bg-white p-7 border border-gray-200">
            <h4 class="text-3xl font-black uppercase tracking-tight text-pink-500 mb-3">Art</h4>
            <p class="text-gray-600">Visual, sonic, and experiential work that moves people and shifts perspectives.</p>
          </div>

          <div v-reveal="240" class="bg-white p-7 border border-gray-200">
            <h4 class="text-3xl font-black uppercase tracking-tight text-senpai-500 mb-3">Systems</h4>
            <p class="text-gray-600">Processes, frameworks, and infrastructure that make everything else possible.</p>
          </div>

          <!-- Sixth tile: flat brand color, no gradient — keeps the grid from
               ending on an orphaned card and threads back to the ask. -->
          <div v-reveal="300" class="bg-gray-900 p-7 flex flex-col justify-between">
            <div>
              <h4 class="font-bold text-white mb-2 text-lg">Which one is yours?</h4>
              <p class="text-gray-400">Apply to build alongside people working across these five pillars right now.</p>
            </div>
            <RouterLink to="/join" class="mt-5 inline-flex items-center text-white font-semibold">
              Apply to Join
              <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <!-- What Senpai Collective Is Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p v-reveal class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-3">
          A Different Kind of Collective
        </p>

        <h2 v-reveal="60" class="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.3] mb-6 max-w-3xl">
          Not a marketplace. Not a Slack group. Not a place to
          <span v-reveal="200" class="reveal-strike text-gray-400">"network."</span>
          <span class="block mt-2">
            <span v-reveal="400" class="reveal-highlight px-3 py-1">Senpai Collective</span> is a transformation engine.
          </span>
        </h2>

        <p v-reveal="140" class="text-lg text-gray-600 mb-12 max-w-2xl">
          We find ambitious creatives — designers, developers, founders, artists, storytellers, builders of all kinds — and we give them three things:
        </p>

        <div class="flex flex-col md:flex-row md:divide-x divide-gray-200 border-t border-b border-gray-200">
          <div v-reveal="0" class="flex-1 py-8 md:px-8 first:md:pl-0 last:md:pr-0">
            <span class="block text-sm font-mono text-gray-400 mb-2">01</span>
            <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 mb-3">Community</h3>
            <p class="text-gray-600">
              Your people. The ones who understand. The ones who push you. The ones who won't let you stay comfortable.
            </p>
          </div>

          <div v-reveal="80" class="flex-1 py-8 md:px-8 first:md:pl-0 last:md:pr-0">
            <span class="block text-sm font-mono text-gray-400 mb-2">02</span>
            <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 mb-3">Opportunity</h3>
            <p class="text-gray-600">
              Real projects. Real jobs. Real collaborations. Not empty promises — actual doors that open because you're one of us.
            </p>
          </div>

          <div v-reveal="160" class="flex-1 py-8 md:px-8 first:md:pl-0 last:md:pr-0">
            <span class="block text-sm font-mono text-gray-400 mb-2">03</span>
            <h3 class="text-2xl font-black uppercase tracking-tight text-gray-900 mb-3">Growth</h3>
            <p class="text-gray-600">
              Skills, mentorship, accountability. We don't just connect you — we transform you. And we expect you to transform others.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Core Values Section -->
    <section id="values" class="py-20 bg-gray-900">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div v-reveal class="text-center mb-16">
          <img src="/corevalues.svg" alt="Core Values" class="mx-auto h-24 w-auto mb-6" />
          <h2 class="text-3xl font-bold text-white mb-4">Our Core Values</h2>
          <p class="text-gray-400 text-lg max-w-2xl mx-auto">
            These aren't just words. They're how we operate.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="(value, index) in SENPAI_MANIFESTO.values"
            :key="value.name"
            v-reveal="(index % 3) * 70"
            class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-500/50 hover:bg-gray-800/80 hover:-translate-y-1 transition-all duration-300"
          >
            <div class="flex items-center mb-4">
              <span class="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center text-sm font-bold mr-3">
                {{ index + 1 }}
              </span>
              <h3 class="text-lg font-semibold text-white">{{ value.name }}</h3>
            </div>
            <p class="text-gray-400 text-sm mb-4">{{ value.description }}</p>
            <p class="text-gray-300 text-sm italic">"{{ value.insight }}"</p>
          </div>
        </div>

        <div class="text-center mt-12">
          <RouterLink
            to="/manifesto"
            class="inline-flex items-center text-gray-300 hover:text-white font-medium"
          >
            Read the Manifesto
            <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Who This Is For Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p v-reveal class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-3">
          Who This Is For
        </p>
        <h2 v-reveal="60" class="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.3] mb-4 max-w-2xl">
          You know you're capable of more.
        </h2>
        <p v-reveal="100" class="text-lg text-gray-600 mb-12 max-w-2xl">
          You haven't found your people yet. And you know growth requires community, not just content.
        </p>

        <div v-reveal="140" class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 mb-12">
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Designers</span> who want to <span class="font-semibold text-gray-900">build products</span>, <span class="text-gray-400 line-through decoration-2">not just push pixels</span></p>
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Developers</span> who want to <span class="font-semibold text-gray-900">create systems</span>, <span class="text-gray-400 line-through decoration-2">not just write code</span></p>
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Founders</span> who want <span class="font-semibold text-gray-900">co-conspirators</span>, <span class="text-gray-400 line-through decoration-2">not just connections</span></p>
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Artists</span> who want <span class="font-semibold text-gray-900">impact</span>, <span class="text-gray-400 line-through decoration-2">not just applause</span></p>
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Storytellers</span> who want to <span class="font-semibold text-gray-900">shape culture</span>, <span class="text-gray-400 line-through decoration-2">not just follow it</span></p>
          <p class="text-gray-800"><span class="font-semibold text-gray-900">Anyone</span> who <span class="font-semibold text-gray-900">refuses to wait for permission</span> to build</p>
        </div>

        <div v-reveal="200" class="bg-gray-900 rounded-2xl p-8 sm:p-10">
          <p class="text-2xl font-black text-white uppercase tracking-tight mb-4">This is not for everyone.</p>
          <div class="text-gray-400 space-y-1 mb-6">
            <p>If you're looking for shortcuts, we're not it.</p>
            <p>If you want to take without giving, look elsewhere.</p>
            <p>If you're not serious about growth, don't apply.</p>
          </div>
          <p class="text-lg text-senpai-400 font-semibold">
            But if you're ready to be challenged, supported, and transformed — keep reading.
          </p>
        </div>
      </div>
    </section>

    <!-- The Path Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 v-reveal class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
          The Path
        </h2>
        <p v-reveal="80" class="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          This isn't a community you just join. It's a commitment to build — yourself, your work, and the people around you.
        </p>

        <div class="relative space-y-8">
          <!-- Connecting line grows top-to-bottom as the path comes into view -->
          <div
            v-reveal="120"
            class="reveal-line absolute left-6 top-6 bottom-6 w-px bg-gray-200"
            aria-hidden="true"
          />

          <div v-reveal class="relative flex gap-6">
            <div class="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
              01
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Apply</h3>
              <p class="text-gray-600">
                Show us what you've built and what you want to build next. We review every application personally — looking for builders with skill, ambition, and character.
              </p>
            </div>
          </div>

          <div v-reveal="90" class="relative flex gap-6">
            <div class="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
              02
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Take The Pledge</h3>
              <p class="text-gray-600">
                If accepted, you commit to the Senpai Pledge — a promise to build, grow, contribute, and lift others. This isn't a checkbox. It's how we hold each other accountable.
              </p>
            </div>
          </div>

          <div v-reveal="180" class="relative flex gap-6">
            <div class="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
              03
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Build Your Profile</h3>
              <p class="text-gray-600">
                Showcase your work, skills, and what you're building. This is how opportunities find you and how collaborators discover you.
              </p>
            </div>
          </div>

          <div v-reveal="270" class="relative flex gap-6">
            <div class="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
              04
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Build With Others</h3>
              <p class="text-gray-600">
                Collaborate on projects. Join build challenges. Ship real work with other members. The collective grows stronger when we build together.
              </p>
            </div>
          </div>

          <div v-reveal="360" class="relative flex gap-6">
            <div class="shrink-0 w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
              05
            </div>
            <div>
              <h3 class="text-xl font-bold text-gray-900 mb-2">Build The Next Generation</h3>
              <p class="text-gray-600">
                As you grow, you help others build. Mentor new members. Scout talent. Share what you've learned. Your success creates more builders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What The Collective Provides Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p v-reveal class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-3">
          What You Actually Get
        </p>
        <h2 v-reveal="60" class="text-4xl sm:text-5xl font-black text-gray-900 leading-[1.3] mb-6 max-w-2xl">
          Most creatives don't fail for lack of talent. They fail for lack of access.
        </h2>

        <div class="border-t border-gray-200">
          <!-- Information -->
          <div v-reveal class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-12 py-10 border-b border-gray-200">
            <h3 class="text-3xl font-black uppercase tracking-tight text-gray-900">Information</h3>
            <div>
              <p class="text-gray-900 font-semibold mb-2">
                How do you price your work? Negotiate a contract? Build a personal brand? Actually get clients?
              </p>
              <p class="text-gray-600">
                The answers exist, but they're scattered, gatekept, or buried in expensive courses. We bring that knowledge together. Members share what works. No gatekeeping. No fluff.
              </p>
            </div>
          </div>

          <!-- Structure -->
          <div v-reveal="100" class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-12 py-10 border-b border-gray-200">
            <h3 class="text-3xl font-black uppercase tracking-tight text-gray-900">Structure</h3>
            <div>
              <p class="text-gray-900 font-semibold mb-2">
                Talent without structure goes nowhere. You know what you want to do. The path from here to there isn't clear.
              </p>
              <p class="text-gray-600">
                The collective provides frameworks, accountability, and a clear path forward, with people who hold you to it.
              </p>
            </div>
          </div>

          <!-- People -->
          <div v-reveal="200" class="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-4 md:gap-12 py-10">
            <h3 class="text-3xl font-black uppercase tracking-tight text-gray-900">People</h3>
            <div>
              <p class="text-gray-900 font-semibold mb-2">
                Your environment shapes you. If no one around you has done what you want to do, you'll doubt it's possible.
              </p>
              <p class="text-gray-600">
                The collective surrounds you with people who are building, shipping, growing: people who've walked the path you're on, and people walking it beside you.
              </p>
            </div>
          </div>
        </div>

        <p v-reveal="300" class="mt-10 text-xl font-bold text-gray-900 max-w-2xl">
          Not more content. Not another course. Real access. Real structure. Real people.
        </p>
      </div>
    </section>

    <!-- Origin Story, with the alumni wall folded in as the same story's evidence -->
    <section class="py-20 bg-white overflow-hidden">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <img
          v-reveal
          src="/henry-senpai-2017.webp"
          alt="The Senpai Collective community in 2017"
          class="w-full rounded-2xl shadow-lg object-cover aspect-[21/9] mb-10"
        />

        <p v-reveal="40" class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-3">The Story Behind This</p>
        <h2 v-reveal="80" class="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.3] mb-8 max-w-2xl">
          One person's belief. It grew into a movement of 2,000.
        </h2>

        <div class="space-y-5 text-lg text-gray-700 leading-relaxed max-w-3xl">
          <p v-reveal="120">
            Nigeria has never lacked talent. What we lack are <strong class="font-bold text-gray-900">systems</strong> — real infrastructure that takes a young person with ability and actually gets them somewhere. I watched it play out over and over: designers, photographers, storytellers, artists with real skill and no one showing them how to turn that skill into a career.
          </p>
          <p v-reveal="160">
            When I moved into the Lagos tech community in January 2017, I found the same gap. Every community that existed was built for <em>developers</em>. If you were a creative using technology as your tool, there was still nowhere that felt built for you. <strong class="font-bold text-gray-900">So I built one.</strong>
          </p>
          <p v-reveal="200">
            I named it <strong class="font-bold text-gray-900">SENPAI</strong>, the Japanese word for an experienced guide who leads through example, not instruction. We started on Tuesday, August 22nd, 2017. Not a school. Not a bootcamp. A community of people who were a few steps ahead, pulling others forward.
          </p>
          <p v-reveal="240">
            Within the first year we had 574 registered members, growing four or five a day. I set a goal: <strong class="font-bold text-gray-900">2,000 people by the end of 2019</strong> — founders, artists, nerds, storytellers, anyone who believed a creative mind was as valuable in tech as a technical one.
          </p>
          <p v-reveal="280">
            Over four cohorts we hit it and kept going, past 2,000+ members. The first cohort alone put <strong class="font-bold text-gray-900">157 students into 13 mentor groups</strong>. 45 graduated, and about 35 of them are now earning in dollars or working at top firms.
          </p>
          <p v-reveal="320">
            I also got it wrong more than once. Early on I built a Slack group and <strong class="font-bold text-gray-900">300+ people joined almost overnight</strong>. Within weeks the channel went quiet, full of accounts that never engaged. I had introduced people to the brand faster than I could actually build relationships with them, and it diluted the culture I was trying to create. The lesson stuck: <em>you don't grow a real community by adding people faster. You grow it by going deep with a few people first.</em>
          </p>
          <p v-reveal="360">
            Running the curriculum, the mentors, the events, and the community all on my own taught me something else I couldn't unlearn: I hadn't yet built the internal capacity to lead the way the community deserved. If I was going to ask people to grow, I had to lead by example, which meant stepping back to build that foundation in myself first. <strong class="font-bold text-gray-900">Senpai went quiet, on purpose.</strong>
          </p>
          <p v-reveal="400">
            The vision never died. For five years, I went into the wilderness. Not to pick up a new skill, but to build <strong class="font-bold text-gray-900">the internal structure strong enough to actually hold what I was asking for</strong>. That meant facing the parts of myself I'd been avoiding, doing the quieter work no one sees. Passion without that structure is just exhaustion waiting to happen.
          </p>
          <p v-reveal="440">
            Now I'm back. Not to restart Senpai, but to <em>rebuild</em> it with the technical skills, the systems thinking, and the discipline to go deep with people instead of wide.
          </p>
          <p v-reveal="480" class="text-gray-900 font-semibold">
            This time, we're building infrastructure that scales. Systems that don't depend on one person. A community that sustains itself.
          </p>
        </div>

        <div v-reveal="520" class="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-gray-200 pt-8 max-w-3xl">
          <div>
            <p class="text-2xl font-bold text-gray-900">2,000+</p>
            <p class="text-sm text-gray-500">Community members</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">4</p>
            <p class="text-sm text-gray-500">Cohorts run</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">157</p>
            <p class="text-sm text-gray-500">First-cohort students</p>
          </div>
          <div>
            <p class="text-2xl font-bold text-gray-900">78%</p>
            <p class="text-sm text-gray-500">Of graduates earning at top firms</p>
          </div>
        </div>

        <div v-reveal="560" class="mt-8">
          <a href="https://www.henryikoh.com" target="_blank" rel="noopener noreferrer" class="font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:text-senpai-600 hover:decoration-senpai-500 transition-colors">Henry Ikoh</a>
          <p class="text-sm text-gray-500">Founder, Senpai</p>
        </div>
      </div>

      <!-- The people behind those numbers -->
      <div class="mt-16">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <h3 class="text-2xl sm:text-3xl font-black text-gray-900">A Hundred Faces From That History</h3>
          <p class="text-gray-600 mt-2 max-w-2xl">Some of the builders who came through the Collective, and what they were making.</p>
        </div>
        <AlumniMarquee />
      </div>
    </section>

    <!-- The Pledge Section -->
    <section class="py-20 bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 v-reveal class="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          The Senpai Pledge
        </h2>
        <p v-reveal="60" class="text-gray-400 text-center mb-12">
          Every member commits to our shared values. This is what holds us together.
        </p>

        <div class="bg-gray-800/50 rounded-2xl p-8 sm:p-10 border border-gray-700/50">
          <div class="space-y-4 text-lg text-gray-300 italic">
            <p
              v-for="(line, index) in SENPAI_MANIFESTO.creed"
              :key="index"
              v-reveal="index * 50"
              :class="{
                'text-white font-semibold not-italic': index >= SENPAI_MANIFESTO.creed.length - 2,
                'pt-4': index === SENPAI_MANIFESTO.creed.length - 2
              }"
            >
              {{ line }}
            </p>
          </div>
        </div>

        <div class="text-center mt-10">
          <RouterLink
            to="/manifesto"
            class="inline-flex items-center text-gray-300 hover:text-white font-medium"
          >
            Read the Manifesto
            <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Hire Section -->
    <section class="py-20 bg-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <!-- Left: Value proposition -->
          <div v-reveal>
            <p class="text-senpai-500 font-semibold mb-3">For Companies & Clients</p>
            <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Skip the Search.<br />Hire From The Collective.
            </h2>
            <p class="text-lg text-gray-600 mb-8">
              Stop sifting through endless portfolios. Our members are pre-vetted, values-aligned, and ready to build. When you hire from Senpai Collective, you're not just getting talent — you're getting builders who take ownership.
            </p>

            <div class="space-y-4 mb-8">
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-6 h-6 rounded-full bg-senpai-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p class="text-gray-700"><span class="font-semibold">Pre-vetted talent</span> — Every member passed our selective application process</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-6 h-6 rounded-full bg-senpai-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p class="text-gray-700"><span class="font-semibold">Diverse skills</span> — Designers, developers, founders, artists, and more</p>
              </div>
              <div class="flex items-start gap-3">
                <div class="shrink-0 w-6 h-6 rounded-full bg-senpai-100 flex items-center justify-center mt-0.5">
                  <svg class="w-4 h-4 text-senpai-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p class="text-gray-700"><span class="font-semibold">Values-driven</span> — Members committed to excellence and collaboration</p>
              </div>
            </div>

            <RouterLink
              to="/submit-job"
              class="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition active:scale-[0.97]"
            >
              <BriefcaseIcon class="h-5 w-5 mr-2" />
              Post a Job
            </RouterLink>
          </div>

          <!-- Right: Visual card -->
          <div v-reveal="150" class="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
            <h3 class="text-xl font-bold mb-6">How It Works</h3>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">1</div>
                <div>
                  <h4 class="font-semibold mb-1">Submit Your Brief</h4>
                  <p class="text-gray-400 text-sm">Tell us what you're building and what skills you need.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">2</div>
                <div>
                  <h4 class="font-semibold mb-1">We Match You</h4>
                  <p class="text-gray-400 text-sm">Our team reviews and connects you with the right members.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="shrink-0 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">3</div>
                <div>
                  <h4 class="font-semibold mb-1">Start Building</h4>
                  <p class="text-gray-400 text-sm">Work directly with talent that fits your needs and culture.</p>
                </div>
              </div>
            </div>
            <div class="mt-8 pt-6 border-t border-white/10">
              <p class="text-gray-400 text-sm">
                Questions? <a href="mailto:hire@senpaicollective.com" class="text-white underline hover:no-underline">hire@senpaicollective.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-24 bg-gray-900">
      <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p v-reveal class="text-sm font-bold text-senpai-400 uppercase tracking-widest mb-4">
          Your Move
        </p>
        <h2 v-reveal="60" class="text-3xl sm:text-4xl font-black text-white leading-[1.3] mb-10">
          Africa's future systems won't build themselves.
        </h2>

        <div v-reveal="120" class="mb-10 space-y-3">
          <p class="text-lg sm:text-xl text-gray-300"><span class="text-white font-bold">Designers</span> who think in products.</p>
          <p class="text-lg sm:text-xl text-gray-300"><span class="text-white font-bold">Developers</span> who think in systems.</p>
          <p class="text-lg sm:text-xl text-gray-300"><span class="text-white font-bold">Founders</span> who think in decades.</p>
          <p class="text-lg sm:text-xl text-gray-300"><span class="text-white font-bold">Artists</span> who think in movements.</p>
          <p class="text-lg sm:text-xl text-gray-300"><span class="text-white font-bold">Builders</span> who refuse to wait.</p>
        </div>

        <p v-reveal="180" class="text-2xl text-white font-black mb-10">Is that you?</p>

        <!-- Apply Now CTA (Bottom) -->
        <div v-reveal="240" class="max-w-md mx-auto">
          <RouterLink
            to="/join"
            class="inline-flex w-full items-center justify-center px-10 py-5 rounded-xl bg-white text-gray-900 text-lg font-medium hover:bg-gray-100 transition active:scale-[0.97]"
          >
            Apply Now
          </RouterLink>
        </div>

        <p class="mt-6 text-gray-500 text-sm">
          Applications are open. Not everyone gets in, and that's the point.
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-center md:text-left mb-4 md:mb-0">
            Operated by SENPAI FUTURES LTD (RC 9746107). &copy; {{ new Date().getFullYear() }}
          </p>
          <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="flex items-center hover:opacity-80 transition-opacity">
            <span class="text-sm text-gray-500">An extension of</span>
            <img src="/senpai.svg" alt="Senpai" class="h-6 w-auto ml-2" />
            <span class="ml-2 text-sm font-medium text-gray-400">SENPAI</span>
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.photo-grid-mask {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
  mask-image: linear-gradient(to right, transparent, black 6%, black 94%, transparent);
}

.photo-grid-track {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(2, 1fr);
  gap: 4px;
  width: max-content;
  animation: photo-grid-scroll 140s linear infinite;
}

.photo-grid-item {
  width: 4.5rem;
  height: 4.5rem;
  object-fit: cover;
  display: block;
}

@keyframes photo-grid-scroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@media (prefers-reduced-motion: reduce) {
  .photo-grid-track {
    animation: none !important;
  }
}
</style>
