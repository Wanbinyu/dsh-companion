import * as React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, create, type ReactTestRenderer } from 'react-test-renderer'
import { Companion, type CompanionProps } from '../src/client/Companion.tsx'
import type { CompanionProjection } from '../src/types.ts'

vi.mock('@deepseek-ai/dsh-client-runtime/client', () => ({ defineStore: vi.fn() }))
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  IconCheckOutline16: () => null,
  IconCloseOutline16: () => null,
  IconRefreshOutline16: () => null,
  IconSettingsOutline16: () => null,
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}))
vi.mock('../src/client/Companion.module.css', () => ({
  default: { container: 'container', root: 'root' },
  stylesheet: '.container { pointer-events: none; }',
}))

describe('companion lifecycle', () => {
  let renderer: ReactTestRenderer | undefined
  let projection: CompanionProjection | undefined
  let running: boolean
  let position: { x: number; y: number } | null
  let resize: () => void
  const disconnect = vi.fn()
  const setPosition = vi.fn()
  const container = {
    clientWidth: 800, clientHeight: 600,
    getBoundingClientRect: () => ({ left: 20, top: 30 }),
  }

  const props = {
    useSessions: () => ({ running, projectionValues: { companion: projection } }),
    useStore: () => ({ position, size: 104, showBubble: true, showMetrics: true }),
    actions: { setPosition },
    t: (key: string, values?: Record<string, unknown>) => values ? `${key}:${JSON.stringify(values)}` : key,
  } as unknown as CompanionProps

  const render = () => act(() => {
    const element = <Companion {...props} />
    if (renderer) renderer.update(element)
    else renderer = create(element, {
      createNodeMock: element => element.props.className === 'container'
        ? container : { getBoundingClientRect: () => ({ left: 70, top: 100 }) },
    })
  })
  const activity = () => renderer!.root.findByType('aside').props['data-activity']

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(1_000)
    running = false
    projection = undefined
    position = null
    container.clientWidth = 800
    container.clientHeight = 600
    vi.stubGlobal('window', {
      setTimeout, clearTimeout, setInterval, clearInterval,
      addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })
    vi.stubGlobal('ResizeObserver', class {
      constructor(callback: () => void) { resize = callback }
      observe = vi.fn()
      disconnect = disconnect
    })
  })

  afterEach(() => {
    act(() => renderer?.unmount())
    renderer = undefined
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it.each(['success', 'error'] as const)('does not revive expired %s after an idle session switch', status => {
    render()
    vi.setSystemTime(60_000)
    projection = { status, changedAt: 10_000, successHoldMs: 5_000, errorHoldMs: 10_000 }
    render()
    expect(activity()).toBe('idle')
  })

  it('expires a recent completion at the configured deadline', () => {
    projection = { status: 'success', changedAt: 1_000, successHoldMs: 5_000, errorHoldMs: 10_000 }
    render()
    expect(activity()).toBe('success')
    act(() => { vi.advanceTimersByTime(5_010) })
    expect(activity()).toBe('idle')
  })

  it('uses the new session clock immediately when a run starts', () => {
    render()
    vi.setSystemTime(60_000)
    running = true
    projection = { status: 'thinking', changedAt: 50_000, startedAt: 50_000, successHoldMs: 5_000, errorHoldMs: 10_000 }
    render()
    expect(activity()).toBe('thinking')
    expect(JSON.stringify(renderer!.toJSON())).toContain('10s')
    act(() => { vi.advanceTimersByTime(1_000) })
    expect(activity()).toBe('thinking')
    expect(JSON.stringify(renderer!.toJSON())).toContain('11s')
  })

  it('owns its stylesheet and clamps to its own container on layout resize', () => {
    position = { x: 650, y: 450 }
    render()
    expect(renderer!.root.findByType('style').parent!.props.className).toBe('container')
    expect(setPosition).not.toHaveBeenCalled()
    container.clientWidth = 320
    container.clientHeight = 400
    act(() => resize())
    expect(setPosition).toHaveBeenLastCalledWith(216, 296)
    act(() => renderer!.unmount())
    renderer = undefined
    expect(disconnect).toHaveBeenCalledOnce()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('uses component coordinates for keyboard movement and pointer dragging', () => {
    render()
    const pet = renderer!.root.findAllByType('button').find(button => button.props.onPointerDown)!
    act(() => pet.props.onKeyDown({ key: 'ArrowRight', shiftKey: false, preventDefault: vi.fn() }))
    expect(setPosition).toHaveBeenLastCalledWith(58, 70)
    const currentTarget = { setPointerCapture: vi.fn(), hasPointerCapture: () => true, releasePointerCapture: vi.fn() }
    act(() => pet.props.onPointerDown({ button: 0, pointerId: 1, clientX: 70, clientY: 100, currentTarget }))
    act(() => pet.props.onPointerMove({ pointerId: 1, clientX: 1_070, clientY: 1_100 }))
    act(() => pet.props.onPointerUp({ pointerId: 1, currentTarget }))
    expect(setPosition).toHaveBeenLastCalledWith(696, 496)
    expect(currentTarget.releasePointerCapture).toHaveBeenCalledWith(1)
  })
})
