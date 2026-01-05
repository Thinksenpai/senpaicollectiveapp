<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: boolean
  label?: string
  description?: string
  error?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const inputId = computed(() => props.id || `checkbox-${Math.random().toString(36).slice(2, 9)}`)

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div class="relative flex items-start">
    <div class="flex h-6 items-center">
      <input
        :id="inputId"
        type="checkbox"
        :checked="modelValue"
        :disabled="disabled"
        class="h-4 w-4 rounded border-gray-300 text-senpai-500 focus:ring-senpai-500 disabled:cursor-not-allowed disabled:opacity-50"
        @change="handleChange"
      />
    </div>
    <div v-if="label || description" class="ml-3 text-sm leading-6">
      <label :for="inputId" :class="['font-medium', disabled ? 'text-gray-400' : 'text-gray-900']">
        {{ label }}
      </label>
      <p v-if="description" class="text-gray-500">{{ description }}</p>
    </div>
  </div>
  <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
</template>
