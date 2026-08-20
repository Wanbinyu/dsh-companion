import { type EngineStoreHandle } from '@deepseek-ai/dsh-client-runtime/client';
export interface CompanionPreferences {
    position: {
        x: number;
        y: number;
    } | null;
    size: number;
    showBubble: boolean;
    showMetrics: boolean;
    motion: boolean;
}
type CompanionActions = {
    setPosition: (draft: CompanionPreferences, x: number, y: number) => void;
    resetPosition: (draft: CompanionPreferences) => void;
    setSize: (draft: CompanionPreferences, size: number) => void;
    setShowBubble: (draft: CompanionPreferences, value: boolean) => void;
    setShowMetrics: (draft: CompanionPreferences, value: boolean) => void;
    setMotion: (draft: CompanionPreferences, value: boolean) => void;
};
export declare const MIN_SIZE = 80;
export declare const MAX_SIZE = 140;
export declare function clampSize(value: number): number;
export declare function createCompanionStore(): EngineStoreHandle<CompanionPreferences, CompanionActions>;
export {};
