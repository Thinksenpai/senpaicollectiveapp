import type { Directive } from 'vue'

// Single shared observer: cheap even with dozens of revealed elements per page.
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      }
    }
  },
  { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
)

/**
 * v-reveal[.now]="delayMs" — fades/slides an element in once it enters the
 * viewport (or immediately, with `.now`, for above-the-fold content on mount).
 * Actual motion lives in CSS ([data-reveal]) so prefers-reduced-motion is
 * handled in one place.
 */
export const vReveal: Directive<HTMLElement, number | void> = {
  mounted(el, binding) {
    el.setAttribute('data-reveal', '')
    if (typeof binding.value === 'number') {
      el.style.setProperty('--reveal-delay', `${binding.value}ms`)
    }
    if (binding.modifiers.now) {
      // Above-the-fold content: reveal on next frame rather than waiting on the observer.
      requestAnimationFrame(() => el.classList.add('is-visible'))
    } else {
      observer.observe(el)
    }
  },
  unmounted(el) {
    observer.unobserve(el)
  }
}
