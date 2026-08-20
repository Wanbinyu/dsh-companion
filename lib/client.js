window.__ModuleLoader__.load({ id: "dsh-companion", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
let react_jsx_runtime = require("react/jsx-runtime");
let react = require("react");
let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
let _deepseek_ai_dsh_client_runtime_client = require("@deepseek-ai/dsh-client-runtime/client");

//#region lib/types/client/derive.js
function resolveActivity(summary, now) {
	if (summary === void 0) return "idle";
	if (summary.pendingInteraction !== void 0) return "waiting";
	if (summary.running) return summary.projection?.status === "tool" ? "tool" : "thinking";
	const projection = summary.projection;
	if (projection?.status === "success") return now - projection.changedAt < projection.successHoldMs ? "success" : "idle";
	if (projection?.status === "error") return now - projection.changedAt < projection.errorHoldMs ? "error" : "idle";
	return "idle";
}
function readBillingMetrics(value) {
	if (typeof value !== "object" || value === null) return void 0;
	const billing = value;
	if (typeof billing.currency !== "string" || billing.currency.length !== 3) return void 0;
	if (typeof billing.totalCost !== "number" || !Number.isFinite(billing.totalCost)) return void 0;
	if (!Array.isArray(billing.models)) return void 0;
	let totalTokens = 0;
	for (const row of billing.models) {
		if (typeof row !== "object" || row === null) continue;
		const model = row;
		for (const key of [
			"uncachedInputTokens",
			"outputTokens",
			"cacheReadTokens",
			"cacheWriteTokens"
		]) {
			const count = model[key];
			if (typeof count === "number" && Number.isFinite(count) && count > 0) totalTokens += count;
		}
	}
	return {
		currency: billing.currency,
		totalCost: billing.totalCost,
		totalTokens
	};
}
function elapsedMs(projection, running, now) {
	if (projection === void 0) return void 0;
	if (running && projection.startedAt !== void 0) return Math.max(0, now - projection.startedAt);
	return projection.durationMs;
}

//#endregion
//#region lib/types/client/store.js
const MIN_SIZE = 80;
const MAX_SIZE = 140;
function clampSize(value) {
	return Math.round(Math.min(MAX_SIZE, Math.max(MIN_SIZE, value)));
}
function createCompanionStore() {
	return (0, _deepseek_ai_dsh_client_runtime_client.defineStore)({
		init: () => ({
			position: null,
			size: 104,
			showBubble: true,
			showMetrics: true,
			motion: true
		}),
		persist: "dsh.companion.preferences.v1",
		actions: {
			setPosition: (draft, x, y) => {
				draft.position = {
					x: Math.round(x),
					y: Math.round(y)
				};
			},
			resetPosition: (draft) => {
				draft.position = null;
			},
			setSize: (draft, size) => {
				draft.size = clampSize(size);
			},
			setShowBubble: (draft, value) => {
				draft.showBubble = value;
			},
			setShowMetrics: (draft, value) => {
				draft.showMetrics = value;
			},
			setMotion: (draft, value) => {
				draft.motion = value;
			}
		}
	});
}

//#endregion
//#region \0dsh-css:G:\deepseek harness\src\client\Companion.module.css.mjs
const css = ".paM35W_root{--pet-size:104px;--pet-accent:#18a999;--pet-accent-dark:#0d766d;--pet-signal:#f2c94c;--pet-eye:#17242b;z-index:3;width:var(--pet-size);height:var(--pet-size);box-sizing:border-box;pointer-events:auto;user-select:none;touch-action:none;position:absolute;bottom:18px;right:22px}.paM35W_root[data-activity=waiting]{--pet-accent:#e0a32a;--pet-accent-dark:#9b6514;--pet-signal:#fff0a8}.paM35W_root[data-activity=success]{--pet-accent:#2fa66f;--pet-accent-dark:#1d754f;--pet-signal:#d9f99d}.paM35W_root[data-activity=error]{--pet-accent:#db5a55;--pet-accent-dark:#923d39;--pet-signal:#ffb2aa}.paM35W_petButton{width:100%;height:100%;color:inherit;cursor:grab;touch-action:none;background:0 0;border:0;padding:0;display:block;position:absolute;inset:0}.paM35W_petButton:active{cursor:grabbing}.paM35W_petButton:focus-visible{outline:2px solid var(--dsw-alias-border-focus,#2684ff);outline-offset:3px;border-radius:6px}.paM35W_shadow{filter:blur(4px);transform-origin:50%;background:#15222b3d;border-radius:50%;height:10%;position:absolute;bottom:3%;left:20%;right:20%}.paM35W_robot,.paM35W_robot>span,.paM35W_face>span,.paM35W_antenna>span,.paM35W_body>span{box-sizing:border-box;display:block;position:absolute}.paM35W_robot{transform-origin:50% 92%;inset:3% 8% 6%}.paM35W_antenna{transform-origin:50% 100%;background:#56656d;border-radius:6px;width:6%;height:17%;top:0;left:47%}.paM35W_antenna>span{aspect-ratio:1;background:var(--pet-signal);width:180%;box-shadow:0 0 10px color-mix(in srgb, var(--pet-signal) 78%, transparent);border:2px solid #ffffffd9;border-radius:50%;top:-12%;left:50%;transform:translate(-50%)}.paM35W_head{transform-origin:50% 85%;background:#e9f0f1;border:2px solid #495b63;border-radius:23% 23% 29% 29%;width:74%;height:48%;top:13%;left:13%;overflow:hidden;box-shadow:inset 0 -6px #4b5b631a,0 4px 8px #14232b2e}.paM35W_face{border:2px solid var(--pet-accent-dark);background:color-mix(in srgb, var(--pet-accent) 23%, #eef8f7);border-radius:23% 23% 34% 34%;inset:16% 11% 19%;overflow:hidden}.paM35W_eyeLeft,.paM35W_eyeRight{background:var(--pet-eye);transform-origin:50%;border-radius:6px;width:13%;height:24%;top:31%;box-shadow:inset 0 3px #ffffff40}.paM35W_eyeLeft{left:24%}.paM35W_eyeRight{right:24%}.paM35W_mouth{background:var(--pet-accent-dark);border-radius:8px;width:24%;height:7%;bottom:16%;left:38%}.paM35W_earLeft,.paM35W_earRight{background:var(--pet-accent);border:2px solid #495b63;width:12%;height:23%;top:26%}.paM35W_earLeft{border-radius:8px 2px 2px 8px;left:4%}.paM35W_earRight{border-radius:2px 8px 8px 2px;right:4%}.paM35W_body{background:#d7e0e2;border:2px solid #495b63;border-radius:18% 18% 28% 28%;width:44%;height:28%;top:57%;left:28%;box-shadow:inset 0 -5px #43535b21}.paM35W_badge{aspect-ratio:1;background:var(--pet-accent);width:25%;box-shadow:0 0 7px color-mix(in srgb, var(--pet-accent) 60%, transparent);border:2px solid #ffffffbf;border-radius:50%;top:27%;left:50%;transform:translate(-50%)}.paM35W_armLeft,.paM35W_armRight{background:var(--pet-accent);transform-origin:50% 15%;border:2px solid #495b63;border-radius:8px;width:12%;height:25%;top:61%}.paM35W_armLeft{left:17%;transform:rotate(12deg)}.paM35W_armRight{right:17%;transform:rotate(-12deg)}.paM35W_footLeft,.paM35W_footRight{background:#c7d2d5;border:2px solid #495b63;border-radius:7px 7px 10px 10px;width:25%;height:12%;bottom:3%}.paM35W_footLeft{left:22%}.paM35W_footRight{right:22%}.paM35W_bubble{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#5a677047);background:var(--dsw-alias-bg-layer-1,#fffffff5);min-width:150px;max-width:min(230px,100vw - 24px);color:var(--dsw-alias-text-primary,#1c2a30);white-space:normal;border-radius:8px;gap:3px;padding:9px 11px;font-size:12px;line-height:1.35;display:grid;position:absolute;bottom:70%;right:68%;box-shadow:0 8px 24px #14222b29}.paM35W_root[data-align=left] .paM35W_bubble{left:68%;right:auto}.paM35W_bubble:after{border-top:1px solid var(--dsw-alias-border-l2,#5a677047);border-right:1px solid var(--dsw-alias-border-l2,#5a677047);background:inherit;content:\"\";width:10px;height:10px;position:absolute;bottom:12px;right:-6px;transform:rotate(45deg)}.paM35W_root[data-align=left] .paM35W_bubble:after{border:0;border-bottom:1px solid var(--dsw-alias-border-l2,#5a677047);border-left:1px solid var(--dsw-alias-border-l2,#5a677047);left:-6px;right:auto}.paM35W_bubble strong{color:var(--pet-accent-dark);font-size:13px}.paM35W_bubble span{overflow-wrap:anywhere;color:var(--dsw-alias-text-secondary,#506067)}.paM35W_metrics{font-variant-numeric:tabular-nums;flex-wrap:wrap;align-items:center;gap:5px;padding-top:2px;display:flex}.paM35W_metrics i{opacity:.55;background:currentColor;border-radius:50%;width:3px;height:3px}.paM35W_settingsButton{z-index:4;border:1px solid var(--dsw-alias-border-l2,#5a677047);background:var(--dsw-alias-bg-layer-1,#fff);width:28px;height:28px;color:var(--dsw-alias-text-secondary,#53636a);cursor:pointer;opacity:.78;border-radius:50%;place-items:center;padding:0;display:grid;position:absolute;top:4%;right:0;box-shadow:0 3px 10px #14222b24}.paM35W_settingsButton:hover,.paM35W_settingsButton:focus-visible{opacity:1}.paM35W_settings{z-index:5;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#5a677047);background:var(--dsw-alias-bg-layer-1,#fff);width:min(244px,100vw - 24px);color:var(--dsw-alias-text-primary,#1c2a30);touch-action:auto;border-radius:8px;gap:12px;padding:14px;font-size:13px;line-height:1.35;display:grid;position:absolute;bottom:calc(100% + 12px);right:0;box-shadow:0 12px 30px #14222b33}.paM35W_settings[data-align=left]{left:0;right:auto}.paM35W_settings header{align-items:center;min-height:22px;display:flex}.paM35W_rangeRow{grid-template-columns:44px minmax(0,1fr) 42px;align-items:center;gap:8px;display:grid}.paM35W_rangeRow input{width:100%;accent-color:var(--pet-accent)}.paM35W_rangeRow output{color:var(--dsw-alias-text-secondary,#53636a);font-variant-numeric:tabular-nums;text-align:right}.paM35W_toggleRow{align-items:center;gap:9px;min-height:22px;display:flex}.paM35W_toggleRow input{width:16px;height:16px;accent-color:var(--pet-accent);margin:0}.paM35W_resetButton{border:1px solid var(--dsw-alias-border-l2,#5a677047);background:var(--dsw-alias-button-secondary-fill,transparent);min-height:32px;color:inherit;cursor:pointer;border-radius:6px;justify-content:center;align-items:center;gap:7px;padding:5px 10px;display:inline-flex}.paM35W_resetButton:hover{background:var(--dsw-alias-button-secondary-hover,#12a99917)}.paM35W_root[data-motion][data-activity=idle] .paM35W_robot{animation:3.2s ease-in-out infinite paM35W_breathe}.paM35W_root[data-motion][data-activity=thinking] .paM35W_head{animation:1.45s ease-in-out infinite alternate paM35W_ponder}.paM35W_root[data-motion][data-activity=thinking] .paM35W_eyeLeft,.paM35W_root[data-motion][data-activity=thinking] .paM35W_eyeRight{animation:1.45s ease-in-out infinite alternate paM35W_scan}.paM35W_root[data-motion][data-activity=tool] .paM35W_armRight{animation:.55s ease-in-out infinite alternate paM35W_work}.paM35W_root[data-motion][data-activity=tool] .paM35W_badge{animation:.85s ease-in-out infinite alternate paM35W_signal}.paM35W_root[data-motion][data-activity=waiting] .paM35W_antenna>span{animation:.75s ease-in-out infinite alternate paM35W_signal}.paM35W_root[data-motion][data-activity=waiting] .paM35W_robot{animation:1.7s ease-in-out infinite alternate paM35W_wait}.paM35W_root[data-motion][data-activity=success] .paM35W_robot{animation:.8s cubic-bezier(.2,.8,.3,1) 2 paM35W_celebrate}.paM35W_root[data-activity=success] .paM35W_mouth{border-radius:2px 2px 12px 12px;height:13%}.paM35W_root[data-motion][data-activity=error] .paM35W_robot{animation:.38s ease-in-out 3 paM35W_errorShake}.paM35W_root[data-activity=error] .paM35W_eyeLeft,.paM35W_root[data-activity=error] .paM35W_eyeRight{height:8%;box-shadow:none;border-radius:2px}@keyframes paM35W_breathe{0%,to{transform:translateY(0)scale(1)}50%{transform:translateY(-2%)scale(1.015)}}@keyframes paM35W_ponder{0%{transform:rotate(-4deg)}to{transform:rotate(4deg)}}@keyframes paM35W_scan{0%{transform:translate(-16%)}to{transform:translate(16%)}}@keyframes paM35W_work{0%{transform:rotate(-12deg)}to{transform:rotate(-64deg)}}@keyframes paM35W_wait{0%{transform:rotate(-2deg)}to{transform:rotate(2deg)}}@keyframes paM35W_celebrate{0%,to{transform:translateY(0)rotate(0)}40%{transform:translateY(-12%)rotate(-3deg)}70%{transform:translateY(-5%)rotate(3deg)}}@keyframes paM35W_errorShake{0%,to{transform:translate(0)}25%{transform:translate(-5%)}75%{transform:translate(5%)}}@keyframes paM35W_signal{0%{opacity:.48;transform:translate(-50%)scale(.8)}to{opacity:1;transform:translate(-50%)scale(1.12)}}@media (prefers-reduced-motion:reduce){.paM35W_root *,.paM35W_root :before,.paM35W_root :after{scroll-behavior:auto!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}@media (width<=640px){.paM35W_root{bottom:12px;right:12px}.paM35W_bubble{min-width:132px}}";
const tagId = "dsh-companion/Companion.module.css";
if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
	const tag = document.createElement("style");
	tag.dataset.plugin = "dsh-companion";
	tag.dataset.pluginCss = tagId;
	tag.textContent = css;
	document.head.appendChild(tag);
}
var Companion_module_css_default = {
	"antenna": "paM35W_antenna",
	"armLeft": "paM35W_armLeft",
	"armRight": "paM35W_armRight",
	"badge": "paM35W_badge",
	"body": "paM35W_body",
	"breathe": "paM35W_breathe",
	"bubble": "paM35W_bubble",
	"celebrate": "paM35W_celebrate",
	"earLeft": "paM35W_earLeft",
	"earRight": "paM35W_earRight",
	"errorShake": "paM35W_errorShake",
	"eyeLeft": "paM35W_eyeLeft",
	"eyeRight": "paM35W_eyeRight",
	"face": "paM35W_face",
	"footLeft": "paM35W_footLeft",
	"footRight": "paM35W_footRight",
	"head": "paM35W_head",
	"metrics": "paM35W_metrics",
	"mouth": "paM35W_mouth",
	"petButton": "paM35W_petButton",
	"ponder": "paM35W_ponder",
	"rangeRow": "paM35W_rangeRow",
	"resetButton": "paM35W_resetButton",
	"robot": "paM35W_robot",
	"root": "paM35W_root",
	"scan": "paM35W_scan",
	"settings": "paM35W_settings",
	"settingsButton": "paM35W_settingsButton",
	"shadow": "paM35W_shadow",
	"signal": "paM35W_signal",
	"toggleRow": "paM35W_toggleRow",
	"wait": "paM35W_wait",
	"work": "paM35W_work"
};

//#endregion
//#region lib/types/client/Companion.js
function projectionRecord(value) {
	return typeof value === "object" && value !== null ? value : void 0;
}
function overlayContainer(root) {
	return root.closest("[data-shell-overlay]");
}
function formatDuration(ms) {
	const totalSeconds = Math.max(0, Math.round(ms / 1e3));
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}
function waitingKey(value) {
	if (value === "approval" || value === "question" || value === "plan-review") return `waiting.${value}`;
	return "waiting.default";
}
function statusKey(activity) {
	return `status.${activity}`;
}
function Companion({ useSessions, useStore, actions, t }) {
	const summary = useSessions((sessions) => {
		const id = sessions.current;
		return id === void 0 ? void 0 : sessions.byId[id];
	});
	const preferences = useStore((state) => state);
	const projections = projectionRecord(summary?.projectionValues);
	const projection = projections?.companion;
	const billing = readBillingMetrics(projections?.billing);
	const [now, setNow] = (0, react.useState)(() => Date.now());
	const [settingsOpen, setSettingsOpen] = (0, react.useState)(false);
	const [bubbleOverride, setBubbleOverride] = (0, react.useState)(null);
	const [draftPosition, setDraftPosition] = (0, react.useState)(null);
	const rootRef = (0, react.useRef)(null);
	const dragRef = (0, react.useRef)(null);
	const activity = resolveActivity({
		running: summary?.running ?? false,
		...summary?.pendingInteraction === void 0 ? {} : { pendingInteraction: summary.pendingInteraction },
		...projection === void 0 ? {} : { projection }
	}, now);
	const duration = elapsedMs(projection, summary?.running ?? false, now);
	const showBubble = bubbleOverride ?? preferences.showBubble;
	const position = draftPosition ?? preferences.position;
	(0, react.useEffect)(() => {
		if (summary?.running === true) {
			const interval = window.setInterval(() => {
				setNow(Date.now());
			}, 500);
			return () => {
				window.clearInterval(interval);
			};
		}
		if (projection?.status !== "success" && projection?.status !== "error") return;
		const remaining = (projection.status === "success" ? projection.successHoldMs : projection.errorHoldMs) - (Date.now() - projection.changedAt);
		if (remaining <= 0) return;
		const timeout = window.setTimeout(() => {
			setNow(Date.now());
		}, remaining + 10);
		return () => {
			window.clearTimeout(timeout);
		};
	}, [
		summary?.running,
		projection?.status,
		projection?.changedAt,
		projection?.successHoldMs,
		projection?.errorHoldMs
	]);
	(0, react.useEffect)(() => {
		if (preferences.position === null) return;
		const clamp = () => {
			const root = rootRef.current;
			if (root === null) return;
			const parent = overlayContainer(root);
			if (parent === null) return;
			const maxX = Math.max(0, parent.clientWidth - preferences.size);
			const maxY = Math.max(0, parent.clientHeight - preferences.size);
			const x = Math.min(maxX, Math.max(0, preferences.position?.x ?? 0));
			const y = Math.min(maxY, Math.max(0, preferences.position?.y ?? 0));
			if (x !== preferences.position?.x || y !== preferences.position?.y) actions.setPosition(x, y);
		};
		window.addEventListener("resize", clamp);
		clamp();
		return () => {
			window.removeEventListener("resize", clamp);
		};
	}, [
		actions,
		preferences.position?.x,
		preferences.position?.y,
		preferences.size
	]);
	const details = [];
	if (activity === "tool" && projection?.activeTool !== void 0) details.push(t("tool", { tool: projection.activeTool }));
	else if (activity === "waiting") details.push(t(waitingKey(summary?.pendingInteraction)));
	else if (activity === "error" && projection?.errorCode !== void 0) details.push(t("errorCode", { code: projection.errorCode }));
	else if (projection?.turn !== void 0 && (activity === "thinking" || activity === "success")) details.push(t("turn", { turn: projection.turn }));
	if (preferences.showMetrics && duration !== void 0 && activity !== "idle") details.push(t("duration", { duration: formatDuration(duration) }));
	const onPointerDown = (event) => {
		if (event.button !== 0) return;
		const root = rootRef.current;
		const parent = root === null ? null : overlayContainer(root);
		if (root === null || root === void 0 || parent === null || parent === void 0) return;
		const rootRect = root.getBoundingClientRect();
		const parentRect = parent.getBoundingClientRect();
		dragRef.current = {
			pointerId: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			originX: rootRect.left - parentRect.left,
			originY: rootRect.top - parentRect.top,
			moved: false
		};
		event.currentTarget.setPointerCapture(event.pointerId);
	};
	const onPointerMove = (event) => {
		const drag = dragRef.current;
		const root = rootRef.current;
		const parent = root === null ? null : overlayContainer(root);
		if (drag === null || drag.pointerId !== event.pointerId || parent === null || parent === void 0) return;
		const dx = event.clientX - drag.startX;
		const dy = event.clientY - drag.startY;
		if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
		const maxX = Math.max(0, parent.clientWidth - preferences.size);
		const maxY = Math.max(0, parent.clientHeight - preferences.size);
		setDraftPosition({
			x: Math.min(maxX, Math.max(0, drag.originX + dx)),
			y: Math.min(maxY, Math.max(0, drag.originY + dy))
		});
	};
	const onPointerUp = (event) => {
		const drag = dragRef.current;
		if (drag === null || drag.pointerId !== event.pointerId) return;
		if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
		if (draftPosition !== null) actions.setPosition(draftPosition.x, draftPosition.y);
		if (!drag.moved) setBubbleOverride((current) => !(current ?? preferences.showBubble));
		dragRef.current = null;
		setDraftPosition(null);
	};
	const rootStyle = position === null ? { "--pet-size": `${preferences.size}px` } : {
		"--pet-size": `${preferences.size}px`,
		left: position.x,
		top: position.y,
		right: "auto",
		bottom: "auto"
	};
	const settingsAlign = (position?.x ?? Number.POSITIVE_INFINITY) < 250 ? "left" : "right";
	return (0, react_jsx_runtime.jsxs)("aside", {
		ref: rootRef,
		className: Companion_module_css_default.root,
		style: rootStyle,
		"data-activity": activity,
		"data-motion": preferences.motion || void 0,
		"data-align": settingsAlign,
		"aria-live": "polite",
		children: [
			showBubble ? (0, react_jsx_runtime.jsxs)("div", {
				className: Companion_module_css_default.bubble,
				role: "status",
				children: [
					(0, react_jsx_runtime.jsx)("strong", { children: t(statusKey(activity)) }),
					details.map((line) => (0, react_jsx_runtime.jsx)("span", { children: line }, line)),
					preferences.showMetrics && billing !== void 0 ? (0, react_jsx_runtime.jsxs)("span", {
						className: Companion_module_css_default.metrics,
						children: [
							billing.totalTokens > 0 ? t("tokens", { count: billing.totalTokens.toLocaleString() }) : null,
							billing.totalTokens > 0 && billing.totalCost > 0 ? (0, react_jsx_runtime.jsx)("i", { "aria-hidden": "true" }) : null,
							billing.totalCost > 0 ? t("cost", { cost: new Intl.NumberFormat(void 0, {
								style: "currency",
								currency: billing.currency,
								maximumFractionDigits: 6
							}).format(billing.totalCost) }) : null
						]
					}) : null
				]
			}) : null,
			(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: settingsOpen ? t("closeSettings") : t("settings"),
				side: "top",
				children: (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: Companion_module_css_default.settingsButton,
					"aria-label": settingsOpen ? t("closeSettings") : t("settings"),
					"aria-expanded": settingsOpen,
					onClick: () => {
						setSettingsOpen((open) => !open);
					},
					children: settingsOpen ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutline16, { size: 15 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSettingsOutline16, { size: 15 })
				})
			}),
			(0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: Companion_module_css_default.petButton,
				"aria-label": t("drag"),
				onPointerDown,
				onPointerMove,
				onPointerUp,
				onPointerCancel: onPointerUp,
				children: [(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.shadow }), (0, react_jsx_runtime.jsxs)("span", {
					className: Companion_module_css_default.robot,
					"aria-hidden": "true",
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: Companion_module_css_default.antenna,
							children: (0, react_jsx_runtime.jsx)("span", {})
						}),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.earLeft }),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.earRight }),
						(0, react_jsx_runtime.jsx)("span", {
							className: Companion_module_css_default.head,
							children: (0, react_jsx_runtime.jsxs)("span", {
								className: Companion_module_css_default.face,
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.eyeLeft }),
									(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.eyeRight }),
									(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.mouth })
								]
							})
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: Companion_module_css_default.body,
							children: (0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.badge })
						}),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.armLeft }),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.armRight }),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.footLeft }),
						(0, react_jsx_runtime.jsx)("span", { className: Companion_module_css_default.footRight })
					]
				})]
			}),
			settingsOpen ? (0, react_jsx_runtime.jsxs)("section", {
				className: Companion_module_css_default.settings,
				"data-align": settingsAlign,
				"aria-label": t("settings"),
				children: [
					(0, react_jsx_runtime.jsx)("header", { children: (0, react_jsx_runtime.jsx)("strong", { children: t("settings") }) }),
					(0, react_jsx_runtime.jsxs)("label", {
						className: Companion_module_css_default.rangeRow,
						children: [
							(0, react_jsx_runtime.jsx)("span", { children: t("size") }),
							(0, react_jsx_runtime.jsx)("input", {
								type: "range",
								min: MIN_SIZE,
								max: MAX_SIZE,
								step: 4,
								value: preferences.size,
								onChange: (event) => {
									actions.setSize(Number(event.currentTarget.value));
								}
							}),
							(0, react_jsx_runtime.jsxs)("output", { children: [preferences.size, "px"] })
						]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: Companion_module_css_default.toggleRow,
						children: [(0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: preferences.showBubble,
							onChange: (event) => {
								setBubbleOverride(null);
								actions.setShowBubble(event.currentTarget.checked);
							}
						}), (0, react_jsx_runtime.jsx)("span", { children: t("showBubble") })]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: Companion_module_css_default.toggleRow,
						children: [(0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: preferences.showMetrics,
							onChange: (event) => {
								actions.setShowMetrics(event.currentTarget.checked);
							}
						}), (0, react_jsx_runtime.jsx)("span", { children: t("showMetrics") })]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: Companion_module_css_default.toggleRow,
						children: [(0, react_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: preferences.motion,
							onChange: (event) => {
								actions.setMotion(event.currentTarget.checked);
							}
						}), (0, react_jsx_runtime.jsx)("span", { children: t("motion") })]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: Companion_module_css_default.resetButton,
						onClick: () => {
							actions.resetPosition();
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 15 }), t("resetPosition")]
					})
				]
			}) : null
		]
	});
}

