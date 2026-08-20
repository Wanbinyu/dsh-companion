import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type CompanionKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        companion: CompanionKey;
    }
}
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
