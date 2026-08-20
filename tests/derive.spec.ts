import { describe, expect, it } from 'vitest'
import { elapsedMs, readBillingMetrics, resolveActivity } from '../src/client/derive.ts'
import type { CompanionProjection } from '../src/types.ts'

function projection(status: CompanionProjection['status'], changedAt = 1000): CompanionProjection {
  return {
    status,
    changedAt,
    successHoldMs: 5000,
    errorHoldMs: 10000,
  }
}

describe('companion client derivation', () => {
  it('prioritizes a pending interaction over running state', () => {
    expect(resolveActivity({ running: true, pendingInteraction: 'approval', projection: projection('tool') }, 2000))
      .toBe('waiting')
  })

  it('uses tool state only while the session is running', () => {
    expect(resolveActivity({ running: true, projection: projection('tool') }, 2000)).toBe('tool')
    expect(resolveActivity({ running: false, projection: projection('tool') }, 2000)).toBe('idle')
  })

  it('expires terminal states using host-configured hold times', () => {
    expect(resolveActivity({ running: false, projection: projection('success') }, 5999)).toBe('success')
    expect(resolveActivity({ running: false, projection: projection('success') }, 6000)).toBe('idle')
    expect(resolveActivity({ running: false, projection: projection('error') }, 10999)).toBe('error')
    expect(resolveActivity({ running: false, projection: projection('error') }, 11000)).toBe('idle')
  })

  it('sums optional billing tokens defensively', () => {
    expect(readBillingMetrics({
      currency: 'USD',
      totalCost: 0.0123,
      models: [
        { uncachedInputTokens: 100, outputTokens: 20, cacheReadTokens: 50, cacheWriteTokens: 0 },
        { uncachedInputTokens: 10, outputTokens: 5 },
      ],
    })).toEqual({ currency: 'USD', totalCost: 0.0123, totalTokens: 185 })
    expect(readBillingMetrics({ totalCost: 1, models: [] })).toBeUndefined()
  })

  it('uses a live clock while running and the recorded duration after completion', () => {
    expect(elapsedMs({ ...projection('thinking'), startedAt: 1000 }, true, 3500)).toBe(2500)
    expect(elapsedMs({ ...projection('success'), durationMs: 2400 }, false, 9000)).toBe(2400)
  })
})