//#endregion
//#region lib/types/client/locales.js
const NS = "companion";
const zh = {
	"name": "DSH 小伴",
	"status.idle": "空闲中",
	"status.thinking": "正在思考",
	"status.tool": "正在使用工具",
	"status.waiting": "等待你的确认",
	"status.success": "任务完成",
	"status.error": "任务失败",
	"turn": "第 {turn} 轮",
	"tool": "工具：{tool}",
	"waiting.approval": "需要批准后继续",
	"waiting.question": "有问题等待回答",
	"waiting.plan-review": "计划等待审阅",
	"waiting.default": "需要你的操作",
	"duration": "耗时 {duration}",
	"errorCode": "错误：{code}",
	"tokens": "{count} Token",
	"cost": "参考费用 {cost}",
	"settings": "宠物设置",
	"closeSettings": "关闭设置",
	"size": "大小",
	"showBubble": "显示状态气泡",
	"showMetrics": "显示耗时与计费",
	"motion": "启用动画",
	"resetPosition": "回到右下角",
	"drag": "拖动宠物；单击切换状态气泡"
};
const en = {
	"name": "DSH Companion",
	"status.idle": "Idle",
	"status.thinking": "Thinking",
	"status.tool": "Using a tool",
	"status.waiting": "Waiting for you",
	"status.success": "Task complete",
	"status.error": "Task failed",
	"turn": "Turn {turn}",
	"tool": "Tool: {tool}",
	"waiting.approval": "Approval is required",
	"waiting.question": "A question needs an answer",
	"waiting.plan-review": "The plan needs review",
	"waiting.default": "Your action is required",
	"duration": "Elapsed {duration}",
	"errorCode": "Error: {code}",
	"tokens": "{count} tokens",
	"cost": "Est. cost {cost}",
	"settings": "Companion settings",
	"closeSettings": "Close settings",
	"size": "Size",
	"showBubble": "Show status bubble",
	"showMetrics": "Show time and billing",
	"motion": "Enable animation",
	"resetPosition": "Reset to bottom right",
	"drag": "Drag the companion; click to toggle its status bubble"
};

//#endregion
//#region lib/types/client/index.js
const inject = ["slots", "locale"];
function apply(ctx) {
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "companion: dictionaries");
	ctx.slots.inject("shell.overlay", () => ctx.slots.register({
		name: "shell.overlay",
		id: "companion",
		order: 40,
		locale: NS,
		store: createCompanionStore
	}, Companion));
}

//#endregion
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=client.js.map