import { z } from 'zod'
import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import type { CompanionConfig, CompanionProjection } from './types.ts'

interface ActiveTool {
  id: string
  name: string
}

interface CompanionState {
  status: CompanionProjection['status']
  turn?: number
  activeTools: ActiveTool[]
  startedAt?: number
  changedAt: number
  durationMs?: number
  errorCode?: string
}

function runningState(
  state: CompanionState,
  event: SessionEvent,
  status: 'thinking' | 'tool',
  activeTools: ActiveTool[] = state.activeTools,
): CompanionState {
  return {
    status,
    ...(state.turn === undefined ? {} : { turn: state.turn }),
    activeTools,
    ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
    changedAt: event.time,
  }
}

export function companionProjectionDefinition(
  config: CompanionConfig,
): ProjectionDefinition<'companion', CompanionState> {
  const schema = z.object({
    status: z.enum(['idle', 'thinking', 'tool', 'success', 'error']),
    turn: z.number().int().positive().optional(),
    activeTool: z.string().optional(),
    startedAt: z.number().nonnegative().optional(),
    changedAt: z.number().nonnegative(),
    durationMs: z.number().nonnegative().optional(),
    errorCode: z.string().optional(),
    successHoldMs: z.number().int().nonnegative(),
    errorHoldMs: z.number().int().nonnegative(),
  }).strict() as z.ZodType<CompanionProjection>

  return {
    key: 'companion',
    schema,
    init: () => ({ status: 'idle', activeTools: [], changedAt: 0 }),
    apply: (state, event) => {
      if (event.type === 'turn/start') {
        return {
          status: 'thinking',
          turn: event.data.turn,
          activeTools: [],
          startedAt: event.time,
          changedAt: event.time,
        }
      }

      if (event.type === 'tool/call') {
        const id = String(event.data.callId)
        const activeTools = [
          ...state.activeTools.filter(tool => tool.id !== id),
          { id, name: event.data.name },
        ]
        return runningState(state, event, 'tool', activeTools)
      }

      if (event.type === 'tool/result') {
        const id = String(event.data.message.source.callId)
        const activeTools = state.activeTools.filter(tool => tool.id !== id)
        return runningState(state, event, activeTools.length > 0 ? 'tool' : 'thinking', activeTools)
      }

      if (event.type === 'step/start' || event.type === 'assistant/chunk' || event.type === 'assistant/message') {
        if (state.status === 'idle' || state.status === 'success' || state.status === 'error') return state
        return runningState(state, event, state.activeTools.length > 0 ? 'tool' : 'thinking')
      }

      if (event.type !== 'turn/end') return state

      const durationMs = state.startedAt === undefined
        ? undefined
        : Math.max(0, event.time - state.startedAt)
      if (event.data.reason.kind === 'completed') {
        return {
          status: 'success',
          turn: event.data.turn,
          activeTools: [],
          ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
          changedAt: event.time,
          ...(durationMs === undefined ? {} : { durationMs }),
        }
      }
      if (event.data.reason.kind === 'aborted') {
        return { status: 'idle', activeTools: [], changedAt: event.time }
      }
      if (event.data.reason.kind === 'blocked') {
        return {
          status: 'thinking',
          turn: event.data.turn,
          activeTools: [],
          ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
          changedAt: event.time,
          ...(durationMs === undefined ? {} : { durationMs }),
        }
      }
      return {
        status: 'error',
        turn: event.data.turn,
        activeTools: [],
        ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
        changedAt: event.time,
        ...(durationMs === undefined ? {} : { durationMs }),
        ...(event.data.reason.kind === 'error' ? { errorCode: event.data.reason.error.code } : {}),
      }
    },
    view: state => ({
      status: state.status,
      ...(state.turn === undefined ? {} : { turn: state.turn }),
      ...(state.activeTools.length === 0
        ? {}
        : { activeTool: state.activeTools[state.activeTools.length - 1]!.name }),
      ...(state.startedAt === undefined ? {} : { startedAt: state.startedAt }),
      changedAt: state.changedAt,
      ...(state.durationMs === undefined ? {} : { durationMs: state.durationMs }),
      ...(state.errorCode === undefined ? {} : { errorCode: state.errorCode }),
      successHoldMs: config.successHoldMs,
      errorHoldMs: config.errorHoldMs,
    }),
    stateVersion: 1,
  }
}
