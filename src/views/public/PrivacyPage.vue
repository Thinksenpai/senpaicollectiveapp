<script setup lang="ts">
import { RouterLink } from 'vue-router'

const lastUpdated = 'August 2026'
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

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. Who controls your data</h2>
          <p>
            Senpai Collective is the community; it is operated by
            <strong>Senpai Futures Ltd</strong> (RC 9746107),
            a company incorporated in Nigeria with its registered office in the Federal Capital
            Territory, Abuja. Senpai Futures Ltd is the <strong>data controller</strong> for the
            personal data described in this policy, and is responsible for how it is handled.
            This policy is written to meet our obligations under the Nigeria Data Protection
            Act 2023 (NDPA).
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">2. What we collect</h2>
          <p>
            When you apply, we collect the information you give us: your name, email,
            phone (optional), location, skills, experience, portfolio and other links, and
            the answers you provide in your application. We also record how you found us
            (for example, a scout's invite).
          </p>
          <p class="mt-3">
            If you are accepted, we also collect the onboarding details you choose to provide
            (personal goal, timezone, birthday, work or school status, MBTI, languages, social
            links), and we record your activity on the platform: tasks you are assigned and
            submit, projects you join, reviews and ratings of your work, and contribution
            history. This activity record is the basis of the verified track record described
            in section 5.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">3. How we use it, and on what basis</h2>
          <p>
            We use your information to review your application, operate the community, match
            and connect members, staff members onto projects and client engagements, maintain
            the verified work record, and communicate with you about your membership. If
            accepted, parts of your profile are shown to other members (see section 5).
          </p>
          <p class="mt-3">
            Under the NDPA, we rely on these lawful bases: <strong>your consent</strong> (which
            you give when you apply, and can withdraw); <strong>performance of a contract</strong>
            (operating your membership and any engagement you take on under the Terms of
            Membership); and our <strong>legitimate interests</strong> in running a trust-based
            community, verifying that people are who they say they are, keeping the standard
            honest, and protecting members and clients from misrepresentation.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. Email communication</h2>
          <p>
            We use your email to send essential messages: verifying your account, the
            outcome of your application, and important community updates. We do not sell
            your email address.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">5. What other members can see</h2>
          <p>
            If your application is accepted, your <strong>full member profile</strong> is
            visible to other members and to admins, not just a public-safe subset. That
            includes your name, location, skills, experience, portfolio, and the onboarding
            answers you give after acceptance (personal goal, MBTI, school/work status,
            timezone, languages, and birthday, shown as month and day, not year). This is
            intentional: Senpai is a trust-based member community, and full visibility between
            members is part of how that trust works. If you propose or join a Project, its
            problem statement, team, and shipped outcome are also visible to members. Your
            password is never visible to anyone and is stored only in hashed form.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">6. Who we share with</h2>
          <p>
            We share data only with the service providers that help us run the platform
            (for example, hosting, email delivery, and payments), and only as needed to
            provide the service. We may disclose information where required by law.
          </p>
          <p class="mt-3">
            <strong>Clients.</strong> If you are put forward for or staffed on a client
            engagement, we share what that client reasonably needs to make the decision and
            work with you: typically your name, the relevant skills and experience, your
            portfolio, and your verified work record. We do not share your onboarding
            details, contact information, or anything else from your profile with a client
            without telling you.
          </p>
          <p class="mt-3">
            <strong>We do not sell your personal data</strong> to anyone, for any purpose.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">7. Data leaving Nigeria</h2>
          <p>
            Some of the services we use to run the platform (hosting, email delivery,
            analytics) process data on servers outside Nigeria. Where we work with clients
            based abroad, information shared under section 6 will also be transferred outside
            Nigeria. When that happens we take reasonable steps, as required by the NDPA, to
            ensure the recipient provides an adequate level of protection for your data,
            including through contractual commitments.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">8. How long we keep it</h2>
          <p>
            We keep your data for as long as your membership is active. If your application is
            declined, we keep it for up to 12 months so we can recognise you if you reapply,
            then delete it. If you leave, we remove your profile from the member directory and
            delete your personal data within a reasonable period. We also keep whatever we are
            required by law to keep.
          </p>
          <p class="mt-3">
            <strong>Your verified record is treated differently, in your favour.</strong> The
            record of what you did here (roles verified, contributions reviewed, projects
            shipped and the seat you held) is kept, and it stays available <em>to you</em>
            after you leave, as the permanent credential described in section 10 of the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>.
            It is yours to keep and to show, and we will confirm it to anyone who asks. If you
            would rather it were taken down, tell us and we will remove it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">9. Keeping it secure</h2>
          <p>
            Passwords are stored only in hashed form and are never visible to anyone,
            including us. The platform is served over encrypted connections, and access to
            member data is limited to the admins who need it to run the community. No system
            is perfectly secure, but if a breach ever affects your personal data we will act on
            it and notify you and the Nigeria Data Protection Commission as the NDPA requires.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">10. Your rights</h2>
          <p>
            Under the NDPA you have the right to access the personal data we hold about you,
            correct it if it is wrong, request its deletion, object to or restrict how we use
            it, withdraw consent you previously gave, and receive a copy of your data in a
            portable form. Exercise any of these by contacting us at the address below, and we
            will respond within the timeframe the NDPA requires.
          </p>
          <p class="mt-3">
            If you believe we have handled your data wrongly and we have not resolved it with
            you, you have the right to lodge a complaint with the
            <strong>Nigeria Data Protection Commission (NDPC)</strong>.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">11. Changes to this policy</h2>
          <p>
            We may update this policy as the platform evolves. The current version will
            always be available here.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">12. Contact</h2>
          <p>
            Questions about your data, or want to exercise any of the rights in section 10?
            Reach us at
            <a href="mailto:senpaicollective@gmail.com" class="text-senpai-600 underline hover:text-senpai-700">senpaicollective@gmail.com</a>.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/pool" class="text-senpai-600 underline hover:text-senpai-700">The Collective Pool</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/join" class="text-senpai-600 underline hover:text-senpai-700">Back to application</RouterLink>
      </div>
    </main>
  </div>
</template>
