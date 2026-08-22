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
            section 11) — not because we're strict for its own sake, but because an inactive
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
          <p class="mt-3">
            This applies just as much to the collective's own internal material — unreleased
            strategy, unpublished projects, admin/platform details — and, where you're working
            on one, to client engagements: their deliverables, communications, and business
            details aren't yours to share, publish, or reuse outside that engagement, even
            after it or your membership ends. This isn't just a community norm — it's a binding
            part of the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
            (section 8), and a serious breach — especially one that harms a client or the
            collective — can mean legal action, not just removal.
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

          <h3 class="text-base font-semibold text-gray-900 mt-6">Why this one matters more here</h3>
          <p class="mt-2">
            There's a specific weight to this worth naming plainly. Nigerian builders are
            turned away every day by platforms and clients who never look at the individual;
            the assumption arrives before you do. Much of why Senpai exists is to break that.
            A client who cannot cheaply verify a stranger can verify an institution that
            stakes its own name on that person. That is the whole mechanism, and it works
            exactly as long as it is earned.
          </p>
          <p class="mt-3">
            So a member who disappears mid-project, goes silent on a client, or takes money
            for work they don't deliver isn't only losing one engagement. They are confirming
            the assumption, and handing the next hundred people the same closed door. This is
            the one thing we will not be relaxed about.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">What this asks of you, concretely</h3>
          <ul class="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Never go silent.</strong> If you're late, stuck, overwhelmed, or your
              situation has changed, say so early. A missed deadline that was flagged is a
              normal problem. A missed deadline nobody was warned about is a broken client.
            </li>
            <li>
              <strong>Don't accept work you can't deliver.</strong> Turning something down
              costs the collective nothing. Taking it and failing costs everyone.
            </li>
            <li>
              <strong>Escalate rather than improvise.</strong> If a client asks for something
              outside the agreed scope, changes the brief, or something goes wrong, bring it
              to the collective. Don't renegotiate on your own and don't absorb it silently.
            </li>
            <li>
              <strong>Speak for yourself, not for Senpai.</strong> Say you're a member, put
              it in your bio, be proud of it. But don't negotiate, commit, quote prices, or
              approach anyone <em>on behalf of</em> the collective unless you hold the role
              that carries that authority.
            </li>
            <li>
              <strong>Bring clients to the collective, not around it.</strong> If work comes
              to you because of Senpai, it belongs in front of Senpai. This is covered in the
              <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms</RouterLink>
              (section 9) because it matters that much.
            </li>
            <li>
              <strong>What you publish is the collective's face.</strong> Members are
              encouraged to build their own public brands, and that's the point. Just
              remember that anything you put out with Senpai attached to it is read as
              Senpai.
            </li>
          </ul>

          <p class="mt-4">
            None of this restricts work you do outside the collective. Take other clients,
            keep your job, run your own thing. The obligation is about what you do under this
            name, not about owning your time.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">What happens if this isn't followed</h2>
          <p>
            Most of the time, a quiet word from an admin is enough — nobody's perfect and this
            isn't about policing tone. But a pattern of ignoring these guidelines, or a single
            serious violation (harassment, dishonesty, leaking confidential work), can lead to
            suspension or removal, as laid out in the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>,
            sections 9 and 11.
          </p>
          <p class="mt-3">
            Removal is serious. It withdraws the credential you built here and forfeits any
            unvested units you hold, so it is not something we do casually or quietly.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">And if you think we've got it wrong</h2>
          <p>
            The standard runs both ways. Enforcing it on you without giving you a way to
            answer would make it something done to members rather than something members are
            part of, so section 13 of the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
            sets out what you're entitled to. In short:
          </p>
          <ul class="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>You can dispute the record.</strong> Contribution decides your units,
              your equity and your credit, so if the record of what you did is wrong, raise it
              with your project lead or circle within 30 days. Most of these are honest
              mistakes and cheap to fix early.
            </li>
            <li>
              <strong>You get a decision in writing, with reasons.</strong> If it isn't
              resolved at that level, escalate it. Whoever decides it won't be someone with a
              direct stake in the outcome, wherever that's possible.
            </li>
            <li>
              <strong>Before you're removed, you get to answer.</strong> Except where there's
              a risk of immediate harm, we will tell you what the allegation is and give you a
              fair opportunity to respond before removal takes effect. If you are removed, you
              can ask us to review it once.
            </li>
            <li>
              <strong>Mediation before anyone goes to court.</strong> If it gets that far, both
              sides try mediation in Abuja first.
            </li>
          </ul>
          <p class="mt-3">
            We'd also rather name the obvious: in most of these, Senpai is deciding something
            it is also a party to. What we can commit to is the part that makes that
            survivable — the record is the evidence and you can see it, you get reasons in
            writing, and nothing here takes away your right to go to court.
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
