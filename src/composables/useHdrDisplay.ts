export function useHdrDisplay() {
  const hdrSupported = ref(false)
  const wideGamut = ref(false)

  let mq: MediaQueryList | null = null
  let mq2: MediaQueryList | null = null
  let handler: ((e: MediaQueryListEvent) => void) | null = null
  let handler2: ((e: MediaQueryListEvent) => void) | null = null

  function checkHdr() {
    cleanup()
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    wideGamut.value = window.matchMedia('(color-gamut: p3)').matches
    hdrSupported.value = window.matchMedia('(dynamic-range: high)').matches

    mq = window.matchMedia('(dynamic-range: high)')
    handler = (e: MediaQueryListEvent) => {
      hdrSupported.value = e.matches
    }
    mq.addEventListener('change', handler)

    mq2 = window.matchMedia('(color-gamut: p3)')
    handler2 = (e: MediaQueryListEvent) => {
      wideGamut.value = e.matches
    }
    mq2.addEventListener('change', handler2)
  }

  function cleanup() {
    if (mq && handler) mq.removeEventListener('change', handler)
    if (mq2 && handler2) mq2.removeEventListener('change', handler2)
    mq = null
    mq2 = null
    handler = null
    handler2 = null
  }

  if (typeof onBeforeUnmount !== 'undefined') {
    onBeforeUnmount(cleanup)
  }

  return { hdrSupported, wideGamut, checkHdr, cleanup }
}
