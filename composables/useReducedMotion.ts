import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useReducedMotion() {
  const prefers = ref(false)
  let mql: MediaQueryList | null = null
  const handler = (e: MediaQueryListEvent) => { prefers.value = e.matches }

  onMounted(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefers.value = mql.matches
    mql.addEventListener('change', handler)
  })

  onBeforeUnmount(() => {
    mql?.removeEventListener('change', handler)
    mql = null
  })

  return prefers
}
