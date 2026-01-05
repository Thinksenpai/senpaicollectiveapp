<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/vue/20/solid'

interface Props {
  type?: 'success' | 'warning' | 'error' | 'info'
  title?: string
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: false
})

const emit = defineEmits<{
  dismiss: []
}>()

const styles = computed(() => {
  const configs = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-400',
      icon: CheckCircleIcon,
      iconColor: 'text-green-400',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
      buttonColor: 'text-green-500 hover:bg-green-100 focus:ring-green-600'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-400',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-400',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
      buttonColor: 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-400',
      icon: XCircleIcon,
      iconColor: 'text-red-400',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
      buttonColor: 'text-red-500 hover:bg-red-100 focus:ring-red-600'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-400',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-400',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
      buttonColor: 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
    }
  }
  return configs[props.type]
})
</script>

<template>
  <div :class="['rounded-md border-l-4 p-4', styles.bg, styles.border]">
    <div class="flex">
      <div class="flex-shrink-0">
        <component :is="styles.icon" :class="['h-5 w-5', styles.iconColor]" />
      </div>
      <div class="ml-3 flex-1">
        <h3 v-if="title" :class="['text-sm font-medium', styles.titleColor]">
          {{ title }}
        </h3>
        <div :class="['text-sm', styles.textColor, title ? 'mt-2' : '']">
          <slot />
        </div>
      </div>
      <div v-if="dismissible" class="ml-auto pl-3">
        <button
          type="button"
          :class="['inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2', styles.buttonColor]"
          @click="emit('dismiss')"
        >
          <span class="sr-only">Dismiss</span>
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>
  </div>
</template>
