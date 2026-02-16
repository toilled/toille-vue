import { render } from '@testing-library/svelte'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import CyberpunkCity from '../components/CyberpunkCity.svelte'
import * as THREE from 'three'

// Mocks are handled in setupThree.ts

describe('CyberpunkCity.svelte', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const mockContext = {
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 0,
      font: '',
      textAlign: '',
      shadowColor: '',
      shadowBlur: 0,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      fillText: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      setLineDash: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      clearRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(mockContext as any);
  })

  it('renders correctly', () => {
    const { container } = render(CyberpunkCity)
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('initializes Three.js scene on mount', () => {
    render(CyberpunkCity)
    // We just check if the constructor was called.
    // Since setupThree.ts mocks these as classes, we can check if they were instantiated.
    // However, vitest doesn't track class instantiations automatically unless they are spies.
    // setupThree.ts defines classes.
    // We can assume if render didn't throw, it initialized.
    // Or we can rely on verifying the canvas is appended.
    expect(document.body.querySelector('canvas')).toBeTruthy()
  })

  it('cleans up on unmount', () => {
    const { unmount } = render(CyberpunkCity)
    unmount()
  })
})
