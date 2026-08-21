import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
import { DEFAULT_ACCENT_COLOR, normalizeAccentColor } from "./derive.js";
import { DIALOGUE_GROUPS, normalizeDialogueLines, } from "./dialogue.js";
export const MIN_SIZE = 80;
export const MAX_SIZE = 140;
export function clampSize(value) {
    return Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)));
}
export function createCompanionStore() {
    return defineStore({
        init: () => ({
            position: null,
            size: 104,
            accentColor: DEFAULT_ACCENT_COLOR,
            showBubble: true,
            showMetrics: true,
        }),
        persist: 'dsh.companion.preferences.v1',
        actions: {
            setPosition: (draft, x, y) => {
                draft.position = { x: Math.round(x), y: Math.round(y) };
            },
            resetPosition: (draft) => { draft.position = null; },
            setSize: (draft, size) => { draft.size = clampSize(size); },
            setAccentColor: (draft, value) => { draft.accentColor = normalizeAccentColor(value); },
            setShowBubble: (draft, value) => { draft.showBubble = value; },
            setShowMetrics: (draft, value) => { draft.showMetrics = value; },
            setDialogueLines: (draft, value) => {
                if (value === null) {
                    delete draft.dialogueLines;
                    return;
                }
                const next = {};
                for (const group of DIALOGUE_GROUPS) {
                    const lines = normalizeDialogueLines(value[group]);
                    if (lines !== null)
                        next[group] = lines;
                }
                if (Object.keys(next).length === 0)
                    delete draft.dialogueLines;
                else
                    draft.dialogueLines = next;
            },
        },
    });
}
