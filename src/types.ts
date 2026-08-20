export {}

export type CompanionActivity = 'idle' | 'thinking' | 'tool' | 'waiting' | 'success' | 'error'

export interface CompanionConfig {
  /** How long a completed state remains visible before returning to idle. */
  successHoldMs: number
  /** How long a failed state remains visible before returning to idle. */
  errorHoldMs: number
}

export interface CompanionProjection {
  status: Exclude<CompanionActivity, 'waiting'>
  turn?: number
  activeTool?: string
  startedAt?: number
  changedAt: number
  durationMs?: number
  errorCode?: string
  successHoldMs: number
  errorHoldMs: number
}

declare module '@deepseek-ai/dsh-session-projection/types' {
  interface SessionProjectionMap {
    companion: CompanionProjection
  }
}
