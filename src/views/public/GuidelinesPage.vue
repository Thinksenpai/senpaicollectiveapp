<script setup lang="ts">
import { RouterLink } from 'vue-router'

const lastUpdated = 'July 2026'
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-100">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <RouterLink to="/" class="flex items-center">
          <img src="/senpai_logo.svg" alt="Senpai Collective" class="h-8 w-auto" />
        </RouterLink>
        <RouterLink to="/join" class="text-sm font-medium text-gray-700 hover:text-gray-900">
          Apply &rarr;
        </RouterLink>
      </div>
    </header>

    <main class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p class="text-sm text-gray-500 uppercase tracking-wide mb-2">Senpai Collective</p>
      <h1 class="text-3xl font-bold text-gray-900">Community Guidelines</h1>
      <p class="mt-2 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <p class="mt-6 text-gray-700 leading-relaxed">
        This is the agreement every member accepts on their first day — the concrete,
        day-to-day version of what the
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
        call "the community's standards." The
        <RouterLink to="/manifesto" class="text-senpai-600 underline hover:text-senpai-700">Manifesto</RouterLink>
        is why we exist; this is how we treat each other while we build it.
      </p>

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. Show up and contribute</h2>
          <p>
            No spectators. Every member here builds, helps, or shares — that's the deal, not
            a suggestion. If you joined to browse a directory, this isn't that. Take on tasks,
            answer a question in a task thread, propose a project, review a teammate's work.
            Extended inactivity with no participation is grounds for removal (see the Terms,
            section 8) — not because we're strict for its own sake, but because an inactive
            member is taking a seat someone actively building could have.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">2. Lift the people around you</h2>
          <p>
            We rise together or not at all. That means: answer questions when you know the
            answer, give real feedback on someone's submission instead of a rubber stamp,
            credit people for their ideas, and treat a newer member's inexperience as
            something to help with, not something to look down on. The collective is only as
            strong as how its strongest members treat its newest ones.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">3. Keep what's shared here in confidence</h2>
          <p>
            Trust is the whole asset. Members share work-in-progress, unfinished ideas, and
            honest feedback here that they wouldn't post publicly — that only works if it
            stays inside the collective. Don't screenshot, forward, or repost another member's
            private submissions, project details, or conversations outside the platform
            without their permission. If you're unsure whether something's fair game, ask
            first.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. Do the work honestly</h2>
          <p>
            Your reputation here is real and it follows you — your Senpai ID, your task
            history, your project record. Don't submit work that isn't yours, don't inflate
            what you contributed to a team project, and don't misrepresent your skills or
            experience to get onto something you can't actually deliver. If you get something
            wrong or fall behind, say so — that's a far smaller problem than being caught
            hiding it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">5. Respect, always</h2>
          <p>
            Harassment, discrimination, spam, and unlawful activity aren't tolerated — full
            stop. This applies in task comments, project threads, direct messages, and
            anywhere else the collective's name is attached. Disagree with someone's work or
            opinion as much as you want; disrespect the person and that's a different
            conversation, one that can end in suspension or removal.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">6. Carry the name</h2>
          <p>
            Membership here means the collective stakes its name on you — to clients, to
            partners, to the world. That's what makes your membership worth something, and
            it's why the standard is enforced. When you work with anyone under the Senpai
            name, you carry every other member's credibility with you.
          </p>
          <p class="mt-3">
            That trust is sustained by consistent work, not bursts of it. Membership isn't a
            badge you earned once; it's a record you keep adding to.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">What happens if this isn't followed</h2>
          <p>
            Most of the time, a quiet word from an admin is enough — nobody's perfect and this
            isn't about policing tone. But a pattern of ignoring these guidelines, or a single
            serious violation (harassment, dishonesty, leaking confidential work), can lead to
            suspension or removal, exactly as laid out in the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>,
            section 8.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/manifesto" class="text-senpai-600 underline hover:text-senpai-700">Manifesto</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/privacy" class="text-senpai-600 underline hover:text-senpai-700">Privacy Policy</RouterLink>
      </div>
    </main>
  </div>
</template>
