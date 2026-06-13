export function useHdrDisplay() {
  const hdrSupported = ref(false)
  const wideGamut = ref(false)

  function checkHdr() {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return

    wideGamut.value = window.matchMedia('(color-gamut: p3)').matches
    hdrSupported.value = window.matchMedia('(dynamic-range: high)').matches

    const mq = window.matchMedia('(dynamic-range: high)')
    const handler = (e: MediaQueryListEvent) => {
      hdrSupported.value = e.matches
    }
    mq.addEventListener('change', handler)

    const mq2 = window.matchMedia('(color-gamut: p3)')
    const handler2 = (e: MediaQueryListEvent) => {
      wideGamut.value = e.matches
    }
    mq2.addEventListener('change', handler2)
  }

  return { hdrSupported, wideGamut, checkHdr }
}
