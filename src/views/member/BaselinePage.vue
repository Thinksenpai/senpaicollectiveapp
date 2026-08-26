<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { baselinesApi } from '@/api'
import AppLayout from '@/components/layout/AppLayout.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseSelect from '@/components/common/BaseSelect.vue'
import BaseTextarea from '@/components/common/BaseTextarea.vue'
import BaseCheckbox from '@/components/common/BaseCheckbox.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseAlert from '@/components/common/BaseAlert.vue'

// Where the member records their starting point, before induction. Deliberately
// self-report — nobody else knows what they earn — and deliberately skippable
// field by field: a blank answer must stay different from a "no", especially on
// the exclusion questions.
const router = useRouter()
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const savedAt = ref<string | null>(null)

const form = reactive({
  monthly_income: '' as string,
  income_currency: 'NGN',
  employment_status: '' as string,
  ever_paid_foreign_currency: '' as string,
  rate_amount: '' as string,
  rate_currency: 'NGN',
  rate_unit: '' as string,
  client_geography: '' as string,
  how_they_find_work: '',
  has_ownership_stake: '' as string,
  ownership_detail: '',
  platform_rejected: '' as string,
  platform_rejected_detail: '',
  client_withdrew_after_location: '' as string,
  obscures_location: '' as string,
  portfolio_url: '',
  hours_per_week: '' as string,
  goal_in_own_words: '',
  consent_anonymised: false,
  consent_named_story: false
})

const yesNo = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]
const num = (v: string) => (v === '' ? undefined : Number(v))
const bool = (v: string) => (v === '' ? undefined : v === 'yes')
const str = (v: string) => (v.trim() === '' ? undefined : v.trim())

onMounted(async () => {
  try {
    const existing = (await baselinesApi.getMyBaseline('intake')).data
    if (existing) {
      savedAt.value = existing.captured_at
      form.monthly_income = existing.monthly_income?.toString() ?? ''
      form.income_currency = existing.income_currency ?? 'NGN'
      form.employment_status = existing.employment_status ?? ''
      form.ever_paid_foreign_currency = existing.ever_paid_foreign_currency == null ? '' : existing.ever_paid_foreign_currency ? 'yes' : 'no'
      form.rate_amount = existing.rate_amount?.toString() ?? ''
      form.rate_currency = existing.rate_currency ?? 'NGN'
      form.rate_unit = existing.rate_unit ?? ''
      form.client_geography = existing.client_geography ?? ''
      form.how_they_find_work = existing.how_they_find_work ?? ''
      form.has_ownership_stake = existing.has_ownership_stake == null ? '' : existing.has_ownership_stake ? 'yes' : 'no'
      form.ownership_detail = existing.ownership_detail ?? ''
      form.platform_rejected = existing.platform_rejected == null ? '' : existing.platform_rejected ? 'yes' : 'no'
      form.platform_rejected_detail = existing.platform_rejected_detail ?? ''
      form.client_withdrew_after_location = existing.client_withdrew_after_location == null ? '' : existing.client_withdrew_after_location ? 'yes' : 'no'
      form.obscures_location = existing.obscures_location == null ? '' : existing.obscures_location ? 'yes' : 'no'
      form.portfolio_url = existing.portfolio_url ?? ''
      form.hours_per_week = existing.hours_per_week?.toString() ?? ''
      form.goal_in_own_words = existing.goal_in_own_words ?? ''
      form.consent_anonymised = existing.consent_anonymised
      form.consent_named_story = existing.consent_named_story
    }
  } finally {
    loading.value = false
  }
})

