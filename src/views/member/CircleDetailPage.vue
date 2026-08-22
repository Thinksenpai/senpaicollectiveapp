<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { marked } from 'marked'
import { engineApi } from '@/api'
import type { Circle, CircleMetric, CircleSeat, Task } from '@/types'
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const slug = route.params.slug as string

const loading = ref(true)
const circle = ref<Circle | null>(null)
const tasks = ref<Task[]>([])
const metrics = ref<CircleMetric[]>([])
const toast = ref('')
const logging = ref(false)

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

const currentSeats = computed(() => (circle.value?.seats ?? []).filter((s) => !s.term_end))
const pastSeats = computed(() => (circle.value?.seats ?? []).filter((s) => !!s.term_end))

// Only a seat holder can log the circle's cadence: it is the circle's claim
// about itself, and a claim anyone can make is worthless. The API enforces
// this too — this just avoids showing a button that would fail.
const iHoldASeat = computed(() =>
  currentSeats.value.some((s) => s.member_id === authStore.member?.id)
)

// Metrics come back as a flat series; group by month so the table reads.
const metricsByPeriod = computed(() => {
  const groups = new Map<string, CircleMetric[]>()
  for (const m of metrics.value) {
    const list = groups.get(m.period_start) ?? []
    list.push(m)
    groups.set(m.period_start, list)
  }
  return [...groups.entries()]
})

// charter_md is admin-authored (only admins can write it via the admin API),
// so rendering it is not a user-content XSS surface. If charter editing is
// ever opened to circle leads, sanitise before rendering.
const charterHtml = computed(() =>
  circle.value?.charter_md ? (marked.parse(circle.value.charter_md) as string) : ''
)

function fmtDate(d?: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
function fmtMonth(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
}

async function load() {
  const [c, t, m] = await Promise.all([
    engineApi.getCircle(slug),
    engineApi.getCircleTasks(slug),
    engineApi.getCircleMetrics(slug)
  ])
  circle.value = c.data ?? null
  tasks.value = t.data ?? []
  metrics.value = m.data ?? []
}

onMounted(async () => {
  try {
    await load()
  } catch {
    router.replace('/circles')
  } finally {
    loading.value = false
  }
})

async function logCall() {
  logging.value = true
  try {
    await engineApi.logCadence(slug, { kind: 'call_held' })
    await load()
    flash('Call logged')
  } catch {
    flash('Could not log the call')
  } finally {
    logging.value = false
  }
}

async function logTasksPublished() {
  logging.value = true
  try {
    await engineApi.logCadence(slug, { kind: 'tasks_published' })
    await load()
    flash('Tasks logged')
  } catch {
    flash('Could not log')
  } finally {
    logging.value = false
  }
}

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-200',
  proposed: 'bg-amber-50 text-amber-700 border-amber-200',
  dormant: 'bg-gray-100 text-gray-500 border-gray-200',
  closed: 'bg-gray-100 text-gray-400 border-gray-200'
}
</script>

