import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
import { type DialoguePreferences } from './dialogue.ts';
export interface CompanionPreferences {
    position: {
        x: number;
        y: number;
    } | null;
    size: number;
    accentColor?: string;
    showBubble: boolean;
    showMetrics: boolean;
    dialogueLines?: DialoguePreferences;
}
type CompanionActions = {
    setPosition: (draft: CompanionPreferences, x: number, y: number) => void;
    resetPosition: (draft: CompanionPreferences) => void;
    setSize: (draft: CompanionPreferences, size: number) => void;
    setAccentColor: (draft: CompanionPreferences, value: string) => void;
    setShowBubble: (draft: CompanionPreferences, value: boolean) => void;
    setShowMetrics: (draft: CompanionPreferences, value: boolean) => void;
    setDialogueLines: (draft: CompanionPreferences, value: DialoguePreferences | null) => void;
};
export declare const MIN_SIZE = 80;
export declare const MAX_SIZE = 140;
export declare function clampSize(value: number): number;
export declare function createCompanionStore(): EngineStoreHandle<CompanionPreferences, CompanionActions>;
export {};
