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
            <strong>SENPAI FUTURES LTD</strong> (RC 9746107),
            a company incorporated in Nigeria with its registered office in the Federal Capital
            Territory, Abuja. SENPAI FUTURES LTD is the legal entity behind the collective: it
            operates this platform, signs client contracts, holds the collective's intellectual
            property, and is the party you are contracting with under these terms.
          </p>
          <p class="mt-3">
            <strong>"Senpai"</strong> is the brand and the wider organisation built around it:
            SENPAI FUTURES LTD, the Senpai Collective, Senpai Studio, and the programmes,
            products and companies operated under the Senpai name. Where these terms say
            "Senpai" without more, they mean that organisation acting through
            <strong>SENPAI FUTURES LTD</strong>, which is the only entity in it capable of
            holding a legal right or owing you an obligation.
          </p>
          <p class="mt-3">
            In these terms, <strong>"we", "us", and "the collective"</strong> mean Senpai
            Collective, the community you are joining. Where these terms create a legal right
            or obligation, it is held by <strong>SENPAI FUTURES LTD</strong>, which is named
            expressly at each of those points. These terms govern your application for, and
            participation in, membership.
          </p>
          <p class="mt-3">
            <strong>How to read "may" and "will".</strong> Where these terms say Senpai
            <strong>may</strong> do something, that describes something Senpai is permitted to
            do at its discretion. It is not a promise that it will happen, and nothing in these
            terms should be relied on as a commitment to opportunity, work, payment, equity, or
            a spinout unless the terms expressly say Senpai <strong>will</strong> do it. Where
            we do commit, we say so plainly.
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
            brief are ours; you join to build, and you're rated and credited for it. How you
            are compensated depends on which kind it is:
            <strong>client engagements are paid work</strong>, at a rate agreed with you
            before you start; <strong>the collective's own internal projects are not paid in
            money</strong>, and earn Collective Pool units instead (7.8). Neither earns both.
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
            <strong>SENPAI FUTURES LTD</strong>. Where you are staffed on a client engagement,
            the work you produce is likewise created for SENPAI FUTURES LTD, which contracts
            with the client and passes the work on under that client agreement. In both cases
            you assign that intellectual property to SENPAI FUTURES LTD as it is created, and
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
            it is held by <strong>SENPAI FUTURES LTD</strong>, and you assign it to us as it is
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

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.4a If we do nothing with it, you can take it back</h3>
          <p class="mt-2">
            Holding the intellectual property is only justified while we are actually doing
            something with the project. Most Member Projects will never be spun out, and it
            would not be right for an idea you brought to sit with us permanently because we
            decided not to act on it.
          </p>
          <p class="mt-3">
            So: where a Member Project has been <strong>dormant for twelve months</strong>,
            meaning it has shipped or stalled and Senpai is neither actively developing it nor
            has decided to spin it out, <strong>the member who originated it may ask for the
            intellectual property back, and we will transfer it</strong>. This is a commitment,
            not a discretion. We will not withhold it to keep an option open, and we will not
            charge you for it.
          </p>
          <p class="mt-3">
            <strong>It does not come back to you alone, and this matters.</strong> If other
            members built it with you, the work is theirs as much as the idea was yours, and we
            will not hand it to one person to walk away with. The intellectual property is
            transferred to <strong>the founding team together</strong>, divided on exactly the
            basis it would have been on a spinout under 7.5: the founder's allocation to you as
            the originator, and the rest by each person's recorded contribution. If you were
            genuinely the only contributor, that same calculation gives you all of it. Where the
            team wants to hold it through a company, we will transfer it into one.
          </p>
          <p class="mt-3">
            <strong>Senpai takes no equity in it.</strong> We passed on the project, so we are
            not paid for it. What we keep is narrow: a perpetual, royalty-free licence to
            <strong>show and describe</strong> the work in our portfolio and case studies, which
            does not restrict what you do with it, and ownership of any general-purpose
            component we contributed, licensed back to you perpetually and royalty-free so that
            what you take actually runs.
          </p>
          <p class="mt-3">
            Two things have to be settled first. Any contributor who is owed payment or credit
            for work on the project is settled before transfer, and where the project carries
            obligations to a client or a third party, those transfer with it.
          </p>
          <p class="mt-3">
            Pool units already earned for the work are unaffected. Everyone keeps them,
            including you.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">7.5 If a project is spun out into a Portfolio Company</h3>
          <p class="mt-2">
            <strong>Spinning a project out is entirely Senpai's decision, and it is not
            automatic.</strong> Most projects will never be spun out, and nothing in these terms
            obliges Senpai to spin out any project or entitles you to have a project you worked
            on considered for spinout. Where Senpai does decide a project should become its own
            operating company, it is incorporated as a
            <strong>Senpai Portfolio Company</strong>, and may from that point receive the
            collective's continued support: staffing, brand, client and partner access, and
            capital where warranted. The extent of that support is decided case by case.
          </p>
          <p class="mt-3">
            On spinout, SENPAI FUTURES LTD <strong>transfers the intellectual property into
            the new company</strong>, so the company genuinely owns what it was built on, and
            a <strong>Shareholders' Agreement</strong> is executed setting out shares, vesting,
            and governance. Our continuing interest is then held as equity, not as retained
            ownership of the product.
          </p>
          <ul class="mt-3 list-disc pl-6 space-y-2">
            <li>
              <strong>SENPAI FUTURES LTD takes between 20% and 40% of the company's equity</strong>,
              assessed at spinout against what the collective actually put into the project.
              <strong>A portion of that stake is allocated to the Collective Pool (7.8)</strong>,
              so part of what Senpai holds in every company is held for the members who built
              the collective that made the company possible. The proportion is set out in the
              Collective Pool Policy and is the same for every Portfolio Company at the time
              of spinout.
            </li>
            <li>
              <strong>The founding team holds the rest.</strong> Every member of the founding
              team receives equity; this is not discretionary. How it is divided among the
              team reflects each person's contribution as recorded on the platform, agreed
              with the team before spinout.
            </li>
            <li>
              <strong>The member who originated the idea receives a founder's allocation</strong>,
              set aside from the founding team's share before contribution is counted, and then
              they share in the rest on the same contribution basis as everyone else. This is
              deliberate. Execution is most of the value and the split reflects that, but an
              idea someone chose to bring here rather than build elsewhere is worth something on
              its own, and if origination earned nothing extra, nobody would bring their best
              work. The size of the allocation is set out in the
              <RouterLink to="/pool" class="text-senpai-600 underline hover:text-senpai-700">Collective Pool policy</RouterLink>
              and is the same for every project.
            </li>
            <li>
              <strong>Originating does not, by itself, keep you in the founding team.</strong>
              The allocation vests on the same terms as everyone else's equity under 7.6, and
              <strong>vesting only runs while you are actually on the project team</strong>. It
              is not a clock that keeps ticking after you have stopped taking part. If you bring
              an idea and step away, vesting stops when you do, and you keep what had vested by
              then. If you step away before the one-year cliff, or never take a seat on the
              project at all, <strong>nothing vests and the allocation is not paid</strong>.
              Bringing the idea earns the allocation; staying is what turns it into something
              you own.
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
            but by using it in the work, you grant SENPAI FUTURES LTD, its clients, and any
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
            both the equity SENPAI FUTURES LTD holds in its Portfolio Companies
            <em>and</em> the value of SENPAI FUTURES LTD itself. Members earn into it by
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
              <strong>The collective's own work is what earns units.</strong> Paid client
              engagements are compensated in cash at the agreed rate and do not earn units;
              you are already being paid for that work. Units exist for the work with no
              invoice attached: the platform, the internal products, the research, the civic
              projects and the standards. That work is generally unpaid, and ownership is how
              you are paid for it. A Collective Project may cover direct costs of execution
              where the work requires it, but a fee is not the point of it.
            </li>
            <li>
              <strong>Units are virtual shares, backed by real equity.</strong> The Pool is
              its own instrument. Your units are held in the Pool, not on any company's share
              register, so nothing here requires filings or paperwork from you. What stands
              behind them is real: actual equity in real companies. Units carry the economic
              upside of that equity, and when value is realised they are paid as if they were
              shares, but they do not make you a registered shareholder of SENPAI FUTURES LTD
              or of any Portfolio Company, and carry no voting or governance rights.
            </li>
            <li>
              <strong>They pay out when the collective actually realises value</strong>:
              when SENPAI FUTURES LTD distributes profits, when a Portfolio Company is sold or
              pays dividends, when Senpai sells part of a stake, or on a sale of SENPAI FUTURES
              LTD itself. They do not pay out on anything merely being <em>valued</em> at a
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
            written approval from SENPAI FUTURES LTD.
          </p>
          <p class="mt-3">
            <strong>Client information</strong>, meaning anything you learn or are given access to
            while working on a client engagement through the platform, including deliverables,
            communications, data, and business details, belongs to that confidentiality
            relationship, not to you individually. It may not be shared, published, retained,
            or reused outside that engagement without the client's and SENPAI FUTURES LTD's
            written consent, even after the project ends or your membership ends. This is
            separate from, and in addition to, the public project credit described in section
            7: being named as a contributor does not give you the right to disclose
            confidential project details, materials, or client information.
          </p>
          <p class="mt-3">
            Breaching this section is treated as a serious violation: it can result in
            immediate suspension or removal from the collective, and, where it causes harm to
            SENPAI FUTURES LTD, a client, or another member, including reputational or
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
            Collective or SENPAI FUTURES LTD. Any agreement purportedly made on the
            collective's behalf without that authority does not bind SENPAI FUTURES LTD.
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
            reputational harm to SENPAI FUTURES LTD, a client, or another member, we may
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
            a right.</strong> SENPAI FUTURES LTD may suspend, deactivate, or revoke a
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
            partnership, or an agency relationship between you and SENPAI FUTURES LTD. Where
            you are staffed on a paid client engagement, the basis of that engagement, whether
            as an employee, a contractor, or otherwise, will be set out in a separate written
            agreement signed before the work begins, and that agreement governs how you are
            paid, engaged, and covered.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">13. When there is a disagreement</h2>
          <p>
            Most of what is worth arguing about here comes down to the same thing: what the
            record says you did. Contribution decides units, equity, and credit, so a dispute
            about contribution is a dispute about money. It is better to have a process for
            that written down before anyone needs it than to invent one in the middle of a
            disagreement.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">13.1 Raise it early, and in writing</h3>
          <p class="mt-2">
            Raise it first with your project lead or the circle running the work, within
            <strong>30 days</strong> of the decision or record you are disputing. Most
            disagreements are a mistake in the record or a misunderstanding about scope, and
            they are cheap to fix at this stage and expensive later.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">13.2 Escalation to SENPAI FUTURES LTD</h3>
          <p class="mt-2">
            If that does not resolve it, escalate in writing to SENPAI FUTURES LTD. We will
            look at the platform record and anything you and the other people involved want to
            put in front of us, and we will <strong>give you a decision in writing, with
            reasons</strong>, normally within 30 days. Whoever decides it will not be a person
            with a direct stake in the outcome, where that is possible.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">13.3 Disputes about removal</h3>
          <p class="mt-2">
            Removal is the most serious thing that can happen to a member: it withdraws your
            credential under 10.4 and forfeits unvested units. So before a removal under 9.3
            takes effect, other than where there is a risk of immediate harm to a client, a
            member, or the collective, <strong>we will tell you what the allegation is and give
            you a fair opportunity to respond</strong>. If you are removed, you may ask us to
            review it once, in writing, within 30 days.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">13.4 Mediation before court</h3>
          <p class="mt-2">
            If a dispute survives all of that, both sides agree to attempt
            <strong>mediation in Abuja</strong>, with a mediator agreed between us, before
            starting court proceedings. Costs of the mediator are shared equally. Neither side
            has to settle, and this does not stop either of us going to court afterwards, or
            seeking an urgent injunction where one is genuinely needed.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">13.5 Being honest about the imbalance</h3>
          <p class="mt-2">
            For most of this, Senpai is deciding a matter it is also a party to. We would
            rather name that than pretend otherwise. What we can commit to is the part that
            makes it survivable: <strong>the record is the evidence</strong> and it is visible
            to you, <strong>you get reasons in writing</strong>, and nothing here removes your
            right to take a matter to court. Where a dispute is about money above a level we
            cannot fairly judge ourselves, we will agree to an independent third party
            deciding it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">14. Governing law</h2>
          <p>
            These terms are governed by the laws of the Federal Republic of Nigeria. Disputes
            arising from them are subject to the jurisdiction of the Nigerian courts, subject
            to section 13. We would far rather resolve anything directly with you first, so
            reach out before it gets that far.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">15. Changes to these terms</h2>
          <p>
            We may update these terms as the community evolves. We'll make the current
            version available here, and material changes will be communicated to members.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">16. Contact</h2>
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
