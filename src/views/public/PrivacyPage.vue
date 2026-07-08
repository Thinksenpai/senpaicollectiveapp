<script setup lang="ts">
import { RouterLink } from 'vue-router'

// NOTE: Starter copy — review with counsel before relying on it legally.
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
      <h1 class="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p class="mt-2 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        Draft — this policy is being finalised and may change before public launch.
      </div>

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. What we collect</h2>
          <p>
            When you apply, we collect the information you give us — your name, email,
            phone (optional), location, skills, experience, portfolio and other links, and
            the answers you provide in your application. We also record how you found us
            (for example, a scout's invite).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">2. How we use it</h2>
          <p>
            We use your information to review your application, operate the community, match
            and connect members, and communicate with you about your membership. If accepted,
            parts of your profile are shown to other members (see section 4).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">3. Email communication</h2>
          <p>
            We use your email to send essential messages — verifying your account, the
            outcome of your application, and important community updates. We do not sell
            your email address.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. What other members can see</h2>
          <p>
            If your application is accepted, your <strong>full member profile</strong> is
            visible to other members and to admins — not just a public-safe subset. That
            includes your name, location, skills, experience, portfolio, and the onboarding
            answers you give after acceptance (personal goal, MBTI, school/work status,
            timezone, languages, and birthday — shown as month and day, not year). This is
            intentional: Senpai is a trust-based member community, and full visibility between
            members is part of how that trust works. If you propose or join a Project, its
            problem statement, team, and shipped outcome are also visible to members. Your
            password is never visible to anyone and is stored only in hashed form.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">5. Who we share with</h2>
          <p>
            We share data only with the service providers that help us run the platform
            (for example, hosting, email delivery, and payments), and only as needed to
            provide the service. We may disclose information where required by law.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">6. Your choices</h2>
          <p>
            You can request access to, correction of, or deletion of your personal data by
            contacting us. Closing your membership removes your profile from the member
            directory.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">7. Changes to this policy</h2>
          <p>
            We may update this policy as the platform evolves. The current version will
            always be available here.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">8. Contact</h2>
          <p>
            Questions about your data? Reach us at
            <a href="mailto:senpaicollective@gmail.com" class="text-senpai-600 underline hover:text-senpai-700">senpaicollective@gmail.com</a>.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/join" class="text-senpai-600 underline hover:text-senpai-700">Back to application</RouterLink>
      </div>
    </main>
  </div>
</template>
