<script setup lang="ts">
import { computed } from 'vue'
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
  ListboxLabel
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

interface Option {
  value: string | number
  label: string
  disabled?: boolean
}

interface Props {
  modelValue: string | number | null
  options: Option[]
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Select an option',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const selectedOption = computed(() => {
  return props.options.find(opt => opt.value === props.modelValue)
})

function handleChange(value: string | number | null) {
  emit('update:modelValue', value)
}
</script>

<template>
  <Listbox :model-value="modelValue" @update:model-value="handleChange" :disabled="disabled">
    <div class="relative">
      <ListboxLabel v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
        {{ label }}
        <span v-if="required" class="text-red-500">*</span>
      </ListboxLabel>
      <ListboxButton
        :class="[
          'relative w-full cursor-pointer rounded-lg border bg-white py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-offset-0 sm:text-sm',
          error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-senpai-500 focus:ring-senpai-500',
          disabled ? 'cursor-not-allowed bg-gray-50' : ''
        ]"
      >
        <span :class="['block truncate', !selectedOption ? 'text-gray-400' : 'text-gray-900']">
          {{ selectedOption?.label || placeholder }}
        </span>
        <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ListboxOption
            v-for="option in options"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
            v-slot="{ active, selected }"
            as="template"
          >
            <li
              :class="[
                'relative cursor-pointer select-none py-2 pl-10 pr-4',
                active ? 'bg-senpai-100 text-senpai-900' : 'text-gray-900',
                option.disabled ? 'cursor-not-allowed opacity-50' : ''
              ]"
            >
              <span :class="['block truncate', selected ? 'font-medium' : 'font-normal']">
                {{ option.label }}
              </span>
              <span v-if="selected" class="absolute inset-y-0 left-0 flex items-center pl-3 text-senpai-600">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </Listbox>
</template>
