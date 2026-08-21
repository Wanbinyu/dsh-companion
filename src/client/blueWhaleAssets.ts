import type { CompanionActivity } from '../types.ts'
import idle from '../../assets/suave-whale-boy/suave-whale-boy-idle.webp'

export const BLUE_WHALE_BOY_ASSETS: Record<CompanionActivity, string> = {
  idle,
  thinking: idle,
  tool: idle,
  waiting: idle,
  success: idle,
  error: idle,
}
