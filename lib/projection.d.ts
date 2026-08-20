import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import type { CompanionConfig, CompanionProjection } from './types.ts';
interface ActiveTool {
    id: string;
    name: string;
}
interface CompanionState {
    status: CompanionProjection['status'];
    turn?: number;
    activeTools: ActiveTool[];
    startedAt?: number;
    changedAt: number;
    durationMs?: number;
    errorCode?: string;
}
export declare function companionProjectionDefinition(config: CompanionConfig): ProjectionDefinition<'companion', CompanionState>;
export {};
