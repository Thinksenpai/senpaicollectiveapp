<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { SENPAI_MANIFESTO } from '@/content/manifesto'
import {
  UserGroupIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'

const authStore = useAuthStore()
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
            <template v-else>
              <RouterLink
                to="/login"
                class="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Sign in
              </RouterLink>
              <RouterLink
                to="/join"
                class="inline-flex items-center px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Apply to Join
              </RouterLink>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div class="max-w-4xl mx-auto text-center">
        <div class="mb-6">
          <div class="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span class="font-medium tracking-wide uppercase">Senpai Collective</span>
            <span class="text-gray-300">·</span>
            <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1 hover:opacity-80 transition-opacity">
              Powered by
              <img src="/senpai.svg" alt="Senpai" class="h-4 w-auto" />
            </a>
          </div>
        </div>
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
          Africa's Future Systems Will Be Built By <span class="text-senpai-500">US.</span>
        </h1>
        <p class="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Senpai Collective is an elite community of creatives building the future of Africa through culture, technology, business, art, and systems. This is not a network. It's a movement.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <RouterLink
            to="/join"
            class="inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Apply to Join
          </RouterLink>
          <RouterLink
            to="/manifesto"
            class="inline-flex items-center justify-center px-8 py-4 rounded-lg border border-gray-300 text-gray-700 text-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Read Our Manifesto
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- The Problem + What We're Building Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6">
          The Old Way Is Broken
        </h2>
        <p class="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
          Africa has no shortage of talent. What we lack is infrastructure.
        </p>

        <!-- The Problems - Two Column Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          <!-- Left: The systemic failures -->
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">1</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Schools don't prepare us</h3>
                <p class="text-gray-600">
                  Traditional education moves too slow. We graduate with degrees but not the skills the world actually needs.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">2</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Investors don't fund us</h3>
                <p class="text-gray-600">
                  Capital flows elsewhere. African founders get overlooked. We're told to prove ourselves ten times over.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">3</div>
              <div>
                <h3 class="text-lg font-bold text-gray-900 mb-1">Clients don't hire us</h3>
                <p class="text-gray-600">
                  Global opportunities go to the usual suspects. African creatives are invisible — not for lack of skill, but lack of access.
                </p>
              </div>
            </div>
          </div>

          <!-- Right: The consequence -->
          <div class="bg-gray-900 rounded-2xl p-8 text-white">
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
        <div class="text-center mb-16">
          <p class="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            So we're building these systems ourselves.
          </p>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            Joining Senpai Collective means signing up to work on these hard problems — together. We're creating the infrastructure that should have existed. We're proving there's a better way.
          </p>
        </div>

        <!-- What We're Building (Five Pillars) -->
        <div>
          <h3 class="text-2xl font-bold text-gray-900 text-center mb-4">What We're Building</h3>
          <p class="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            Senpai Collective members are building across five pillars. We don't just participate in these spaces. We build them.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-senpai-300 hover:shadow-md transition-all">
              <span class="text-3xl mb-3 block">🎭</span>
              <h4 class="font-bold text-gray-900 mb-2">Culture</h4>
              <p class="text-sm text-gray-600">The stories, art, and ideas that shape how Africa sees itself — and how the world sees us.</p>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-senpai-300 hover:shadow-md transition-all">
              <span class="text-3xl mb-3 block">💻</span>
              <h4 class="font-bold text-gray-900 mb-2">Technology</h4>
              <p class="text-sm text-gray-600">Products, platforms, and tools that solve real problems and create new possibilities.</p>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-senpai-300 hover:shadow-md transition-all">
              <span class="text-3xl mb-3 block">📈</span>
              <h4 class="font-bold text-gray-900 mb-2">Business</h4>
              <p class="text-sm text-gray-600">Companies, ventures, and systems that create wealth and opportunity for our communities.</p>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-senpai-300 hover:shadow-md transition-all">
              <span class="text-3xl mb-3 block">🎨</span>
              <h4 class="font-bold text-gray-900 mb-2">Art</h4>
              <p class="text-sm text-gray-600">Visual, sonic, and experiential work that moves people and shifts perspectives.</p>
            </div>

            <div class="bg-white rounded-xl p-6 border border-gray-200 hover:border-senpai-300 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">
              <span class="text-3xl mb-3 block">⚙️</span>
              <h4 class="font-bold text-gray-900 mb-2">Systems</h4>
              <p class="text-sm text-gray-600">Processes, frameworks, and infrastructure that make everything else possible.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- What Senpai Collective Is Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
          A Different Kind of Collective
        </h2>

        <div class="text-center mb-12">
          <p class="text-lg text-gray-600 mb-2">Senpai Collective is not a freelance marketplace.</p>
          <p class="text-lg text-gray-600 mb-2">Senpai Collective is not a Slack group.</p>
          <p class="text-lg text-gray-600 mb-6">Senpai Collective is not a place to "network."</p>
          <p class="text-2xl sm:text-3xl font-bold text-senpai-500">
            Senpai Collective is a transformation engine.
          </p>
        </div>

        <p class="text-lg text-gray-700 text-center mb-12 max-w-3xl mx-auto">
          We find ambitious creatives — designers, developers, founders, artists, storytellers, builders of all kinds — and we give them three things:
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-senpai-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon class="h-8 w-8 text-senpai-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Community</h3>
            <p class="text-gray-600">
              Your people. The ones who understand. The ones who push you. The ones who won't let you stay comfortable.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-senpai-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BriefcaseIcon class="h-8 w-8 text-senpai-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Opportunity</h3>
            <p class="text-gray-600">
              Real projects. Real jobs. Real collaborations. Not empty promises — actual doors that open because you're one of us.
            </p>
          </div>

          <div class="text-center">
            <div class="w-16 h-16 bg-senpai-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AcademicCapIcon class="h-8 w-8 text-senpai-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-3">Growth</h3>
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
        <div class="text-center mb-16">
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
            class="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-gray-500/50 transition-colors"
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
            Read our full manifesto
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
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-6">
          This Is For The Ones Who Know
        </h2>

        <div class="text-center mb-12 space-y-2">
          <p class="text-lg text-gray-700">You know you're capable of more.</p>
          <p class="text-lg text-gray-700">You know you haven't found your people yet.</p>
          <p class="text-lg text-gray-700">You know that growth requires community, not just content.</p>
        </div>

        <div class="bg-white rounded-2xl p-8 border border-gray-200 mb-10">
          <h3 class="text-xl font-bold text-gray-900 mb-6 text-center">Senpai Collective is for:</h3>
          <div class="space-y-4 max-w-2xl mx-auto">
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Designers who want to build products, not just push pixels</span>
            </p>
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Developers who want to create systems, not just write code</span>
            </p>
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Founders who want co-conspirators, not just connections</span>
            </p>
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Artists who want impact, not just applause</span>
            </p>
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Storytellers who want to shape culture, not just follow it</span>
            </p>
            <p class="flex items-start">
              <span class="text-senpai-500 mr-3 mt-1">→</span>
              <span class="text-gray-700">Anyone who refuses to wait for permission to build</span>
            </p>
          </div>
        </div>

        <div class="text-center">
          <p class="text-xl font-bold text-gray-900 mb-4">This is not for everyone.</p>
          <div class="text-gray-600 space-y-1">
            <p>If you're looking for shortcuts, we're not it.</p>
            <p>If you want to take without giving, look elsewhere.</p>
            <p>If you're not serious about growth, don't apply.</p>
          </div>
          <p class="mt-6 text-lg text-gray-800 font-medium">
            But if you're ready to be challenged, supported, and transformed — keep reading.
          </p>
        </div>
      </div>
    </section>

    <!-- The Path Section -->
    <section class="py-20 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-4">
          The Path
        </h2>
        <p class="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
          This isn't a community you just join. It's a commitment to build — yourself, your work, and the people around you.
        </p>

        <div class="space-y-8">
          <div class="flex gap-6">
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

          <div class="flex gap-6">
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

          <div class="flex gap-6">
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

          <div class="flex gap-6">
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

          <div class="flex gap-6">
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

    <!-- What You Get Section -->
    <section class="py-20 bg-gray-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">What You Get As A Member</h2>
          <p class="text-gray-600 text-lg max-w-2xl mx-auto">
            Membership isn't just access — it's transformation. Here's what the collective provides.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <!-- Row 1 -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <UserGroupIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Member Directory</h3>
            </div>
            <p class="text-gray-600 text-sm">
              Browse and connect with every member. Search by skill, location, or availability. Find collaborators, co-founders, and mentors.
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <BriefcaseIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Exclusive Job Board</h3>
            </div>
            <p class="text-gray-600 text-sm">
              Access opportunities from companies specifically seeking Senpai Collective talent. Get matched to jobs that fit your skills.
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <AcademicCapIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Events & Workshops</h3>
            </div>
            <p class="text-gray-600 text-sm">
              Virtual and in-person gatherings. Learn from industry experts. Build real relationships with your peers.
            </p>
          </div>

          <!-- Row 2 -->
          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <SparklesIcon class="h-5 w-5 text-senpai-500" />
              <h3 class="font-semibold text-gray-900">Public Profile</h3>
            </div>
            <p class="text-gray-600 text-sm">
              A professional profile that showcases your work, skills, and contributions. Your creative passport that travels with you.
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <svg class="h-5 w-5 text-senpai-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <h3 class="font-semibold text-gray-900">Mentorship Network</h3>
            </div>
            <p class="text-gray-600 text-sm">
              Learn from those ahead of you. Teach those behind you. The knowledge compounds as you grow within the collective.
            </p>
          </div>

          <div class="bg-white rounded-xl p-6 border border-gray-200">
            <div class="flex items-center gap-3 mb-3">
              <svg class="h-5 w-5 text-senpai-500" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <h3 class="font-semibold text-gray-900">Reputation System</h3>
            </div>
            <p class="text-gray-600 text-sm">
              Your contributions are tracked. Your growth is visible. Excellence is recognized and rewarded within the community.
            </p>
          </div>
        </div>

        <!-- Bottom Summary -->
        <div class="bg-senpai-50 border border-senpai-200 rounded-2xl p-8 text-center">
          <p class="text-lg text-gray-800 mb-2">
            <span class="font-semibold">Membership is currently free</span> — but not open to everyone.
          </p>
          <p class="text-gray-600">
            We're building something valuable, and we're selective about who joins. Your application tells us if you're ready.
          </p>
        </div>
      </div>
    </section>

    <!-- The Pledge Section -->
    <section class="py-20 bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-white text-center mb-4">
          The Senpai Pledge
        </h2>
        <p class="text-gray-400 text-center mb-12">
          Every member commits to our shared values. This is what holds us together.
        </p>

        <div class="bg-gray-800/50 rounded-2xl p-8 sm:p-10 border border-gray-700/50">
          <div class="space-y-4 text-lg text-gray-300 italic">
            <p class="text-white font-semibold not-italic">I am Senpai.</p>
            <p>I pledge to grow — every single day.</p>
            <p>I pledge to build — things that matter.</p>
            <p>I pledge to lift — those coming behind me.</p>
            <p>I pledge to pay forward — what was given to me.</p>
            <p class="pt-4">I carry this name with honor.</p>
            <p>My success is not mine alone.</p>
            <p>Where one rises, we all rise.</p>
            <p class="pt-4 text-white font-semibold not-italic">I am Senpai. I will not waste this opportunity.</p>
          </div>
        </div>

        <div class="text-center mt-10">
          <RouterLink
            to="/manifesto"
            class="inline-flex items-center text-gray-300 hover:text-white font-medium"
          >
            Read our full manifesto
            <svg class="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Hire Section -->
    <section class="py-20 bg-gray-100">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold text-gray-900">Looking to Hire?</h2>
        <p class="mt-4 text-lg text-gray-600">
          Access our curated network of vetted African creative professionals.
          Post a job and find the right talent for your project.
        </p>
        <RouterLink
          to="/submit-job"
          class="mt-8 inline-flex items-center justify-center px-8 py-4 rounded-lg bg-gray-900 text-white text-lg font-medium hover:bg-gray-800 transition-colors"
        >
          <BriefcaseIcon class="h-5 w-5 mr-2" />
          Post a Job
        </RouterLink>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-24 bg-gray-900">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          Your Move
        </h2>
        <p class="text-xl text-gray-300 mb-4">
          Africa's future systems won't build themselves.
        </p>
        <div class="text-gray-400 mb-10 space-y-1">
          <p>We need designers who think in products.</p>
          <p>Developers who think in systems.</p>
          <p>Founders who think in decades.</p>
          <p>Artists who think in movements.</p>
          <p>Builders who refuse to wait.</p>
        </div>
        <p class="text-xl text-white font-semibold mb-8">Is that you?</p>
        <RouterLink
          to="/join"
          class="inline-flex items-center justify-center px-10 py-5 rounded-xl bg-white text-gray-900 text-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Apply to Join the Collective
        </RouterLink>
        <p class="mt-6 text-gray-500 text-sm">
          Applications are reviewed within 7 days. Not everyone gets in — and that's the point.
        </p>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <a href="https://www.thinksenpai.com/" target="_blank" rel="noopener noreferrer" class="flex items-center mb-4 md:mb-0 hover:opacity-80 transition-opacity">
            <span class="text-sm text-gray-500">An extension of</span>
            <img src="/senpai.svg" alt="Senpai" class="h-6 w-auto ml-2" />
            <span class="ml-2 text-sm font-medium text-gray-400">SENPAI</span>
          </a>
          <p class="text-sm">
            &copy; {{ new Date().getFullYear() }} Senpai Collective. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
