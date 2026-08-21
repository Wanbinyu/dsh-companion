export const DEFAULT_ACCENT_COLOR = '#4bc5e7';
export const LONG_TASK_THRESHOLD_MS = 10 * 60 * 1000;
export function normalizeAccentColor(value) {
    return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)
        ? value.toLowerCase()
        : DEFAULT_ACCENT_COLOR;
}
export function clampPosition(x, y, containerWidth, containerHeight, size) {
    const maxX = Math.max(0, containerWidth - size);
    const maxY = Math.max(0, containerHeight - size);
    return {
        x: Math.min(maxX, Math.max(0, x)),
        y: Math.min(maxY, Math.max(0, y)),
    };
}
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
    if (typeof billing.totalCost !== 'number' || !Number.isFinite(billing.totalCost) || billing.totalCost < 0) {
        return undefined;
    }
    if (!Array.isArray(billing.models))
        return undefined;
    const tokenTotal = (row) => {
        let total = 0;
        for (const key of ['uncachedInputTokens', 'outputTokens', 'cacheReadTokens', 'cacheWriteTokens']) {
            const count = row[key];
            if (typeof count === 'number' && Number.isFinite(count) && count > 0)
                total += count;
        }
        return total;
    };
    let totalTokens = 0;
    for (const row of billing.models) {
        if (typeof row !== 'object' || row === null)
            continue;
        totalTokens += tokenTotal(row);
    }
    const latestRecord = typeof billing.latestTurn === 'object' && billing.latestTurn !== null
        ? billing.latestTurn
        : undefined;
    const latestTurn = latestRecord !== undefined
        && typeof latestRecord.cost === 'number'
        && Number.isFinite(latestRecord.cost)
        && latestRecord.cost >= 0
        ? { cost: latestRecord.cost, totalTokens: tokenTotal(latestRecord) }
        : undefined;
    const quotaRecord = typeof billing.quota === 'object' && billing.quota !== null
        ? billing.quota
        : undefined;
    const quota = quotaRecord !== undefined
        && typeof quotaRecord.percent === 'number'
        && Number.isFinite(quotaRecord.percent)
        ? {
            percent: Math.min(1, Math.max(0, quotaRecord.percent)),
            estimated: quotaRecord.estimated === true,
        }
        : undefined;
    const unpricedModelCount = Array.isArray(billing.unpricedModels)
        ? billing.unpricedModels.filter(model => typeof model === 'string').length
        : 0;
    return {
        currency: billing.currency,
        totalCost: billing.totalCost,
        totalTokens,
        unpricedModelCount,
        ...(latestTurn === undefined ? {} : { latestTurn }),
        ...(quota === undefined ? {} : { quota }),
    };
}
export function elapsedMs(projection, running, now) {
    if (projection === undefined)
        return undefined;
    if (running && projection.startedAt !== undefined)
        return Math.max(0, now - projection.startedAt);
    return projection.durationMs;
}
export function isLongTask(running, durationMs, thresholdMs = LONG_TASK_THRESHOLD_MS) {
    return running
        && durationMs !== undefined
        && Number.isFinite(durationMs)
        && durationMs >= thresholdMs;
}
