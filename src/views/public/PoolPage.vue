<script setup lang="ts">
import { RouterLink } from 'vue-router'

// NOTE: Starter copy. Review with counsel before relying on it legally.
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
      <h1 class="text-3xl font-bold text-gray-900">The Collective Pool</h1>
      <p class="mt-2 text-sm text-gray-500">Last updated: {{ lastUpdated }}</p>

      <div class="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>This is new, and it will change.</strong> The Pool is deliberately experimental.
        The way units are earned, the weights, and the schedules will be revised as we learn what
        actually works for the community. What will never change is that
        <strong>units you have already earned stay yours</strong>: no revision resets your
        balance or rewrites work you have already done. See section 9.
      </div>

      <p class="mt-6 text-gray-700 leading-relaxed">
        This page is the detail behind section 7.8 of the
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>.
        It explains what the Pool is, how you earn into it, and how it pays out.
      </p>

      <div class="prose prose-gray mt-8 max-w-none text-gray-700 leading-relaxed space-y-8">
        <section>
          <h2 class="text-xl font-semibold text-gray-900">1. What the Pool is</h2>
          <p>
            Not every piece of work becomes a company. The platform, the civic redesigns, the
            internal products, the standards. That work is what makes the collective credible
            enough for any of the rest to exist, and it should build real ownership for the
            people who do it.
          </p>
          <p class="mt-3">
            The Collective Pool is <strong>20% of the whole collective enterprise</strong>:
            both the equity SENPAI FUTURES LTD holds in its Portfolio Companies, and the value
            of SENPAI FUTURES LTD itself. You are not being given a stake in one project. You
            are being given a stake in everything the collective builds.
          </p>
          <p class="mt-3">
            Your units are <strong>virtual shares, backed by real equity</strong>. They are
            held in the Pool rather than on any company's share register, so there is no
            paperwork or filing for you to deal with. What stands behind them is real: actual
            equity in real companies. Units carry the economic upside of that equity, but they
            do not make you a registered shareholder and carry no voting rights.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">2. How you earn units</h2>
          <p>
            Units come from the contribution record the platform already keeps. Nothing is
            self-reported and nothing is negotiated. If it is not on the record, it did not
            happen.
          </p>

          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 bg-white">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">Contribution</th>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="px-4 py-2 border-b border-gray-100">Completed and reviewed task, small</td><td class="px-4 py-2 border-b border-gray-100">1</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Completed and reviewed task, medium</td><td class="px-4 py-2 border-b border-gray-100">3</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Completed and reviewed task, large</td><td class="px-4 py-2 border-b border-gray-100">8</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Project seat, per shipped project</td><td class="px-4 py-2 border-b border-gray-100">25</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Circle seat, per quarter</td><td class="px-4 py-2 border-b border-gray-100">10</td></tr>
                <tr><td class="px-4 py-2">Reviewing another member's work</td><td class="px-4 py-2">1</td></tr>
              </tbody>
            </table>
          </div>

          <p class="mt-4">
            <strong>Review earns points on purpose.</strong> The whole verification system
            depends on members reviewing each other's work, and review is thankless. If it
            earned nothing it would not happen, and the record everything else rests on would
            quietly rot.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">Quality multiplier</h3>
          <p class="mt-2">
            Points are multiplied by the rating the work received: a 5 counts 1.5&times;, a 4
            counts 1.25&times;, a 3 counts 1&times;. Work rated below 3 earns nothing, and
            unrated work earns nothing at all. That is deliberate: it pushes work through
            review, which is where the standard lives.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">What does not earn units</h3>
          <p class="mt-2">
            Paid client engagements do not earn units. That work is already compensated in cash
            at the agreed rate. The Pool exists to reward the work with no invoice attached to
            it. Work not recorded on the platform earns nothing, and so do presence, tenure, and
            title on their own. Only contribution counts.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">3. How units are issued</h2>
          <p>
            Units are not minted continuously. Each quarter an allocation of units is issued
            and divided among that quarter's contributors, in proportion to the points each
            person earned that quarter. Points are only ever relative: they decide how the
            quarter's allocation is split, nothing more.
          </p>
          <p class="mt-3">
            Worked through: if a quarter issues 1,000 units and three people contribute,
            earning 36, 35 and 16 points, the 1,000 units are split 415 / 401 / 183. Those
            units are added to your balance permanently. Your share of any future payout is
            simply your vested units divided by all units outstanding.
          </p>

          <h3 class="text-base font-semibold text-gray-900 mt-6">The allocation grows as the collective grows</h3>
          <p class="mt-2">
            If the quarterly allocation were the same forever, joining late would be brutal:
            the same 1,000 units split between two hundred people instead of three would make
            identical work earn a fraction as much. So the allocation scales with the number
            of active contributors, though more slowly than the headcount does.
          </p>

          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 bg-white">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">Active contributors that quarter</th>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">Units issued</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="px-4 py-2 border-b border-gray-100">5</td><td class="px-4 py-2 border-b border-gray-100">1,000</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">10</td><td class="px-4 py-2 border-b border-gray-100">1,400</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">20</td><td class="px-4 py-2 border-b border-gray-100">2,000</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">50</td><td class="px-4 py-2 border-b border-gray-100">3,200</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">100</td><td class="px-4 py-2 border-b border-gray-100">4,500</td></tr>
                <tr><td class="px-4 py-2">200</td><td class="px-4 py-2">6,300</td></tr>
              </tbody>
            </table>
          </div>

          <h3 class="text-base font-semibold text-gray-900 mt-6">Joining early earns more, on purpose</h3>
          <p class="mt-2">
            Even with that curve, the same work earns more units in the collective's early
            years than it will later, and we would rather tell you that than let you work it
            out yourself. Joining when there is nothing yet carries risk that joining an
            established collective does not, and the units reflect it. It is the same logic
            every company uses for its early team: employee number three does better than
            employee number three hundred, and number three hundred still does well.
          </p>
          <p class="mt-3">
            Fewer units later is also not the same as less value. Forty-five units in a large
            collective can be worth far more than four hundred in a small one. The base figure
            and the curve are reviewed and set annually, in advance.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">4. Vesting</h2>
          <p>
            Units vest over <strong>four years from the date they are issued</strong>, at 25%
            per year. A <strong>12-month cliff</strong> applies from your first recorded
            contribution: nothing vests until you have been contributing for a year, and after
            that every issued unit vests on its own schedule.
          </p>
          <p class="mt-3">
            Vesting is a function of time held, not of continued contribution. Units already
            issued keep vesting for as long as you remain a member in good standing.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">5. Leaving</h2>
          <div class="mt-2 overflow-x-auto">
            <table class="min-w-full text-sm border border-gray-200 bg-white">
              <thead class="bg-gray-50">
                <tr>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">Situation</th>
                  <th class="text-left font-semibold text-gray-900 px-4 py-2 border-b border-gray-200">What happens</th>
                </tr>
              </thead>
              <tbody>
                <tr><td class="px-4 py-2 border-b border-gray-100">You leave voluntarily</td><td class="px-4 py-2 border-b border-gray-100">Keep vested units, forfeit unvested</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Removed for inactivity</td><td class="px-4 py-2 border-b border-gray-100">Keep vested units, forfeit unvested</td></tr>
                <tr><td class="px-4 py-2 border-b border-gray-100">Removed for breach of the Terms</td><td class="px-4 py-2 border-b border-gray-100">All units forfeited</td></tr>
                <tr><td class="px-4 py-2">The collective winds down</td><td class="px-4 py-2">All units vest in full</td></tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4">
            Forfeited units return to the Pool and are redistributed through future issuance.
            They do not revert to SENPAI FUTURES LTD. What the members create stays with the
            members.
          </p>
          <p class="mt-3">
            Units cannot be sold, assigned, pledged, or transferred. On the death of a member,
            vested units pass to their estate.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">6. If you brought the idea</h2>
          <p>
            This one is not about units. It is about equity in a company, and it applies where
            a <strong>Member Project</strong> you originated is spun out into a Portfolio
            Company under section 7.5 of the
            <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>.
            Those terms point here for the number, so here it is.
          </p>
          <p class="mt-3">
            <strong>The founder's allocation is 12% of the founding team's share</strong>,
            reserved for the member who originated the idea and taken off the top before
            contribution is counted. Note the base: it is 12% of what the founding team holds,
            not 12% of the company.
          </p>
          <p class="mt-3">
            You are paid twice, for two different things. The allocation is for having brought
            the idea. Then you share in everything left on exactly the same recorded
            contribution basis as everyone else on the team. Here is how that lands on a
            spinout where Senpai takes 30%, leaving the founding team 70%, across four people
            where the team lead did 40% of the work and the originator 20%:
          </p>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="border-b border-gray-300 text-left">
                  <th class="py-2 pr-4 font-semibold text-gray-900">Person</th>
                  <th class="py-2 pr-4 font-semibold text-gray-900">Allocation</th>
                  <th class="py-2 pr-4 font-semibold text-gray-900">Contribution</th>
                  <th class="py-2 font-semibold text-gray-900">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-4">Originator</td>
                  <td class="py-2 pr-4">8.4%</td>
                  <td class="py-2 pr-4">12.3%</td>
                  <td class="py-2 font-semibold">20.7%</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-4">Team lead</td>
                  <td class="py-2 pr-4">&mdash;</td>
                  <td class="py-2 pr-4">24.6%</td>
                  <td class="py-2 font-semibold">24.6%</td>
                </tr>
                <tr class="border-b border-gray-200">
                  <td class="py-2 pr-4">Contributor</td>
                  <td class="py-2 pr-4">&mdash;</td>
                  <td class="py-2 pr-4">12.3%</td>
                  <td class="py-2 font-semibold">12.3%</td>
                </tr>
                <tr>
                  <td class="py-2 pr-4">Contributor</td>
                  <td class="py-2 pr-4">&mdash;</td>
                  <td class="py-2 pr-4">12.3%</td>
                  <td class="py-2 font-semibold">12.3%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4">
            The balance is deliberate. The team lead who did double the work still comes out
            ahead of the originator, because execution is most of the value and pretending
            otherwise would be dishonest. But the originator ends up well ahead of contributors
            who did the same amount of work as them, because bringing the idea here rather than
            building it elsewhere is worth something too.
          </p>
          <p class="mt-3">
            The allocation <strong>vests on the same terms as everyone else's equity</strong>.
            Bringing an idea and then stepping away from the work keeps you the vested part and
            no more. Bringing the idea earns the allocation; staying earns the rest.
          </p>
          <p class="mt-3">
            The same 12% applies where a dormant project is handed back to its founding team
            under section 7.4a of the Terms. In that case Senpai takes no equity at all, so the
            team divides the whole of it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">7. How and when it pays</h2>
          <p>
            Units pay out only when the collective <strong>realises value in cash</strong>:
            when SENPAI FUTURES LTD distributes profits, when a Portfolio Company is sold or
            pays dividends, when Senpai sells down part of a stake, or on a sale of SENPAI
            FUTURES LTD itself.
          </p>
          <p class="mt-3">
            On a realisation event, the Pool's 20% of the net proceeds, after tax, transaction
            costs, and any debt, is distributed to unit holders in proportion to the vested
            units they hold at that date.
          </p>
          <p class="mt-3">
            <strong>Units have no determinable cash value before a realisation event.</strong>
            There is no internal market, no buyback, and no published valuation. The number of
            units you hold is real; what they are worth is not knowable until something is sold
            or pays out. <strong>There is also no guarantee that any realisation event ever
            occurs.</strong> Most ventures fail. This is a long-horizon instrument and we would
            rather say so plainly than let anyone plan around it.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">8. What you can see</h2>
          <p>
            Because units have no published price, we publish the things that actually
            determine what the Pool will one day be worth. On your own dashboard: units issued
            to you by period, units vested and unvested, your share of total units outstanding,
            and the contribution points that produced them.
          </p>
          <p class="mt-3">
            To every member, at least annually: how many Portfolio Companies exist and what
            stage they are at, <strong>SENPAI FUTURES LTD's actual revenue and profit</strong>,
            total realised to date and total distributed to the Pool, and total units
            outstanding.
          </p>
          <p class="mt-3">
            The financial figures are published in full rather than in summary. The Pool asks
            members to accept a long-horizon instrument with no market price, and asking for
            that kind of patience while withholding the numbers behind it does not work. These
            figures are confidential internal collective information under section 8 of the
            Terms of Membership, and passing them outside the collective is a breach of those
            terms.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">9. Changes to this policy</h2>
          <p>
            The Pool is early and experimental. The points, the weights, the issuance size, and
            the schedules will be revised as the collective learns what works, and members will
            be part of shaping that. Changes are published with reasonable notice before they
            take effect.
          </p>
          <p class="mt-3">
            Two things are permanent and are not subject to amendment:
          </p>
          <ul class="mt-2 list-disc pl-6 space-y-2">
            <li>
              <strong>Units already issued cannot be reduced, cancelled, or re-rated.</strong>
              Work you have already done cannot be revalued downwards later, and no revision to
              this policy resets anyone's balance.
            </li>
            <li>
              <strong>The Pool percentage cannot be reduced</strong> in respect of units
              already issued.
            </li>
          </ul>
          <p class="mt-3">
            An instrument that could be quietly rewritten against the people holding it would
            be worth nothing, and everyone would know it. These two protections are what make
            the rest of the page mean something.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">10. Tax</h2>
          <p>
            A payout is income to you, and you are responsible for your own tax position.
            Senpai will withhold and remit whatever is legally required. How a payout is
            treated depends on where you are resident and on rules that are currently changing,
            so we will publish specific guidance before the first distribution rather than
            guess at it here.
          </p>
        </section>

        <section>
          <h2 class="text-xl font-semibold text-gray-900">11. Questions</h2>
          <p>
            Ask. Reach us at
            <a href="mailto:senpaicollective@gmail.com" class="text-senpai-600 underline hover:text-senpai-700">senpaicollective@gmail.com</a>,
            and if something on this page is unclear it is worth telling us, because it means
            it is unclear to others too.
          </p>
        </section>
      </div>

      <div class="mt-12 pt-6 border-t border-gray-200 text-sm">
        <RouterLink to="/terms" class="text-senpai-600 underline hover:text-senpai-700">Terms of Membership</RouterLink>
        <span class="mx-2 text-gray-300">&middot;</span>
        <RouterLink to="/privacy" class="text-senpai-600 underline hover:text-senpai-700">Privacy Policy</RouterLink>
        <span class="mx-2 text-gray-300">&middot;</span>
        <RouterLink to="/join" class="text-senpai-600 underline hover:text-senpai-700">Back to application</RouterLink>
      </div>
    </main>
  </div>
</template>
