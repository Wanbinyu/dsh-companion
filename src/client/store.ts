import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client'

export interface CompanionPreferences {
  position: { x: number; y: number } | null
  size: number
  showBubble: boolean
  showMetrics: boolean
  motion: boolean
}

type CompanionActions = {
  setPosition: (draft: CompanionPreferences, x: number, y: number) => void
  resetPosition: (draft: CompanionPreferences) => void
  setSize: (draft: CompanionPreferences, size: number) => void
  setShowBubble: (draft: CompanionPreferences, value: boolean) => void
  setShowMetrics: (draft: CompanionPreferences, value: boolean) => void
  setMotion: (draft: CompanionPreferences, value: boolean) => void
}

export const MIN_SIZE = 80
export const MAX_SIZE = 140

export function clampSize(value: number): number {
  return Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)))
}

export function createCompanionStore(): EngineStoreHandle<CompanionPreferences, CompanionActions> {
  return defineStore({
    init: (): CompanionPreferences => ({
      position: null,
      size: 104,
      showBubble: true,
      showMetrics: true,
      motion: true,
    }),
    persist: 'dsh.companion.preferences.v1',
    actions: {
      setPosition: (draft, x: number, y: number) => {
        draft.position = { x: Math.round(x), y: Math.round(y) }
      },
      resetPosition: (draft) => { draft.position = null },
      setSize: (draft, size: number) => { draft.size = clampSize(size) },
      setShowBubble: (draft, value: boolean) => { draft.showBubble = value },
      setShowMetrics: (draft, value: boolean) => { draft.showMetrics = value },
      setMotion: (draft, value: boolean) => { draft.motion = value },
    },
  })
}
