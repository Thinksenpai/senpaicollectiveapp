<script setup lang="ts">
import { computed } from 'vue'

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

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const inputClasses = computed(() => {
  const base = 'block w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm'

  if (props.error) {
    return `${base} border-red-300 focus:border-red-500 focus:ring-red-500`
  }

  return `${base} border-gray-300 focus:border-senpai-500 focus:ring-senpai-500`
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
    <input
      :id="inputId"
      :type="type"
      :value="modelValue ?? ''"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      @input="handleInput"
    />
    <p v-if="hint && !error" class="mt-1 text-sm text-gray-500">{{ hint }}</p>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>
