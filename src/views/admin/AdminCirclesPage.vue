<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { engineApi, adminEngineApi, adminApi } from '@/api'
import type { Circle, CircleStatus, Member } from '@/types'
import AdminLayout from '@/components/layout/AdminLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const loading = ref(true)
const saving = ref(false)
const circles = ref<Circle[]>([])
const members = ref<Member[]>([])
const selected = ref<Circle | null>(null)
const toast = ref('')
const errorMsg = ref('')

// Edit buffer, so a half-finished edit never mutates the list behind it.
const form = ref({
  name: '',
  tagline: '',
  status: 'proposed' as CircleStatus,
  cadence_note: '',
  seat_cap: null as number | null,
  charter_md: ''
})

const seatForm = ref({ member_id: '', is_lead: false })

const statuses: CircleStatus[] = ['proposed', 'active', 'dormant', 'closed']

const currentSeats = computed(() => (selected.value?.seats ?? []).filter((s) => !s.term_end))

function flash(msg: string) {
  toast.value = msg
  setTimeout(() => (toast.value = ''), 2500)
}

async function loadCircles() {
  const res = await engineApi.listCircles()
  circles.value = res.data ?? []
}

async function select(slug: string) {
  errorMsg.value = ''
  const res = await engineApi.getCircle(slug)
  const c = res.data
  if (!c) return
  selected.value = c
  form.value = {
    name: c.name,
    tagline: c.tagline ?? '',
    status: c.status,
    cadence_note: c.cadence_note ?? '',
    seat_cap: c.seat_cap ?? null,
    charter_md: c.charter_md ?? ''
  }
  seatForm.value = { member_id: '', is_lead: false }
}

onMounted(async () => {
  try {
    const [, m] = await Promise.all([
      loadCircles(),
      adminApi.getMembers({ status: 'approved', limit: 200 })
    ])
    members.value = m.data ?? []
    if (circles.value[0]) await select(circles.value[0].slug)
  } finally {
    loading.value = false
  }
})

async function save() {
  if (!selected.value) return
  saving.value = true
  errorMsg.value = ''
  try {
    await adminEngineApi.updateCircle(selected.value.slug, {
      name: form.value.name,
      tagline: form.value.tagline || undefined,
      status: form.value.status,
      cadence_note: form.value.cadence_note || undefined,
      seat_cap: form.value.seat_cap ?? undefined,
      charter_md: form.value.charter_md || undefined
    })
    await loadCircles()
    await select(selected.value.slug)
    flash('Saved')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Could not save'
  } finally {
    saving.value = false
  }
}

async function grantSeat() {
  if (!selected.value || !seatForm.value.member_id) return
  saving.value = true
  errorMsg.value = ''
  try {
    await adminEngineApi.grantCircleSeat(selected.value.slug, {
      member_id: seatForm.value.member_id,
      is_lead: seatForm.value.is_lead
    })
    await loadCircles()
    await select(selected.value.slug)
    flash('Seat granted')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Could not grant the seat'
  } finally {
    saving.value = false
  }
}

async function endSeat(seatId: string) {
  if (!selected.value) return
  saving.value = true
  try {
    await adminEngineApi.endCircleSeat(selected.value.slug, seatId, 'term ended')
    await loadCircles()
    await select(selected.value.slug)
    flash('Seat ended')
  } catch (e) {
    errorMsg.value = e instanceof Error ? e.message : 'Could not end the seat'
  } finally {
    saving.value = false
  }
}

function memberLabel(m: Member) {
  return m.profile?.full_name || m.email
}
</script>

