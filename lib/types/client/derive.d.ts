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
}
export declare function resolveActivity(summary: SessionSummaryLike | undefined, now: number): CompanionActivity;
export declare function readBillingMetrics(value: unknown): BillingMetrics | undefined;
export declare function elapsedMs(projection: CompanionProjection | undefined, running: boolean, now: number): number | undefined;
