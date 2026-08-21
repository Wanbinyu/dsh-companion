import { describe, expect, it } from 'vitest'
import {
  clampPosition,
  DEFAULT_ACCENT_COLOR,
  elapsedMs,
  isLongTask,
  LONG_TASK_THRESHOLD_MS,
  normalizeAccentColor,
  readBillingMetrics,
  resolveActivity,
} from '../src/client/derive.ts'
import type { CompanionProjection } from '../src/types.ts'
import {
  dialogueGroupForActivity,
  MAX_DIALOGUE_LINE_LENGTH,
  MAX_DIALOGUE_LINES,
  normalizeDialogueLines,
  parseDialogueText,
  pickDialogueLine,
  sameDialogueLines,
} from '../src/client/dialogue.ts'

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
    })).toEqual({
      currency: 'USD',
      totalCost: 0.0123,
      totalTokens: 185,
      unpricedModelCount: 0,
    })
    expect(readBillingMetrics({ totalCost: 1, models: [] })).toBeUndefined()
  })

  it('adapts optional billing turn, quota, and pricing warnings without a hard dependency', () => {
    expect(readBillingMetrics({
      currency: 'USD',
      totalCost: 0.75,
      models: [{ uncachedInputTokens: 300, outputTokens: 50 }],
      unpricedModels: ['custom-model'],
      latestTurn: {
        cost: 0.25,
        uncachedInputTokens: 100,
        outputTokens: 20,
        cacheReadTokens: 40,
      },
      quota: { percent: 1.2, estimated: true },
    })).toEqual({
      currency: 'USD',
      totalCost: 0.75,
      totalTokens: 350,
      unpricedModelCount: 1,
      latestTurn: { cost: 0.25, totalTokens: 160 },
      quota: { percent: 1, estimated: true },
    })
  })

  it('uses a live clock while running and the recorded duration after completion', () => {
    expect(elapsedMs({ ...projection('thinking'), startedAt: 1000 }, true, 3500)).toBe(2500)
    expect(elapsedMs({ ...projection('success'), durationMs: 2400 }, false, 9000)).toBe(2400)
  })

  it('starts long-task behavior only at the running threshold', () => {
    expect(isLongTask(true, LONG_TASK_THRESHOLD_MS - 1)).toBe(false)
    expect(isLongTask(true, LONG_TASK_THRESHOLD_MS)).toBe(true)
    expect(isLongTask(false, LONG_TASK_THRESHOLD_MS)).toBe(false)
    expect(isLongTask(true, undefined)).toBe(false)
  })

  it('keeps pointer and keyboard positions inside the overlay', () => {
    expect(clampPosition(-10, 250, 320, 200, 100)).toEqual({ x: 0, y: 100 })
    expect(clampPosition(80, 50, 60, 60, 100)).toEqual({ x: 0, y: 0 })
  })

  it('normalizes persisted accent colors and rejects malformed values', () => {
    expect(normalizeAccentColor('#A1b2C3')).toBe('#a1b2c3')
    expect(normalizeAccentColor('blue')).toBe(DEFAULT_ACCENT_COLOR)
    expect(normalizeAccentColor(undefined)).toBe(DEFAULT_ACCENT_COLOR)
  })
})

describe('companion dialogue derivation', () => {
  it('normalizes user lines within count and length limits', () => {
    const values = Array.from({ length: MAX_DIALOGUE_LINES + 2 }, (_, index) => `  line ${index}  `)
    values[0] = 'x'.repeat(MAX_DIALOGUE_LINE_LENGTH + 5)
    const normalized = normalizeDialogueLines(values)
    expect(normalized).toHaveLength(MAX_DIALOGUE_LINES)
    expect(normalized?.[0]).toHaveLength(MAX_DIALOGUE_LINE_LENGTH)
    expect(parseDialogueText(' first\n\n second ')).toEqual(['first', 'second'])
    expect(normalizeDialogueLines([' ', 2])).toBeNull()
  })

  it('picks a stable line for the same event seed', () => {
    const lines = ['one', 'two', 'three']
    expect(pickDialogueLine(lines, 'success:42')).toBe(pickDialogueLine(lines, 'success:42'))
    expect(pickDialogueLine([], 'empty')).toBeUndefined()
    expect(sameDialogueLines(['one', 'two'], ['one', 'two'])).toBe(true)
    expect(sameDialogueLines(['two', 'one'], ['one', 'two'])).toBe(false)
  })

  it('maps only conversational activity states to line groups', () => {
    expect(dialogueGroupForActivity('idle')).toBe('idle')
    expect(dialogueGroupForActivity('thinking')).toBe('working')
    expect(dialogueGroupForActivity('tool')).toBe('working')
    expect(dialogueGroupForActivity('success')).toBe('success')
    expect(dialogueGroupForActivity('waiting')).toBeUndefined()
    expect(dialogueGroupForActivity('error')).toBeUndefined()
  })
})
