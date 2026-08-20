import { defineStore } from '@deepseek-ai/dsh-client-runtime/client';
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
            showBubble: true,
            showMetrics: true,
            motion: true,
        }),
        persist: 'dsh.companion.preferences.v1',
        actions: {
            setPosition: (draft, x, y) => {
                draft.position = { x: Math.round(x), y: Math.round(y) };
            },
            resetPosition: (draft) => { draft.position = null; },
            setSize: (draft, size) => { draft.size = clampSize(size); },
            setShowBubble: (draft, value) => { draft.showBubble = value; },
            setShowMetrics: (draft, value) => { draft.showMetrics = value; },
            setMotion: (draft, value) => { draft.motion = value; },
        },
    });
}
