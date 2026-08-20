import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { IconCloseOutline16, IconRefreshOutline16, IconSettingsOutline16, Tooltip, } from '@deepseek-ai/dsh-client-ui-primitives';
import { elapsedMs, readBillingMetrics, resolveActivity } from "./derive.js";
import { MAX_SIZE, MIN_SIZE } from "./store.js";
import css from './Companion.module.css';
function projectionRecord(value) {
    return typeof value === 'object' && value !== null ? value : undefined;
}
function overlayContainer(root) {
    return root.closest('[data-shell-overlay]');
}
function formatDuration(ms) {
    const totalSeconds = Math.max(0, Math.round(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}
function waitingKey(value) {
    if (value === 'approval' || value === 'question' || value === 'plan-review') {
        return `waiting.${value}`;
    }
    return 'waiting.default';
}
function statusKey(activity) {
    return `status.${activity}`;
}
export function Companion({ useSessions, useStore, actions, t }) {
    const summary = useSessions((sessions) => {
        const id = sessions.current;
        return id === undefined ? undefined : sessions.byId[id];
    });
    const preferences = useStore(state => state);
    const projections = projectionRecord(summary?.projectionValues);
    const projection = projections?.companion;
    const billing = readBillingMetrics(projections?.billing);
    const [now, setNow] = useState(() => Date.now());
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [bubbleOverride, setBubbleOverride] = useState(null);
    const [draftPosition, setDraftPosition] = useState(null);
    const rootRef = useRef(null);
    const dragRef = useRef(null);
    const activity = resolveActivity({
        running: summary?.running ?? false,
        ...(summary?.pendingInteraction === undefined ? {} : { pendingInteraction: summary.pendingInteraction }),
        ...(projection === undefined ? {} : { projection }),
    }, now);
    const duration = elapsedMs(projection, summary?.running ?? false, now);
    const showBubble = bubbleOverride ?? preferences.showBubble;
    const position = draftPosition ?? preferences.position;
    useEffect(() => {
        if (summary?.running === true) {
            const interval = window.setInterval(() => { setNow(Date.now()); }, 500);
            return () => { window.clearInterval(interval); };
        }
        if (projection?.status !== 'success' && projection?.status !== 'error')
            return;
        const holdMs = projection.status === 'success' ? projection.successHoldMs : projection.errorHoldMs;
        const remaining = holdMs - (Date.now() - projection.changedAt);
        if (remaining <= 0)
            return;
        const timeout = window.setTimeout(() => { setNow(Date.now()); }, remaining + 10);
        return () => { window.clearTimeout(timeout); };
    }, [
        summary?.running,
        projection?.status,
        projection?.changedAt,
        projection?.successHoldMs,
        projection?.errorHoldMs,
    ]);
    useEffect(() => {
        if (preferences.position === null)
            return;
        const clamp = () => {
            const root = rootRef.current;
            if (root === null)
                return;
            const parent = overlayContainer(root);
            if (parent === null)
                return;
            const maxX = Math.max(0, parent.clientWidth - preferences.size);
            const maxY = Math.max(0, parent.clientHeight - preferences.size);
            const x = Math.min(maxX, Math.max(0, preferences.position?.x ?? 0));
            const y = Math.min(maxY, Math.max(0, preferences.position?.y ?? 0));
            if (x !== preferences.position?.x || y !== preferences.position?.y)
                actions.setPosition(x, y);
        };
        window.addEventListener('resize', clamp);
        clamp();
        return () => { window.removeEventListener('resize', clamp); };
    }, [actions, preferences.position?.x, preferences.position?.y, preferences.size]);
    const details = [];
    if (activity === 'tool' && projection?.activeTool !== undefined) {
        details.push(t('tool', { tool: projection.activeTool }));
    }
    else if (activity === 'waiting') {
        details.push(t(waitingKey(summary?.pendingInteraction)));
    }
    else if (activity === 'error' && projection?.errorCode !== undefined) {
        details.push(t('errorCode', { code: projection.errorCode }));
    }
    else if (projection?.turn !== undefined && (activity === 'thinking' || activity === 'success')) {
        details.push(t('turn', { turn: projection.turn }));
    }
    if (preferences.showMetrics && duration !== undefined && activity !== 'idle') {
        details.push(t('duration', { duration: formatDuration(duration) }));
    }
    const onPointerDown = (event) => {
        if (event.button !== 0)
            return;
        const root = rootRef.current;
        const parent = root === null ? null : overlayContainer(root);
        if (root === null || root === undefined || parent === null || parent === undefined)
            return;
        const rootRect = root.getBoundingClientRect();
        const parentRect = parent.getBoundingClientRect();
        dragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            originX: rootRect.left - parentRect.left,
            originY: rootRect.top - parentRect.top,
            moved: false,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event) => {
        const drag = dragRef.current;
        const root = rootRef.current;
        const parent = root === null ? null : overlayContainer(root);
        if (drag === null || drag.pointerId !== event.pointerId || parent === null || parent === undefined)
            return;
        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;
        if (Math.abs(dx) + Math.abs(dy) > 4)
            drag.moved = true;
        const maxX = Math.max(0, parent.clientWidth - preferences.size);
        const maxY = Math.max(0, parent.clientHeight - preferences.size);
        setDraftPosition({
            x: Math.min(maxX, Math.max(0, drag.originX + dx)),
            y: Math.min(maxY, Math.max(0, drag.originY + dy)),
        });
    };
    const onPointerUp = (event) => {
        const drag = dragRef.current;
        if (drag === null || drag.pointerId !== event.pointerId)
            return;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        if (draftPosition !== null)
            actions.setPosition(draftPosition.x, draftPosition.y);
        if (!drag.moved)
            setBubbleOverride(current => !(current ?? preferences.showBubble));
        dragRef.current = null;
        setDraftPosition(null);
    };
    const rootStyle = position === null
        ? { '--pet-size': `${preferences.size}px` }
        : {
            '--pet-size': `${preferences.size}px`,
            left: position.x,
            top: position.y,
            right: 'auto',
            bottom: 'auto',
        };
    const settingsAlign = (position?.x ?? Number.POSITIVE_INFINITY) < 250 ? 'left' : 'right';
    return (_jsxs("aside", { ref: rootRef, className: css.root, style: rootStyle, "data-activity": activity, "data-motion": preferences.motion || undefined, "data-align": settingsAlign, "aria-live": "polite", children: [showBubble ? (_jsxs("div", { className: css.bubble, role: "status", children: [_jsx("strong", { children: t(statusKey(activity)) }), details.map(line => _jsx("span", { children: line }, line)), preferences.showMetrics && billing !== undefined ? (_jsxs("span", { className: css.metrics, children: [billing.totalTokens > 0 ? t('tokens', { count: billing.totalTokens.toLocaleString() }) : null, billing.totalTokens > 0 && billing.totalCost > 0 ? _jsx("i", { "aria-hidden": "true" }) : null, billing.totalCost > 0
                                ? t('cost', {
                                    cost: new Intl.NumberFormat(undefined, {
                                        style: 'currency',
                                        currency: billing.currency,
                                        maximumFractionDigits: 6,
                                    }).format(billing.totalCost),
                                })
                                : null] })) : null] })) : null, _jsx(Tooltip, { label: settingsOpen ? t('closeSettings') : t('settings'), side: "top", children: _jsx("button", { type: "button", className: css.settingsButton, "aria-label": settingsOpen ? t('closeSettings') : t('settings'), "aria-expanded": settingsOpen, onClick: () => { setSettingsOpen(open => !open); }, children: settingsOpen ? _jsx(IconCloseOutline16, { size: 15 }) : _jsx(IconSettingsOutline16, { size: 15 }) }) }), _jsxs("button", { type: "button", className: css.petButton, "aria-label": t('drag'), onPointerDown: onPointerDown, onPointerMove: onPointerMove, onPointerUp: onPointerUp, onPointerCancel: onPointerUp, children: [_jsx("span", { className: css.shadow }), _jsxs("span", { className: css.robot, "aria-hidden": "true", children: [_jsx("span", { className: css.antenna, children: _jsx("span", {}) }), _jsx("span", { className: css.earLeft }), _jsx("span", { className: css.earRight }), _jsx("span", { className: css.head, children: _jsxs("span", { className: css.face, children: [_jsx("span", { className: css.eyeLeft }), _jsx("span", { className: css.eyeRight }), _jsx("span", { className: css.mouth })] }) }), _jsx("span", { className: css.body, children: _jsx("span", { className: css.badge }) }), _jsx("span", { className: css.armLeft }), _jsx("span", { className: css.armRight }), _jsx("span", { className: css.footLeft }), _jsx("span", { className: css.footRight })] })] }), settingsOpen ? (_jsxs("section", { className: css.settings, "data-align": settingsAlign, "aria-label": t('settings'), children: [_jsx("header", { children: _jsx("strong", { children: t('settings') }) }), _jsxs("label", { className: css.rangeRow, children: [_jsx("span", { children: t('size') }), _jsx("input", { type: "range", min: MIN_SIZE, max: MAX_SIZE, step: 4, value: preferences.size, onChange: event => { actions.setSize(Number(event.currentTarget.value)); } }), _jsxs("output", { children: [preferences.size, "px"] })] }), _jsxs("label", { className: css.toggleRow, children: [_jsx("input", { type: "checkbox", checked: preferences.showBubble, onChange: event => {
                                    setBubbleOverride(null);
                                    actions.setShowBubble(event.currentTarget.checked);
                                } }), _jsx("span", { children: t('showBubble') })] }), _jsxs("label", { className: css.toggleRow, children: [_jsx("input", { type: "checkbox", checked: preferences.showMetrics, onChange: event => { actions.setShowMetrics(event.currentTarget.checked); } }), _jsx("span", { children: t('showMetrics') })] }), _jsxs("label", { className: css.toggleRow, children: [_jsx("input", { type: "checkbox", checked: preferences.motion, onChange: event => { actions.setMotion(event.currentTarget.checked); } }), _jsx("span", { children: t('motion') })] }), _jsxs("button", { type: "button", className: css.resetButton, onClick: () => { actions.resetPosition(); }, children: [_jsx(IconRefreshOutline16, { size: 15 }), t('resetPosition')] })] })) : null] }));
}
