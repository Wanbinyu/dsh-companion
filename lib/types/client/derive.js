export function resolveActivity(summary, now) {
    if (summary === undefined)
        return 'idle';
    if (summary.pendingInteraction !== undefined)
        return 'waiting';
    if (summary.running)
        return summary.projection?.status === 'tool' ? 'tool' : 'thinking';
    const projection = summary.projection;
    if (projection?.status === 'success') {
        return now - projection.changedAt < projection.successHoldMs ? 'success' : 'idle';
    }
    if (projection?.status === 'error') {
        return now - projection.changedAt < projection.errorHoldMs ? 'error' : 'idle';
    }
    return 'idle';
}
export function readBillingMetrics(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const billing = value;
    if (typeof billing.currency !== 'string' || billing.currency.length !== 3)
        return undefined;
    if (typeof billing.totalCost !== 'number' || !Number.isFinite(billing.totalCost))
        return undefined;
    if (!Array.isArray(billing.models))
        return undefined;
    let totalTokens = 0;
    for (const row of billing.models) {
        if (typeof row !== 'object' || row === null)
            continue;
        const model = row;
        for (const key of ['uncachedInputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens']) {
            const count = model[key];
            if (typeof count === 'number' && Number.isFinite(count) && count > 0)
                totalTokens += count;
        }
    }
    return { currency: billing.currency, totalCost: billing.totalCost, totalTokens };
}
export function elapsedMs(projection, running, now) {
    if (projection === undefined)
        return undefined;
    if (running && projection.startedAt !== undefined)
        return Math.max(0, now - projection.startedAt);
    return projection.durationMs;
}
