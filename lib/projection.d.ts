import { z } from 'zod';
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
declare module '@deepseek-ai/dsh-session-projection/types' {
    interface SessionProjectionStateMap {
        companion: CompanionState;
    }
}
type CompanionProjectionDefinition = Omit<ProjectionDefinition<'companion', CompanionState>, 'wire'> & {
    wire: NonNullable<ProjectionDefinition<'companion', CompanionState>['wire']>;
    /** Compatibility fields used by the 0.1.0-rc.6 through rc.8 registry. */
    schema: z.ZodType<CompanionProjection>;
    view(state: CompanionState): CompanionProjection;
};
export declare function companionProjectionDefinition(config: CompanionConfig): CompanionProjectionDefinition;
export {};