<template>
  <AdminLayout>
    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-xl font-bold text-gray-900">Circles</h1>
      <p class="mt-1 text-sm text-gray-500 max-w-2xl">
        The standing machines. A circle stays <strong>proposed</strong> until its charter's
        activation conditions are met — set it to <strong>active</strong> only when it is
        genuinely running, because members can see the status and an empty active circle
        teaches them the structure is decorative.
      </p>

      <LoadingSpinner v-if="loading" class="mt-10" />

      <div v-else class="mt-6 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        <!-- Circle picker -->
        <nav class="space-y-1">
          <button
            v-for="c in circles"
            :key="c.id"
            @click="select(c.slug)"
            class="w-full text-left px-3 py-2 rounded-lg text-sm border"
            :class="selected?.slug === c.slug
              ? 'bg-senpai-50 border-senpai-200 text-senpai-800'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'"
          >
            <span class="font-medium">{{ c.name }}</span>
            <span class="block text-[10px] font-mono uppercase text-gray-400 mt-0.5">
              {{ c.status }} · {{ c.seat_count }} {{ c.seat_count === 1 ? 'seat' : 'seats' }}
            </span>
          </button>
        </nav>

        <div v-if="selected" class="space-y-6">
          <div v-if="toast" class="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            {{ toast }}
          </div>
          <div v-if="errorMsg" class="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {{ errorMsg }}
          </div>

          <!-- Details -->
          <section class="bg-white border border-gray-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-gray-900">Details</h2>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label class="block">
                <span class="text-xs font-medium text-gray-600">Name</span>
                <input v-model="form.name" class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
              </label>

              <label class="block">
                <span class="text-xs font-medium text-gray-600">Status</span>
                <select v-model="form.status" class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </label>

              <label class="block sm:col-span-2">
                <span class="text-xs font-medium text-gray-600">Tagline</span>
                <input v-model="form.tagline" class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2" />
              </label>

              <label class="block">
                <span class="text-xs font-medium text-gray-600">Cadence note</span>
                <input
                  v-model="form.cadence_note"
                  placeholder="Weekly, Thursday 16:00"
                  class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
              </label>

              <label class="block">
                <span class="text-xs font-medium text-gray-600">Seat cap</span>
                <input
                  v-model.number="form.seat_cap"
                  type="number"
                  min="1"
                  class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2"
                />
              </label>
            </div>

            <label class="block mt-4">
              <span class="text-xs font-medium text-gray-600">Charter (markdown)</span>
              <textarea
                v-model="form.charter_md"
                rows="14"
                class="mt-1 w-full text-xs font-mono border border-gray-300 rounded-lg px-3 py-2"
              />
              <span class="mt-1 block text-[11px] text-gray-400">
                Rendered on the member-facing circle page. Headings, lists and tables all work.
              </span>
            </label>

            <button
              @click="save"
              :disabled="saving"
              class="mt-4 text-sm font-medium px-4 py-2 rounded-lg bg-senpai-600 text-white hover:bg-senpai-700 disabled:opacity-50"
            >
              Save changes
            </button>
          </section>

          <!-- Seats -->
          <section class="bg-white border border-gray-200 rounded-xl p-5">
            <h2 class="text-sm font-semibold text-gray-900">
              Seats
              <span class="font-normal text-gray-500">
                {{ currentSeats.length }}<span v-if="selected.seat_cap">/{{ selected.seat_cap }}</span>
              </span>
            </h2>
            <p class="mt-1 text-xs text-gray-500">
              Seats are granted while the collective seeds its first circles. Entry becomes
              earned from the record once there is a record to compute from.
            </p>

            <ul v-if="currentSeats.length" class="mt-4 divide-y divide-gray-100">
              <li v-for="s in currentSeats" :key="s.id" class="flex items-center justify-between py-2">
                <div>
                  <p class="text-sm text-gray-900">
                    {{ s.member_name || '—' }}
                    <span v-if="s.is_lead" class="ml-1 text-[10px] font-mono uppercase text-senpai-600">Lead</span>
                  </p>
                  <p class="text-xs text-gray-500">Since {{ new Date(s.term_start).toLocaleDateString('en-GB') }}</p>
                </div>
                <button
                  @click="endSeat(s.id)"
                  :disabled="saving"
                  class="text-xs text-red-600 hover:text-red-700 disabled:opacity-50"
                >
                  End term
                </button>
              </li>
            </ul>
            <p v-else class="mt-4 text-sm text-gray-500">No seats held.</p>

            <div class="mt-4 flex flex-wrap items-end gap-3 pt-4 border-t border-gray-100">
              <label class="block flex-1 min-w-[200px]">
                <span class="text-xs font-medium text-gray-600">Grant a seat</span>
                <select v-model="seatForm.member_id" class="mt-1 w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option value="">Select a member…</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ memberLabel(m) }}</option>
                </select>
              </label>
              <label class="flex items-center gap-2 text-sm text-gray-700 pb-2">
                <input v-model="seatForm.is_lead" type="checkbox" class="rounded border-gray-300" />
                Lead
              </label>
              <button
                @click="grantSeat"
                :disabled="saving || !seatForm.member_id"
                class="text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Grant
              </button>
            </div>
          </section>

          <p class="text-xs text-gray-400">
            <RouterLink :to="`/circles/${selected.slug}`" class="underline">
              View the member-facing page
            </RouterLink>
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
