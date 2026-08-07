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
      <h1 class="text-3xl font-bold text-gray-900">Terms of Membership</h1>
      <p class="mt-2 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. Who we are</h2>
          <p>
            <strong>Senpai Collective</strong> is the community: the members, the pods, the
            standards, and the work built here. It is operated by
            <strong>Senpai Futures Ltd</strong> (RC 9746107),
            a company incorporated in Nigeria with its registered office in the Federal Capital
            Territory, Abuja. Senpai Futures Ltd is the legal entity behind the collective: it
            operates this platform, signs client contracts, holds the collective's intellectual
            property, and is the party you are contracting with under these terms.
          </p>
          <p class="mt-3">
            In these terms, <strong>"we", "us", and "the collective"</strong> mean Senpai
            Collective, the community you are joining. Where these terms create a legal right
            or obligation, it is held by <strong>Senpai Futures Ltd</strong>, which is named
            expressly at each of those points. These terms govern your application for, and
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
            You agree that the information you provide, including your name, location,
            skills, portfolio, and work history, is truthful and yours to share. We may
            verify your portfolio and references, and may decline or revoke membership for
            misrepresentation.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. What membership asks of you</h2>
          <p>
            Senpai is an active community, not a directory. Members are expected to
            participate in good faith: contributing their skills, supporting other members,
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
            If accepted, your member profile, including your name, location, skills,
            experience, portfolio, and the answers you give during onboarding (such as your
            personal goal, MBTI, school/work status, timezone, and languages), is fully
            visible to other members and to admins. This is a member community, not a public
            directory: full visibility between members is a deliberate part of how trust and
            collaboration work here, not an oversight. You retain ownership of the content you
            submit, and grant Senpai a license to display it within the platform for the
            purpose of running the community.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">7. Projects, ventures & intellectual property</h2>
          <p>
            Senpai works like a venture studio: we bring the platform, the team, the review
            process, the brand, and where it's warranted, capital and client access. Members
            bring the ideas and the work. This section sets out exactly who owns what, because
            you should be able to decide whether to build something here with the facts in
            front of you.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.1 Two kinds of project</h3>
          <p class="mt-2">
            <strong>Collective Projects</strong> are initiated by Senpai: internal products,
            civic redesigns, the platform itself, and client engagements. The idea and the
            brief are ours; you join to build, and you're paid, rated, and credited for it.
          </p>
          <p class="mt-3">
            <strong>Member Projects</strong> start with a member's own idea, brought onto the
            platform to be built properly. This is much of what the collective is for. An idea
            you could not finish alone gets a real team around it: a designer, a developer, a
            writer, a photographer, whoever it actually needs, alongside the review process and
            the standard that make the result good. Most Member Projects will remain projects,
            and that is a genuine outcome rather than a failure; a shipped thing with your name
            on it and a team who built it with you is worth having on its own terms. Where one
            reaches the point that Senpai decides to spin it out into its own company, it
            becomes a <strong>Portfolio Company</strong>, and 7.5 governs what happens then.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.2 Collective Projects and client work</h3>
          <p class="mt-2">
            Intellectual property created in a Collective Project (code, designs, brand, and
            any resulting product) is assigned to and belongs to
            <strong>Senpai Futures Ltd</strong>. Where you are staffed on a client engagement,
            the work you produce is likewise created for Senpai Futures Ltd, which contracts
            with the client and passes the work on under that client agreement. In both cases
            you assign that intellectual property to Senpai Futures Ltd as it is created, and
            agree to sign any further document reasonably needed to record the assignment. You
            are paid for client engagements on the terms agreed with you before the work
            starts.
          </p>
          <p class="mt-3">
            In return, every contributor is credited by name and role, publicly, on their
            profile and the project's own record, for as long as the project exists, subject
            to the confidentiality limits in section 8.
          </p>
          <p class="mt-3">
            Collective Projects do not carry equity in the project itself; it stays Senpai's.
            What they do earn is a share in the collective enterprise as a whole, through the
            Collective Pool described in 7.8. Client engagements are paid work; internal Collective
            Projects are how you build the record that gets you onto paid and equity-bearing
            work in the first place.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.3 Senpai runs the project</h3>
          <p class="mt-2">
            Once a project is published on the platform, whether a Collective Project or a
            Member Project, Senpai directs how it runs. That includes setting the standard the
            work must meet, deciding when it is ready to ship, and <strong>deciding who is on
            the team</strong>: we may add contributors where a project needs skills it doesn't
            have, and we may remove contributors who aren't delivering or who breach these
            terms. This is what makes it possible to actually finish things, and it is a
            condition of building here.
          </p>
          <p class="mt-3">
            Team decisions are made against the contribution record the platform already keeps
            (assigned tasks, submitted work, project seats, and peer and reviewer ratings)
            rather than on impression. If you are removed from a project team, section 7.6
            governs what happens to any equity entitlement you have built up by that point.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.4 Who owns a Member Project while it's being built</h3>
          <p class="mt-2">
            While a Member Project is being built on the platform, the intellectual property in
            it is held by <strong>Senpai Futures Ltd</strong>, and you assign it to us as it is
            created. This is deliberate and temporary: a project with several contributors,
            some of whom may join or leave, needs a single accountable owner while it is in
            progress, or it cannot be defended, licensed, or shipped.
          </p>
          <p class="mt-3">
            There is nothing extra to sign to start building. <strong>These terms are the
            agreement.</strong> The range of Senpai's stake and the basis on which it is
            assessed are set out in 7.5, and the platform itself records who is on the team and
            what each person contributed. When a project spins out, the split is built from
            that record.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.5 If a project is spun out into a Portfolio Company</h3>
          <p class="mt-2">
            <strong>Spinning a project out is Senpai's decision, and it is not automatic.</strong>
            Most Member Projects will remain projects. Where Senpai decides a project should
            become its own operating company, it is incorporated as a
            <strong>Senpai Portfolio Company</strong>, and from that point it receives the
            collective's continued support: staffing, brand, client and partner access, and
            capital where warranted.
          </p>
          <p class="mt-3">
            On spinout, Senpai Futures Ltd <strong>transfers the intellectual property into
            the new company</strong>, so the company genuinely owns what it was built on, and
            a <strong>Shareholders' Agreement</strong> is executed setting out shares, vesting,
            and governance. Our continuing interest is then held as equity, not as retained
            ownership of the product.
          </p>
          <ul class="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>Senpai Futures Ltd takes between 20% and 40% of the company's equity</strong>,
              assessed at spinout against what the collective actually put into the project.
              A fifth of that stake flows into the Collective Pool (7.8), so part of what
              Senpai holds in every company is held for the members who built the collective
              that made the company possible.
            </li>
            <li>
              <strong>The founding team holds the rest.</strong> Every member of the founding
              team receives equity; this is not discretionary. How it is divided among the
              team reflects each person's contribution as recorded on the platform, agreed
              with the team before spinout.
            </li>
            <li>
              Senpai keeps a perpetual, royalty-free licence to display, describe, and
              showcase the work in case studies, its portfolio, and its public record, and to
              reuse any general-purpose components it contributed. This does not restrict what
              the company does with its own product.
            </li>
          </ul>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.6 Vesting, and what happens if you leave</h3>
          <p class="mt-2">
            Equity in a Portfolio Company <strong>vests over time</strong>, the standard being
            four years with a one-year cliff, meaning nothing vests until you have been on it
            for a year, after which it accrues gradually. The exact schedule is set out in the
            Shareholders' Agreement.
          </p>
          <p class="mt-3">
            <strong>Time you already spent counts.</strong> Vesting is backdated to when you
            joined the project, not to the date the company was incorporated. If you spent
            eighteen months building something before it spun out, you do not start again from
            zero.
          </p>
          <p class="mt-3">
            If you leave a project or company, or are removed under 7.3, you keep what has
            vested and you lose what has not. If you leave a Member Project before it is ever
            spun out, your entitlement is settled on the same basis, measured against the
            contribution the record shows you actually made. If you are removed for
            breach of these terms, unvested equity is forfeited. Vesting exists to protect you
            as much as us: it is what stops someone who left in month two from holding a
            permanent stake in something other people spent years building.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.7 What stays yours</h3>
          <p class="mt-2">
            All of the above applies only to work built <em>through</em> the platform: inside
            a Collective Project, a Member Project, or a client engagement you were staffed on.
            Anything you build independently, on your own time and tools, is entirely yours;
            Senpai makes no claim over it, and nothing here gives us a claim over ideas you
            never brought onto the platform.
          </p>
          <p class="mt-3">
            Any intellectual property you bring into a project from outside the collective
            (prior work, your own tools, libraries, presets, or components) also remains yours
            but by using it in the work, you grant Senpai Futures Ltd, its clients, and any
            venture it spins out a perpetual, royalty-free licence to keep using it as part of
            whatever was delivered.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.8 The Collective Pool</h3>
          <p class="mt-2">
            Not every piece of work becomes a company. The platform, the civic redesigns, the
            internal products, the standards. That work is what makes the collective credible
            enough for any of the rest to exist, and it should build real ownership for the
            people who do it. That is what the <strong>Collective Pool</strong> is for.
          </p>
          <p class="mt-3">
            The Pool is a defined share of the <strong>whole collective enterprise</strong>:
            both the equity Senpai Futures Ltd holds in its Portfolio Companies
            <em>and</em> the value of Senpai Futures Ltd itself. Members earn into it by
            contributing to the collective. You are not being given a stake in one project;
            you are being given a stake in everything the collective builds.
          </p>
          <p class="mt-3">
            How it works:
          </p>
          <ul class="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>You earn units through contribution</strong>: rated task assignments,
              project seats, and reviewed work recorded on the platform. The same ledger that
              verifies your roles allocates your units, so it is the record that decides, not
              a negotiation.
            </li>
            <li>
              <strong>Units are virtual shares, backed by real equity.</strong> The Pool is
              its own instrument. Your units are held in the Pool, not on any company's share
              register, so nothing here requires filings or paperwork from you. What stands
              behind them is real: actual equity in real companies. Units carry the economic
              upside of that equity, and when value is realised they are paid as if they were
              shares, but they do not make you a registered shareholder of Senpai Futures Ltd
              or of any Portfolio Company, and carry no voting or governance rights.
            </li>
            <li>
              <strong>They pay out when the collective actually realises value</strong>:
              when Senpai Futures Ltd distributes profits, when a Portfolio Company is sold or
              pays dividends, when Senpai sells part of a stake, or on a sale of Senpai Futures
              Ltd itself. They do not pay out on anything merely being <em>valued</em> at a
              number, and there is no guarantee that any payout ever occurs.
            </li>
            <li>
              <strong>Units are issued in periods, against a capped allocation</strong>, so the
              Pool is not diluted faster than the collective grows and early contributors are
              not quietly written down by later ones.
            </li>
            <li>
              Units are subject to vesting and to good standing as a member. Being removed for
              breach of these terms forfeits unvested units.
            </li>
          </ul>
          <p class="mt-3">
            The size of the Pool, the allocation formula, the vesting schedule, and payout
            mechanics are set out in
            <RouterLink to="/pool" class="text-senpai-600 underline hover:text-senpai-700">the Collective Pool policy</RouterLink>,
            which is updated as the collective learns what works. This is a long-horizon
            instrument: realisations in this kind of business take years, and we would rather
            say that plainly than let anyone plan around it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">8. Confidentiality</h2>
          <p>
            Being trusted with real information about the collective, its members, and the
            clients it works with is part of what membership means. That trust has real
            obligations attached to it.
          </p>
          <p class="mt-3">
            <strong>Internal collective information</strong>, meaning unpublished strategy, business
            plans, unreleased projects, admin or platform systems, and other members' personal
            information you access through the platform, is shared with you only to
            participate in the collective. It is confidential and is not to be shared, posted,
            copied, or disclosed outside the collective, in whole or in part, without prior
            written approval from Senpai Futures Ltd.
          </p>
          <p class="mt-3">
            <strong>Client information</strong>, meaning anything you learn or are given access to
            while working on a client engagement through the platform, including deliverables,
            communications, data, and business details, belongs to that confidentiality
            relationship, not to you individually. It may not be shared, published, retained,
            or reused outside that engagement without the client's and Senpai Futures Ltd's
            written consent, even after the project ends or your membership ends. This is
            separate from, and in addition to, the public project credit described in section
            7: being named as a contributor does not give you the right to disclose
            confidential project details, materials, or client information.
          </p>
          <p class="mt-3">
            Breaching this section is treated as a serious violation: it can result in
            immediate suspension or removal from the collective, and, where it causes harm to
            Senpai Futures Ltd, a client, or another member, including reputational or
            financial harm, <strong>we may pursue legal action</strong>, including claims for
            damages and injunctive relief to stop further disclosure. This obligation survives
            the end of your membership: leaving the collective does not release you from it.
          </p>
          <p class="mt-3">
            None of this restricts you from work you own independently under section 7, from
            disclosures required by law, or from discussing your own experience as a member in
            ordinary, non-confidential terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">9. Representing the collective</h2>
          <p>
            The collective's reputation is the one asset no member could build alone, and it
            is what makes a vouch from Senpai worth anything to a client. It belongs to every
            member equally, which means one person's conduct under this name affects everyone
            else's standing. This section is the part of that we enforce rather than merely
            ask for.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">9.1 Authority to act for Senpai</h3>
          <p class="mt-2">
            You may say you are a member of Senpai Collective, and we hope you do. You may not
            hold yourself out as authorised to act for it. Unless you hold a role that
            expressly carries that authority, you must not negotiate or agree terms, quote
            prices, sign or commit to anything, make representations or guarantees, or
            approach any client, partner, or public body <strong>on behalf of</strong> Senpai
            Collective or Senpai Futures Ltd. Any agreement purportedly made on the
            collective's behalf without that authority does not bind Senpai Futures Ltd.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">9.2 Client work comes through the collective</h3>
          <p class="mt-2">
            Where you are introduced to a client through Senpai, or come into contact with one
            because of work done under the Senpai name, that relationship belongs in front of
            the collective. For the duration of your membership and for <strong>twelve months
            after it ends</strong>, you must not directly or indirectly solicit, contract with,
            or accept work from that client outside the collective in respect of work of the
            kind Senpai provides, without our prior written agreement.
          </p>
          <p class="mt-3">
            This does not apply to clients or relationships you already had before joining, to
            work unrelated to what the collective does, or to anyone you would plainly have
            reached without Senpai. It exists to stop the collective's own pipeline being
            quietly diverted, not to limit your career.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">9.3 Conduct that damages the collective</h3>
          <p class="mt-2">
            Abandoning a client engagement without notice, going unresponsive on committed
            work, accepting payment for work you do not deliver, misrepresenting your
            experience or contribution to obtain work, or any dishonest or fraudulent dealing
            with a client, partner, or member, is treated as a <strong>serious breach of these
            terms</strong>. It is grounds for immediate removal, and where it causes loss or
            reputational harm to Senpai Futures Ltd, a client, or another member, we may
            pursue the remedies in section 8.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">9.4 Removal is recorded</h3>
          <p class="mt-2">
            Where a member is removed for conduct under this section, that fact is recorded
            and may be communicated within the collective, and their verified status and any
            Senpai credential is withdrawn. A vouch that is never withdrawn is not a vouch, and
            members are entitled to know that the standard is real.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">9.5 What this does not restrict</h3>
          <p class="mt-2">
            Nothing here restricts your work outside the collective. Take other clients, hold
            a job, build your own company, keep any commitment you had before joining. These
            obligations concern what is done under the Senpai name and the collective's own
            client relationships. They are not a claim on your time, your career, or your
            independence.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">10. Your record is yours</h2>
          <p>
            Everything you do here builds a record: the roles you have verified and at what
            level, the contributions that were reviewed and rated, the projects you shipped
            and the seat you held on each one. That record is much of what membership is
            actually for, and it is not something we hold over you.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">10.1 You keep it, including after you leave</h3>
          <p class="mt-2">
            Your verified record belongs to you. You are entitled to a
            <strong>permanent, verifiable credential</strong>: a page you can link from a CV,
            a proposal, or a profile anywhere, showing what you did here and what Senpai
            verified about it. It stays live if you leave, and it does not expire because you
            stopped being a member. You can also export the underlying record at any time.
          </p>
          <p class="mt-3">
            Whether the credential is public or private is your choice, and you can change it
            whenever you like.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">10.2 We will vouch for it</h3>
          <p class="mt-2">
            This is the part that matters. A portfolio you assembled yourself is a claim.
            A record that an institution confirms is evidence. Where a client, employer, or
            partner asks us to verify what your credential says, <strong>we will confirm
            it</strong>, whether or not you are still a member. The point of building your
            record here is that someone else will stand behind it, and that does not stop at
            the door.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">10.3 What it shows, and what it does not</h3>
          <p class="mt-2">
            The credential shows verified roles and levels, the number of reviewed
            contributions behind each, projects shipped and your role on them, and the period
            you were a member. It does not disclose anything covered by section 8: client
            names or details we are not free to publish, unreleased work, or another member's
            information. Being credited on a project never entitles you to disclose its
            confidential contents.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">10.4 It can be withdrawn, and that is the point</h3>
          <p class="mt-2">
            A credential is withdrawn only where a member is removed for conduct under 9.3.
            That is not a threat so much as the reason the credential is worth carrying: a
            vouch that could never be withdrawn would mean nothing to the person reading it.
            Leaving on ordinary terms, including simply moving on, changes nothing about your
            record.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">11. Ending membership</h2>
          <p>
            You may leave at any time by contacting us. <strong>Membership is a privilege, not
            a right.</strong> Senpai Futures Ltd may suspend, deactivate, or revoke a
            membership at our discretion, including but not limited to breach of these terms,
            the code of conduct, or the community's standards, or extended inactivity. Ending
            your membership does not change the ownership of any Project you contributed to
            (see section 7) or of work you built independently, outside a Project, but it
            does end your access to the platform and community.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">12. Membership is not employment</h2>
          <p>
            Membership of the collective does not create an employment relationship, a
            partnership, or an agency relationship between you and Senpai Futures Ltd. Where
            you are staffed on a paid client engagement, the basis of that engagement, whether
            as an employee, a contractor, or otherwise, will be set out in a separate written
            agreement signed before the work begins, and that agreement governs how you are
            paid, engaged, and covered.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">13. Governing law</h2>
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Disputes
            arising from them are subject to the jurisdiction of the Nigerian courts. We would
            far rather resolve anything directly with you first, so reach out before it gets
            that far.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">14. Changes to these terms</h2>
          <p>
            We may update these terms as the community evolves. We'll make the current
            version available here, and material changes will be communicated to members.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">15. Contact</h2>
          <p>
            Questions about these terms? Reach us at
            <a href="mailto:senpaicollective@gmail.com" class="text-senpai-600 underline hover:text-senpai-700">senpaicollective@gmail.com</a>.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/privacy" class="text-senpai-600 underline hover:text-senpai-700">Privacy Policy</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/pool" class="text-senpai-600 underline hover:text-senpai-700">The Collective Pool</RouterLink>
        <span class="mx-2 text-gray-300">·</span>
        <RouterLink to="/join" class="text-senpai-600 underline hover:text-senpai-700">Back to application</RouterLink>
      </div>
    </main>
  </div>
</template>
