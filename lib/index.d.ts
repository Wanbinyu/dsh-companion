import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { CompanionConfig } from './types.ts';
export type * from './types.ts';
export { companionProjectionDefinition } from './projection.ts';
export declare const name = "companion";
export declare const inject: string[];
export declare const Config: z<CompanionConfig>;
export declare function apply(ctx: Context, config?: CompanionConfig): void;
