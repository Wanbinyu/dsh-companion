import type { CompanionActivity, CompanionProjection } from '../types.ts';
export interface SessionSummaryLike {
    running: boolean;
    pendingInteraction?: string;
    projection?: CompanionProjection;
}
export interface BillingMetrics {
    currency: string;
    totalCost: number;
    totalTokens: number;
    unpricedModelCount: number;
    latestTurn?: {
        cost: number;
        totalTokens: number;
    };
    quota?: {
        percent: number;
        estimated: boolean;
    };
}
export interface CompanionPosition {
    x: number;
    y: number;
}
export declare const DEFAULT_ACCENT_COLOR = "#4bc5e7";
export declare const LONG_TASK_THRESHOLD_MS: number;
export declare function normalizeAccentColor(value: unknown): string;
export declare function clampPosition(x: number, y: number, containerWidth: number, containerHeight: number, size: number): CompanionPosition;
export declare function resolveActivity(summary: SessionSummaryLike | undefined, now: number): CompanionActivity;
export declare function readBillingMetrics(value: unknown): BillingMetrics | undefined;
export declare function elapsedMs(projection: CompanionProjection | undefined, running: boolean, now: number): number | undefined;
export declare function isLongTask(running: boolean, durationMs: number | undefined, thresholdMs?: number): boolean;
