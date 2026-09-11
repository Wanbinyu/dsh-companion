import { defineStore, type EngineStoreHandle } from '@deepseek-ai/dsh-client-store'
import { DEFAULT_ACCENT_COLOR, normalizeAccentColor } from './derive.ts'
import {
  DIALOGUE_GROUPS,
  normalizeDialogueLines,
  type DialoguePreferences,
} from './dialogue.ts'

export interface CompanionPreferences {
  position: { x: number; y: number } | null
  size: number
  accentColor?: string
  showBubble: boolean
  showMetrics: boolean
  dialogueLines?: DialoguePreferences
}

type CompanionActions = {
  setPosition: (draft: CompanionPreferences, x: number, y: number) => void
  resetPosition: (draft: CompanionPreferences) => void
  setSize: (draft: CompanionPreferences, size: number) => void
  setAccentColor: (draft: CompanionPreferences, value: string) => void
  setShowBubble: (draft: CompanionPreferences, value: boolean) => void
  setShowMetrics: (draft: CompanionPreferences, value: boolean) => void
  setDialogueLines: (draft: CompanionPreferences, value: DialoguePreferences | null) => void
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
      accentColor: DEFAULT_ACCENT_COLOR,
      showBubble: true,
      showMetrics: true,
    }),
    persist: 'dsh.companion.preferences.v1',
    actions: {
      setPosition: (draft: CompanionPreferences, x: number, y: number) => {
        draft.position = { x: Math.round(x), y: Math.round(y) }
      },
      resetPosition: (draft: CompanionPreferences) => { draft.position = null },
      setSize: (draft: CompanionPreferences, size: number) => { draft.size = clampSize(size) },
      setAccentColor: (draft: CompanionPreferences, value: string) => { draft.accentColor = normalizeAccentColor(value) },
      setShowBubble: (draft: CompanionPreferences, value: boolean) => { draft.showBubble = value },
      setShowMetrics: (draft: CompanionPreferences, value: boolean) => { draft.showMetrics = value },
      setDialogueLines: (draft: CompanionPreferences, value: DialoguePreferences | null) => {
        if (value === null) {
          delete draft.dialogueLines
          return
        }
        const next: DialoguePreferences = {}
        for (const group of DIALOGUE_GROUPS) {
          const lines = normalizeDialogueLines(value[group])
          if (lines !== null) next[group] = lines
        }
        if (Object.keys(next).length === 0) delete draft.dialogueLines
        else draft.dialogueLines = next
      },
    },
  })
}
