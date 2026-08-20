import { Companion } from "./Companion.js";
import { NS, en, zh } from "./locales.js";
import { createCompanionStore } from "./store.js";
export const inject = ['slots', 'locale'];
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'companion: dictionaries');
    ctx.slots.inject('shell.overlay', () => ctx.slots.register({
        name: 'shell.overlay',
        id: 'companion',
        order: 40,
        locale: NS,
        store: createCompanionStore,
    }, Companion));
}
