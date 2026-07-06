<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  title?: string
  subtitle?: string
  dismissable?: boolean
}
const props = withDefaults(defineProps<Props>(), { dismissable: true })
const emit = defineEmits<{ close: [] }>()
function requestClose() {
  if (props.dismissable) emit('close')
}
</script>

<template>
  <TransitionRoot :show="show" as="template">
    <Dialog class="relative z-50" @close="requestClose">
      <TransitionChild
        as="template"
        enter="duration-200 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-150 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-900/40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-200 ease-out"
            enter-from="opacity-0 translate-y-2 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="duration-150 ease-in"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-2 sm:scale-95"
          >
            <DialogPanel class="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl">
              <div class="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
                <div>
                  <DialogTitle v-if="title" class="text-lg font-semibold text-gray-900">{{ title }}</DialogTitle>
                  <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
                </div>
                <button
                  v-if="dismissable"
                  type="button"
                  class="text-gray-400 hover:text-gray-600 -mr-1"
                  aria-label="Close"
                  @click="emit('close')"
                >
                  <XMarkIcon class="h-5 w-5" />
                </button>
              </div>
              <div class="px-6 pb-5 overflow-y-auto flex-1 min-h-0">
                <slot />
              </div>
              <div v-if="$slots.footer" class="flex justify-end gap-3 border-t border-gray-100 px-6 py-4 shrink-0">
                <slot name="footer" />
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