async function save() {
  error.value = ''
  saving.value = true
  try {
    const res = await baselinesApi.submitMyBaseline({
      kind: 'intake',
      monthly_income: num(form.monthly_income),
      income_currency: str(form.income_currency),
      employment_status: (str(form.employment_status) as any) ?? undefined,
      ever_paid_foreign_currency: bool(form.ever_paid_foreign_currency),
      rate_amount: num(form.rate_amount),
      rate_currency: str(form.rate_currency),
      rate_unit: (str(form.rate_unit) as any) ?? undefined,
      client_geography: (str(form.client_geography) as any) ?? undefined,
      how_they_find_work: str(form.how_they_find_work),
      has_ownership_stake: bool(form.has_ownership_stake),
      ownership_detail: str(form.ownership_detail),
      platform_rejected: bool(form.platform_rejected),
      platform_rejected_detail: str(form.platform_rejected_detail),
      client_withdrew_after_location: bool(form.client_withdrew_after_location),
      obscures_location: bool(form.obscures_location),
      portfolio_url: str(form.portfolio_url),
      hours_per_week: num(form.hours_per_week),
      goal_in_own_words: str(form.goal_in_own_words),
      consent_anonymised: form.consent_anonymised,
      consent_named_story: form.consent_named_story
    })
    if (res.status) router.push('/dashboard')
    else error.value = res.message || 'Could not save'
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Could not save'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <AppLayout>
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <p class="text-sm font-bold text-senpai-500 uppercase tracking-widest mb-2">Before you start</p>
      <h1 class="text-3xl font-bold text-gray-900">Where you're starting from</h1>
      <p class="text-gray-600 mt-3">
        We record this once, now, so that a year from now we can show what actually changed —
        for you, and for the collective. It is only useful if it's honest, and it can only be
        taken before you start.
      </p>
      <p v-if="savedAt" class="text-sm text-senpai-600 mt-2">
        Saved {{ new Date(savedAt).toLocaleDateString() }} — you can update it until induction.
      </p>

      <div v-if="loading" class="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

      <form v-else class="mt-8 space-y-10" @submit.prevent="save">
        <BaseAlert v-if="error" type="error">{{ error }}</BaseAlert>

        <section class="space-y-4">
          <div>
            <h2 class="text-lg font-bold text-gray-900">What you earn now</h2>
            <p class="text-sm text-gray-500">Every field here is optional. Skip anything you'd rather not answer.</p>
          </div>
          <div class="grid grid-cols-3 gap-3">
            <div class="col-span-2"><BaseInput v-model="form.monthly_income" type="number" label="Monthly income from creative work" placeholder="0" /></div>
            <BaseInput v-model="form.income_currency" label="Currency" placeholder="NGN" />
          </div>
          <BaseSelect
            v-model="form.employment_status"
            :options="[
              { value: 'employed', label: 'Employed' },
              { value: 'freelance', label: 'Freelance' },
              { value: 'both', label: 'Both' },
              { value: 'student', label: 'Student' },
              { value: 'neither', label: 'Neither' }
            ]"
            label="Employment status"
            placeholder="Select"
          />
          <BaseSelect
            v-model="form.ever_paid_foreign_currency"
            :options="yesNo"
            label="Have you ever been paid in a foreign currency (USD, GBP, EUR)?"
            placeholder="Select"
          />
          <div class="grid grid-cols-3 gap-3">
            <BaseInput v-model="form.rate_amount" type="number" label="Your rate" placeholder="0" />
            <BaseInput v-model="form.rate_currency" label="Currency" placeholder="NGN" />
            <BaseSelect
              v-model="form.rate_unit"
              :options="[{ value: 'hour', label: 'Per hour' }, { value: 'day', label: 'Per day' }, { value: 'project', label: 'Per project' }]"
              label="Per"
              placeholder="Select"
            />
          </div>
          <BaseSelect
            v-model="form.client_geography"
            :options="[
              { value: 'local', label: 'Mostly local (Nigeria)' },
              { value: 'diaspora', label: 'Mostly diaspora' },
              { value: 'global', label: 'Mostly global' },
              { value: 'mixed', label: 'A mix' },
              { value: 'none', label: 'No clients yet' }
            ]"
            label="Where your clients are"
            placeholder="Select"
          />
          <BaseInput v-model="form.how_they_find_work" label="How you currently find work" placeholder="Referrals, WhatsApp, Upwork, employer…" />
          <BaseSelect v-model="form.has_ownership_stake" :options="yesNo" label="Do you own equity in anything you've built?" placeholder="Select" />
          <BaseInput v-if="form.has_ownership_stake === 'yes'" v-model="form.ownership_detail" label="What is it?" placeholder="A product, a company, a stake…" />
        </section>

        <section class="space-y-4 border-t border-gray-200 pt-8">
          <div>
            <h2 class="text-lg font-bold text-gray-900">Being locked out</h2>
            <p class="text-sm text-gray-500">
              Uncomfortable questions, and entirely optional. We ask because almost nobody has this
              data, and it's the clearest evidence of what Nigerian builders are actually up against.
            </p>
          </div>
          <BaseSelect v-model="form.platform_rejected" :options="yesNo" label="Have you ever been rejected, blocked or restricted by a global work or payment platform?" placeholder="Prefer not to say" />
          <BaseInput v-if="form.platform_rejected === 'yes'" v-model="form.platform_rejected_detail" label="Which one, and what reason were you given?" placeholder="Upwork, account restricted at signup" />
          <BaseSelect v-model="form.client_withdrew_after_location" :options="yesNo" label="Has a client ever hesitated or walked after learning you're in Nigeria?" placeholder="Prefer not to say" />
          <BaseSelect v-model="form.obscures_location" :options="yesNo" label="Do you currently hide or obscure your location to get work?" placeholder="Prefer not to say" />
        </section>

        <section class="space-y-4 border-t border-gray-200 pt-8">
          <h2 class="text-lg font-bold text-gray-900">Where you are today</h2>
          <BaseInput v-model="form.portfolio_url" label="Portfolio link" placeholder="https://" />
          <BaseInput v-model="form.hours_per_week" type="number" label="Hours a week you genuinely have" placeholder="10" />
          <BaseTextarea v-model="form.goal_in_own_words" label="What do you want out of this?" :rows="3" placeholder="In your own words." />
        </section>

        <section class="space-y-3 border-t border-gray-200 pt-8">
          <h2 class="text-lg font-bold text-gray-900">Permission</h2>
          <p class="text-sm text-gray-500">Two separate questions. Either can be no.</p>
          <BaseCheckbox v-model="form.consent_anonymised" label="Use my numbers anonymously" description="Aggregated with everyone else's. Nothing identifies you." />
          <BaseCheckbox v-model="form.consent_named_story" label="You may tell my story with my name on it" description="Only ever with a version you've seen first." />
        </section>

        <div class="flex items-center gap-4 border-t border-gray-200 pt-8">
          <BaseButton type="submit" :loading="saving">Save</BaseButton>
          <RouterLink to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700">Do this later</RouterLink>
        </div>
      </form>
    </div>
  </AppLayout>
</template>
