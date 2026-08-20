import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots';
import { createCompanionStore } from './store.ts';
export type CompanionProps = PropsRuntime<'shell.overlay'> & PropsStore<ReturnType<typeof createCompanionStore>> & PropsLocale<'companion'>;
export declare function Companion({ useSessions, useStore, actions, t }: CompanionProps): import("react").JSX.Element;