<template>
  <AppLayout>
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <LoadingSpinner v-if="loading" class="mt-10" />

      <template v-else-if="circle">
        <RouterLink to="/circles" class="text-sm text-gray-500 hover:text-gray-700">
          &larr; Circles
        </RouterLink>

        <!-- Header -->
        <div class="mt-4 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h1 class="text-2xl font-bold text-gray-900">{{ circle.name }}</h1>
              <span
                class="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border"
                :class="statusStyles[circle.status] ?? statusStyles.dormant"
              >
                {{ circle.status }}
              </span>
            </div>
            <p v-if="circle.tagline" class="mt-1 text-gray-600">{{ circle.tagline }}</p>
            <p v-if="circle.cadence_note" class="mt-2 text-xs font-mono text-gray-500 uppercase">
              {{ circle.cadence_note }}
            </p>
          </div>

          <div v-if="circle.status === 'active'" class="text-right shrink-0">
            <span
              class="text-[10px] font-mono uppercase px-2 py-1 rounded"
              :class="circle.cadence?.on_cadence
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'"
            >
              {{ circle.cadence?.on_cadence ? 'On cadence' : 'Off cadence' }}
            </span>
            <dl class="mt-3 text-[11px] text-gray-500 space-y-0.5">
              <div><dt class="inline">Last call:</dt> <dd class="inline">{{ fmtDate(circle.cadence?.last_call_held) }}</dd></div>
              <div><dt class="inline">Tasks published:</dt> <dd class="inline">{{ fmtDate(circle.cadence?.last_tasks_published) }}</dd></div>
              <div><dt class="inline">Metrics:</dt> <dd class="inline">{{ fmtDate(circle.cadence?.last_metrics_report) }}</dd></div>
            </dl>
          </div>
        </div>

        <div v-if="toast" class="mt-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          {{ toast }}
        </div>

        <!-- Seat holders log the cadence the charter commits them to -->
        <div v-if="iHoldASeat" class="mt-5 flex flex-wrap gap-2">
          <button
            @click="logCall"
            :disabled="logging"
            class="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Log this week's call
          </button>
          <button
            @click="logTasksPublished"
            :disabled="logging"
            class="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            Log tasks published
          </button>
        </div>

        <!-- Charter -->
        <section class="mt-10">
          <h2 class="text-lg font-semibold text-gray-900">Charter</h2>
          <p class="mt-1 text-sm text-gray-500">
            What this circle owns, what it decides without the founder, and the numbers it
            exists to move.
          </p>
          <div
            v-if="circle.charter_md"
            class="charter mt-4 bg-white border border-gray-200 rounded-xl p-5 overflow-x-auto"
            v-html="charterHtml"
          />
          <p v-else class="mt-4 text-sm text-gray-500 italic">
            No charter written yet.
          </p>
        </section>

        <!-- Seats -->
        <section class="mt-10">
          <h2 class="text-lg font-semibold text-gray-900">
            Seats
            <span class="text-sm font-normal text-gray-500">
              {{ currentSeats.length }}<span v-if="circle.seat_cap">/{{ circle.seat_cap }}</span>
            </span>
          </h2>

          <ul v-if="currentSeats.length" class="mt-4 divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl">
            <li v-for="s in currentSeats" :key="s.id" class="flex items-center gap-3 px-4 py-3">
              <img v-if="s.avatar_url" :src="s.avatar_url" alt="" class="h-8 w-8 rounded-full object-cover" />
              <div class="min-w-0">
                <p class="text-sm font-medium text-gray-900">
                  {{ s.member_name }}
                  <span v-if="s.is_lead" class="ml-1 text-[10px] font-mono uppercase text-senpai-600">Lead</span>
                </p>
                <p class="text-xs text-gray-500">Since {{ fmtDate(s.term_start) }}</p>
              </div>
            </li>
          </ul>
          <p v-else class="mt-4 text-sm text-gray-500">
            No seats held yet.
          </p>

          <details v-if="pastSeats.length" class="mt-3">
            <summary class="text-xs text-gray-500 cursor-pointer">
              {{ pastSeats.length }} past {{ pastSeats.length === 1 ? 'seat' : 'seats' }}
            </summary>
            <ul class="mt-2 space-y-1">
              <li v-for="s in pastSeats" :key="s.id" class="text-xs text-gray-500">
                {{ s.member_name }} — {{ fmtDate(s.term_start) }} to {{ fmtDate(s.term_end) }}
                <span v-if="s.ended_note">({{ s.ended_note }})</span>
              </li>
            </ul>
          </details>
        </section>

        <!-- Open tasks -->
        <section class="mt-10">
          <h2 class="text-lg font-semibold text-gray-900">Open tasks</h2>
          <p class="mt-1 text-sm text-gray-500">
            Work this circle has published for any member to claim. This is how members
            without a seat build the record that earns them one.
          </p>

          <ul v-if="tasks.length" class="mt-4 divide-y divide-gray-100 bg-white border border-gray-200 rounded-xl">
            <li v-for="t in tasks" :key="t.id" class="px-4 py-3">
              <RouterLink :to="`/tasks/${t.id}`" class="text-sm font-medium text-gray-900 hover:text-senpai-600">
                {{ t.title }}
              </RouterLink>
              <p v-if="t.skill_name" class="mt-0.5 text-xs text-gray-500">{{ t.skill_name }}</p>
            </li>
          </ul>
          <p v-else class="mt-4 text-sm text-gray-500">
            Nothing on the board from this circle right now.
          </p>
        </section>

        <!-- Metrics -->
        <section class="mt-10 mb-12">
          <h2 class="text-lg font-semibold text-gray-900">Metrics</h2>
          <p class="mt-1 text-sm text-gray-500">
            Reported monthly by the circle. Visible to every member, on purpose.
          </p>

          <div v-if="metricsByPeriod.length" class="mt-4 space-y-5">
            <div v-for="[period, rows] in metricsByPeriod" :key="period">
              <p class="text-xs font-mono uppercase text-gray-500">{{ fmtMonth(period) }}</p>
              <table class="mt-2 min-w-full text-sm bg-white border border-gray-200 rounded-xl overflow-hidden">
                <tbody>
                  <tr v-for="m in rows" :key="m.id" class="border-b border-gray-100 last:border-0">
                    <td class="px-4 py-2 text-gray-700">{{ m.metric_label }}</td>
                    <td class="px-4 py-2 text-right font-medium text-gray-900">{{ m.value }}</td>
                    <td class="px-4 py-2 text-right text-xs text-gray-400 w-24">
                      <span v-if="m.target != null">of {{ m.target }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <p v-else class="mt-4 text-sm text-gray-500">
            No metrics reported yet.
          </p>
        </section>
      </template>
    </div>
  </AppLayout>
</template>

<style scoped>
/* Charter markdown. Scoped styles need :deep() to reach v-html output. */
.charter :deep(h1),
.charter :deep(h2) {
  font-size: 0.95rem;
  font-weight: 700;
  color: #111827;
  margin-top: 1.75rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #f3f4f6;
}
.charter :deep(h3) {
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  margin-top: 1.25rem;
}
.charter :deep(h1:first-child),
.charter :deep(h2:first-child) {
  margin-top: 0;
}
.charter :deep(p),
.charter :deep(li) {
  font-size: 0.875rem;
  line-height: 1.6;
  color: #374151;
}
.charter :deep(p) {
  margin-top: 0.6rem;
}
.charter :deep(ul),
.charter :deep(ol) {
  margin-top: 0.6rem;
  padding-left: 1.15rem;
  list-style: disc;
}
.charter :deep(ol) {
  list-style: decimal;
}
.charter :deep(li) {
  margin-top: 0.25rem;
}
.charter :deep(strong) {
  font-weight: 600;
  color: #111827;
}
.charter :deep(code) {
  font-family: ui-monospace, monospace;
  font-size: 0.8rem;
  background: #f3f4f6;
  padding: 0.1rem 0.3rem;
  border-radius: 0.25rem;
}
/* Tables carry a lot of each charter, so they have to read properly —
   this is the main reason the markdown is rendered rather than shown raw. */
.charter :deep(table) {
  width: 100%;
  margin-top: 0.9rem;
  border-collapse: collapse;
  font-size: 0.8125rem;
}
.charter :deep(th) {
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  padding: 0.45rem 0.7rem;
  border: 1px solid #e5e7eb;
  white-space: nowrap;
}
.charter :deep(td) {
  padding: 0.45rem 0.7rem;
  border: 1px solid #e5e7eb;
  color: #374151;
  vertical-align: top;
}
.charter :deep(blockquote) {
  margin-top: 0.9rem;
  padding: 0.5rem 0 0.5rem 0.9rem;
  border-left: 3px solid #e5e7eb;
  color: #6b7280;
}
.charter :deep(hr) {
  margin: 1.5rem 0;
  border: 0;
  border-top: 1px solid #f3f4f6;
}
</style>
