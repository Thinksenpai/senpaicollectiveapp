<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  rows?: number
  maxlength?: number
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
  rows: 4
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`)

const inputClasses = computed(() => {
  const base = 'block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm resize-none'

  if (props.error) {
    return `${base} border-red-300 focus:border-red-500 focus:ring-red-500`
  }

  return `${base} border-gray-300 focus:border-senpai-500 focus:ring-senpai-500`
})

const charCount = computed(() => props.modelValue?.length || 0)

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-1">
      <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </label>
      <span v-if="maxlength" class="text-xs text-gray-400">
        {{ charCount }}/{{ maxlength }}
      </span>
    </div>
    <textarea
      :id="inputId"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :rows="rows"
      :maxlength="maxlength"
      :class="inputClasses"
      @input="handleInput"
    />
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
