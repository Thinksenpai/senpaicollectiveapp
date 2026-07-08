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
      <h1 class="text-3xl font-bold text-gray-900">Terms of Membership</h1>
      <p class="mt-2 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        Draft — these terms are being finalised and may change before public launch.
      </div>

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. Who we are</h2>
          <p>
            Senpai Collective ("Senpai", "we", "us") is a curated community of African
            creatives and builders. These terms govern your application for, and
            participation in, membership.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">2. Applying & acceptance</h2>
          <p>
            Membership is by application and is not guaranteed. We review every application
            and may accept or decline at our discretion. Submitting an application does not
            create a membership until you receive an acceptance decision from us.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">3. Accurate information</h2>
          <p>
            You agree that the information you provide — including your name, location,
            skills, portfolio, and work history — is truthful and yours to share. We may
            verify your portfolio and references, and may decline or revoke membership for
            misrepresentation.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. What membership asks of you</h2>
          <p>
            Senpai is an active community, not a directory. Members are expected to
            participate in good faith — contributing their skills, supporting other members,
            and upholding the community's standards. Persistent inactivity or conduct that
            harms the community may result in removal.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">5. Code of conduct</h2>
          <p>
            You agree to treat other members with respect and to refrain from harassment,
            discrimination, spam, or any unlawful activity. We may suspend or remove members
            who violate these standards.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">6. Your content & profile</h2>
          <p>
            If accepted, your member profile — including your name, location, skills,
            experience, portfolio, and the answers you give during onboarding (such as your
            personal goal, MBTI, school/work status, timezone, and languages) — is fully
            visible to other members and to admins. This is a member community, not a public
            directory: full visibility between members is a deliberate part of how trust and
            collaboration work here, not an oversight. You retain ownership of the content you
            submit, and grant Senpai a license to display it within the platform for the
            purpose of running the community.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">7. Projects & intellectual property</h2>
          <p>
            Senpai Collective works like a venture studio: we bring the platform, the
            community, the team-matching, and the review process; members bring the ideas and
            the work. Projects are team efforts — proposed by members, organized, approved,
            and run under the Senpai Collective name.
          </p>
          <p class="mt-3">
            Intellectual property created through a Project — the code, designs, brand, and
            any resulting product — belongs to Senpai Collective. In return, every contributor
            is credited by name and role, publicly, on their profile and the project's own
            record, for as long as the project exists. And when a Project grows into a real,
            profitable venture, the team behind it is offered equity and a co-ownership stake
            in what they built — that's not a rare exception, it's the point of building this
            way together.
          </p>
          <p class="mt-3">
            This only applies to work built <em>through</em> the platform's Projects feature.
            Anything you build independently — outside a Project, using your own time and
            tools — is entirely yours; Senpai Collective makes no claim over it. Any
            intellectual property you bring into a Project from outside the collective (prior
            work, existing tools) also remains yours and is unaffected by these terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">8. Ending membership</h2>
          <p>
            You may leave at any time by contacting us. <strong>Membership is a privilege, not
            a right</strong> — Senpai Collective may suspend, deactivate, or revoke a
            membership at our discretion, including but not limited to breach of these terms,
            the code of conduct, or the community's standards, or extended inactivity. Ending
            your membership does not change the ownership of any Project you contributed to
            (see section 7) or of work you built independently, outside a Project — but it
            does end your access to the platform and community.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">9. Changes to these terms</h2>
          <p>
            We may update these terms as the community evolves. We'll make the current
            version available here, and material changes will be communicated to members.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">10. Contact</h2>
          <p>
            Questions about these terms? Reach us at
            <a href="mailto:senpaicollective@gmail.com" class="text-senpai-600 underline hover:text-senpai-700">senpaicollective@gmail.com</a>.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/privacy" class="text-senpai-600 underline hover:text-senpai-700">Privacy Policy</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/join" class="text-senpai-600 underline hover:text-senpai-700">Back to application</RouterLink>
      </div>
    </main>
  </div>
</template>
