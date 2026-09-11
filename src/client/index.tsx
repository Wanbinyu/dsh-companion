import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { StoreFactory } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '../client.ts'
import { Companion } from './Companion.tsx'
import { NS, en, zh, type CompanionKey } from './locales.ts'
import { createCompanionStore } from './store.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    companion: CompanionKey
  }
}

export const inject = ['slots', 'locale']

export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'companion: dictionaries')
  ctx.slots.inject('shell.overlay', () => ctx.slots.register({
    name: 'shell.overlay',
    id: 'companion',
    order: 40,
    locale: NS,
    // Legacy Slots' generic action table uses unknown[]; the concrete engine
    // has the same spec/create/subscribe contract on both host generations.
    store: createCompanionStore as typeof createCompanionStore & StoreFactory,
  }, Companion))
}
