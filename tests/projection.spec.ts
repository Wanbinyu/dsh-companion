import { describe, expect, expectTypeOf, it } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { CallId, createToolResultMessage } from '@deepseek-ai/dsh-llm'
import SessionStore, { SessionId } from '@deepseek-ai/dsh-session'
import type { Session } from '@deepseek-ai/dsh-session'
import SessionProjectionRegistry from '@deepseek-ai/dsh-session-projection'
import type { CompanionProjection } from '../src/types.ts'
import { companionProjectionDefinition } from '../src/projection.ts'

async function harness(): Promise<{ ctx: Context; session: Session }> {
  const ctx = new Context()
  await ctx.plugin(SessionStore)
  await ctx.plugin(SessionProjectionRegistry)
  ctx.sessionProjections.register(companionProjectionDefinition({ successHoldMs: 5000, errorHoldMs: 10000 }))
  return { ctx, session: ctx.sessions.create(SessionId('companion-test')) }
}

function projected(ctx: Context, session: Session): CompanionProjection {
  const value = ctx.sessionProjections.snapshot(session).values.companion
  if (value === undefined) throw new Error('companion projection is not registered')
  return value
}

describe('companion projection', () => {
  it('starts idle with configured terminal hold times', async () => {
    const { ctx, session } = await harness()
    expect(projected(ctx, session)).toEqual({
      status: 'idle',
      changedAt: 0,
      successHoldMs: 5000,
      errorHoldMs: 10000,
    })
  })

  it('tracks a tool call and returns to thinking after its result', async () => {
    const { ctx, session } = await harness()
    session.append('turn/start', { turn: 1 })
    session.append('step/start', { turn: 1, step: 1 })
    session.append('tool/call', {
      turn: 1,
      step: 1,
      callId: CallId('call-1'),
      name: 'terminal',
      arguments: '{}',
    })
    expect(projected(ctx, session)).toMatchObject({ status: 'tool', activeTool: 'terminal', turn: 1 })

    session.append('tool/result', {
      turn: 1,
      step: 1,
      message: createToolResultMessage({
        callId: CallId('call-1'),
        content: [{ type: 'text', text: 'ok' }],
        isError: false,
      }),
    }, { surfaceOp: 'append' })
    expect(projected(ctx, session)).toMatchObject({ status: 'thinking', turn: 1 })
    expect(projected(ctx, session).activeTool).toBeUndefined()
  })

  it('keeps tool state while another parallel call remains active', async () => {
    const { ctx, session } = await harness()
    session.append('turn/start', { turn: 1 })
    session.append('step/start', { turn: 1, step: 1 })
    session.append('tool/call', { turn: 1, step: 1, callId: CallId('a'), name: 'read', arguments: '{}' })
    session.append('tool/call', { turn: 1, step: 1, callId: CallId('b'), name: 'search', arguments: '{}' })
    session.append('tool/result', {
      turn: 1,
      step: 1,
      message: createToolResultMessage({ callId: CallId('b'), content: [], isError: false }),
    }, { surfaceOp: 'append' })
    expect(projected(ctx, session)).toMatchObject({ status: 'tool', activeTool: 'read' })
  })

  it('records successful and failed terminal states without error text', async () => {
    const { ctx, session } = await harness()
    session.append('turn/start', { turn: 1 })
    session.append('turn/end', { turn: 1, reason: { kind: 'completed' } })
    expect(projected(ctx, session)).toMatchObject({ status: 'success', turn: 1 })

    session.append('turn/start', { turn: 2 })
    session.append('turn/end', {
      turn: 2,
      reason: { kind: 'error', error: { code: 'RATE_LIMIT', message: 'provider details stay out of this projection' } },
    })
    expect(projected(ctx, session)).toMatchObject({ status: 'error', turn: 2, errorCode: 'RATE_LIMIT' })
    expect(projected(ctx, session)).not.toHaveProperty('message')
  })

  it('types the projection key through SessionProjectionMap', async () => {
    const { ctx, session } = await harness()
    expectTypeOf(ctx.sessionProjections.snapshot(session).values.companion)
      .toEqualTypeOf<CompanionProjection | undefined>()
  })
})
