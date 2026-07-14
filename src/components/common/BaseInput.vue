<script setup lang="ts">
import { computed, ref } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

interface Props {
  modelValue: string | number | undefined
  label?: string
  type?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// Let extra attributes (autocomplete, name, inputmode, ...) land on the <input>,
// not the wrapper <div> — required for browser/password-manager autofill.
defineOptions({ inheritAttrs: false })

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const resolvedType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))

const inputClasses = computed(() => {
  const base = 'block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm'
  const withPadding = isPassword.value ? `${base} pr-10` : base

  if (props.error) {
    return `${withPadding} border-red-300 focus:border-red-500 focus:ring-red-500`
  }

  return `${withPadding} border-gray-300 focus:border-senpai-500 focus:ring-senpai-500`
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', props.type === 'number' ? Number(target.value) : target.value)
}
</script>

<template>
  <div>
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :id="inputId"
        :type="resolvedType"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        v-bind="$attrs"
        @input="handleInput"
      />
      <button
        v-if="isPassword"
        type="button"
        tabindex="-1"
        class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-gray-600"
        :aria-label="revealed ? 'Hide password' : 'Show password'"
        @click="revealed = !revealed"
      >
        <EyeSlashIcon v-if="revealed" class="h-4 w-4" />
        <EyeIcon v-else class="h-4 w-4" />
      </button>
    </div>
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
