import type { Context } from '@deepseek-ai/cordis'
import z from '@deepseek-ai/schemastery'
import { companionProjectionDefinition } from './projection.ts'
import type { CompanionConfig } from './types.ts'

export type * from './types.ts'
export { companionProjectionDefinition } from './projection.ts'

export const name = 'companion'
export const inject = ['sessionProjections']

export const Config: z<CompanionConfig> = z.object({
  successHoldMs: z.number().min(0).max(60000).default(5000),
  errorHoldMs: z.number().min(0).max(120000).default(10000),
})

export function apply(
  ctx: Context,
  config: CompanionConfig = { successHoldMs: 5000, errorHoldMs: 10000 },
): void {
  if (!Number.isInteger(config.successHoldMs)) {
    throw new Error('CompanionConfig: successHoldMs must be an integer')
  }
  if (!Number.isInteger(config.errorHoldMs)) {
    throw new Error('CompanionConfig: errorHoldMs must be an integer')
  }
  ctx.sessionProjections.register(companionProjectionDefinition(config))
}
