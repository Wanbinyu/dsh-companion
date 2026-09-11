import type { Context as ClientContext } from '@deepseek-ai/cordis';
import { type CompanionKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        companion: CompanionKey;
    }
}
export declare const inject: string[];
export declare function apply(ctx: ClientContext): void;
