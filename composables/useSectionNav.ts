import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue'

function isScrollable(el: Element): boolean {
  const oy = getComputedStyle(el).overflowY
  return (oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight
}

// Walk up from `start` to (but not past) `boundary`. Return the first element
// with a scrollable overflow-y that can still scroll one more pixel in `dir`.
// When found, the wheel event is allowed to scroll that element natively
// instead of triggering section navigation — otherwise the GitHub repo list
// and experience list cannot be wheel-scrolled.
function findScrollableAncestor(
  start: EventTarget | null,
  dir: 1 | -1,
  boundary: HTMLElement | null,
): Element | null {
  let node: Element | null = start instanceof Element ? start : null
  while (node && node !== boundary) {
    if (isScrollable(node)) {
      const atTop = node.scrollTop <= 0
      const atBottom =
        node.scrollTop + node.clientHeight >= node.scrollHeight - 1
      if ((dir > 0 && !atBottom) || (dir < 0 && !atTop)) return node
    }
    node = node.parentElement
  }
  return null
}

export function useSectionNav(total: number, root: Ref<HTMLElement | null>) {
  const currentIndex = ref(0)

  function setIndex(i: number) {
    const clamped = Math.max(0, Math.min(total - 1, i))
    if (clamped !== currentIndex.value) currentIndex.value = clamped
  }

  let wheelLock = false
  function onWheel(e: WheelEvent) {
    if (Math.abs(e.deltaY) < 8) return
    const dir: 1 | -1 = e.deltaY > 0 ? 1 : -1
    if (findScrollableAncestor(e.target, dir, root.value)) return
    e.preventDefault()
    if (wheelLock) return
    wheelLock = true
    setIndex(currentIndex.value + dir)
    window.setTimeout(() => { wheelLock = false }, 700)
  }

  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'ArrowRight') {
      e.preventDefault()
      setIndex(currentIndex.value + 1)
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'ArrowLeft') {
      e.preventDefault()
      setIndex(currentIndex.value - 1)
    } else if (e.key === 'Home') {
      setIndex(0)
    } else if (e.key === 'End') {
      setIndex(total - 1)
    }
  }

  // Touch nav uses *horizontal* swipe so vertical native scrolling within a
  // section is unaffected. Only triggers when the horizontal delta dominates
  // (the swipe is clearly sideways, not a vertical drag with some wobble).
  let touchStartX = 0
  let touchStartY = 0
  function onTouchStart(e: TouchEvent) {
    touchStartX = e.touches[0]?.clientX ?? 0
    touchStartY = e.touches[0]?.clientY ?? 0
  }
  function onTouchEnd(e: TouchEvent) {
    const endX = e.changedTouches[0]?.clientX ?? touchStartX
    const endY = e.changedTouches[0]?.clientY ?? touchStartY
    const dx = touchStartX - endX
    const dy = touchStartY - endY
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      setIndex(currentIndex.value + (dx > 0 ? 1 : -1))
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', onKey)
    window.addEventListener('wheel', onWheel, { passive: false })
  })
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKey)
    window.removeEventListener('wheel', onWheel)
  })

  return { currentIndex, setIndex, onTouchStart, onTouchEnd }
}
