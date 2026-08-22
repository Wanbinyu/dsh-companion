import { useEffect, useRef, useState } from 'react'
import {
  IconCheckOutline16,
  IconCloseOutline16,
  IconRefreshOutline16,
  IconSettingsOutline16,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale, PropsRuntime, PropsStore } from '@deepseek-ai/dsh-client-ui-slots'
import type { CompanionActivity, CompanionProjection } from '../types.ts'
import {
  DIALOGUE_GROUPS,
  MAX_DIALOGUE_LINE_LENGTH,
  MAX_DIALOGUE_LINES,
  dialogueGroupForActivity,
  normalizeDialogueLines,
  parseDialogueText,
  pickDialogueLine,
  sameDialogueLines,
  type DialogueGroup,
  type DialoguePreferences,
} from './dialogue.ts'
import {
  clampPosition,
  normalizeAccentColor,
  elapsedMs,
  isLongTask,
  readBillingMetrics,
  resolveActivity,
} from './derive.ts'
import { BLUE_WHALE_BOY_ASSETS } from './blueWhaleAssets.ts'
import type { CompanionKey } from './locales.ts'
import { MAX_SIZE, MIN_SIZE, createCompanionStore } from './store.ts'
import css from './Companion.module.css'

export type CompanionProps =
  & PropsRuntime<'shell.overlay'>
  & PropsStore<ReturnType<typeof createCompanionStore>>
  & PropsLocale<'companion'>

interface DragState {
  pointerId: number
  startX: number
  startY: number
  originX: number
  originY: number
  moved: boolean
  wasSleeping: boolean
  latestPosition: { x: number; y: number } | null
}

const IDLE_SLEEP_MS = 5 * 60 * 1000
const IDLE_DIALOGUE_ROTATE_MS = 10 * 1000
const FEEDBACK_HOLD_MS = 1800
const CLICK_MOTION_MS = 560
const DIALOGUE_NOTICE_MS = 1800

const DEFAULT_DIALOGUE_KEYS: Record<DialogueGroup, readonly CompanionKey[]> = {
  working: [
    'dialogue.working.0',
    'dialogue.working.1',
    'dialogue.working.2',
    'dialogue.working.3',
    'dialogue.working.4',
    'dialogue.working.5',
  ],
  success: [
    'dialogue.success.0',
    'dialogue.success.1',
    'dialogue.success.2',
    'dialogue.success.3',
    'dialogue.success.4',
    'dialogue.success.5',
  ],
  idle: [
    'dialogue.idle.0',
    'dialogue.idle.1',
    'dialogue.idle.2',
    'dialogue.idle.3',
    'dialogue.idle.4',
    'dialogue.idle.5',
  ],
}

const DIALOGUE_LABEL_KEYS: Record<DialogueGroup, CompanionKey> = {
  working: 'dialogue.working',
  success: 'dialogue.success',
  idle: 'dialogue.idle',
}

type SettingsTab = 'status' | 'dialogue'
type DialogueNotice = 'saved' | 'reset'

function projectionRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : undefined
}

function overlayContainer(root: HTMLElement): HTMLElement | null {
  return root.closest<HTMLElement>('[data-shell-overlay]')
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return minutes === 0 ? `${seconds}s` : `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}

function formatMoney(currency: string, value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 6,
  }).format(value)
}

function waitingKey(value: string | undefined): CompanionKey {
  if (value === 'approval' || value === 'question' || value === 'plan-review') {
    return `waiting.${value}`
  }
  return 'waiting.default'
}

function statusKey(activity: CompanionActivity): CompanionKey {
  return `status.${activity}`
}

function feedbackKey(activity: CompanionActivity): CompanionKey {
  return `feedback.${activity}`
}

export function Companion({ useSessions, useStore, actions, t }: CompanionProps) {
  const summary = useSessions((sessions) => {
    const id = sessions.current
    return id === undefined ? undefined : sessions.byId[id]
  })
  const preferences = useStore(state => state)
  const projections = projectionRecord(summary?.projectionValues)
  const projection = projections?.companion as CompanionProjection | undefined
  const billing = readBillingMetrics(projections?.billing)
  const [now, setNow] = useState(() => Date.now())
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('status')
  const [sleepReady, setSleepReady] = useState(false)
  const [idleCycle, setIdleCycle] = useState(0)
  const [idleDialogueIndex, setIdleDialogueIndex] = useState(0)
  const [feedback, setFeedback] = useState<CompanionKey | null>(null)
  const [interactionId, setInteractionId] = useState(0)
  const [interactionAnimating, setInteractionAnimating] = useState(false)
  const [dialogueDraft, setDialogueDraft] = useState<Record<DialogueGroup, string>>({
    working: '',
    success: '',
    idle: '',
  })
  const [dialogueDraftReady, setDialogueDraftReady] = useState(false)
  const [dialogueNotice, setDialogueNotice] = useState<DialogueNotice | null>(null)
  const [draftPosition, setDraftPosition] = useState<{ x: number; y: number } | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const dragRef = useRef<DragState | null>(null)
  const feedbackTimerRef = useRef<number | null>(null)
  const interactionTimerRef = useRef<number | null>(null)
  const dialogueNoticeTimerRef = useRef<number | null>(null)

  const activity = resolveActivity({
    running: summary?.running ?? false,
    ...(summary?.pendingInteraction === undefined ? {} : { pendingInteraction: summary.pendingInteraction }),
    ...(projection === undefined ? {} : { projection }),
  }, now)
  const duration = elapsedMs(projection, summary?.running ?? false, now)
  const sleeping = sleepReady && activity === 'idle'
  const longTask = isLongTask(summary?.running ?? false, duration) && activity !== 'waiting'
  const showBubble = feedback !== null || preferences.showBubble
  const position = draftPosition ?? preferences.position
  const accentColor = normalizeAccentColor(preferences.accentColor)
  const defaultDialogueLines: Record<DialogueGroup, string[]> = {
    working: DEFAULT_DIALOGUE_KEYS.working.map(key => t(key)),
    success: DEFAULT_DIALOGUE_KEYS.success.map(key => t(key)),
    idle: DEFAULT_DIALOGUE_KEYS.idle.map(key => t(key)),
  }
  const dialogueLines: Record<DialogueGroup, string[]> = {
    working: normalizeDialogueLines(preferences.dialogueLines?.working) ?? defaultDialogueLines.working,
    success: normalizeDialogueLines(preferences.dialogueLines?.success) ?? defaultDialogueLines.success,
    idle: normalizeDialogueLines(preferences.dialogueLines?.idle) ?? defaultDialogueLines.idle,
  }

  useEffect(() => {
    if (summary?.running === true) {
      const interval = window.setInterval(() => { setNow(Date.now()) }, 1000)
      return () => { window.clearInterval(interval) }
    }
    if (projection?.status !== 'success' && projection?.status !== 'error') return
    const holdMs = projection.status === 'success' ? projection.successHoldMs : projection.errorHoldMs
    const remaining = holdMs - (Date.now() - projection.changedAt)
    if (remaining <= 0) return
    const timeout = window.setTimeout(() => { setNow(Date.now()) }, remaining + 10)
    return () => { window.clearTimeout(timeout) }
  }, [
    summary?.running,
    projection?.status,
    projection?.changedAt,
    projection?.successHoldMs,
    projection?.errorHoldMs,
  ])

  useEffect(() => {
    setSleepReady(false)
    if (activity !== 'idle') return
    const timeout = window.setTimeout(() => { setSleepReady(true) }, IDLE_SLEEP_MS)
    return () => { window.clearTimeout(timeout) }
  }, [activity, idleCycle])

  useEffect(() => {
    setIdleDialogueIndex(0)
    if (activity !== 'idle' || sleeping || !preferences.showBubble) return
    const interval = window.setInterval(() => {
      setIdleDialogueIndex(index => index + 1)
    }, IDLE_DIALOGUE_ROTATE_MS)
    return () => { window.clearInterval(interval) }
  }, [activity, dialogueLines.idle.length, preferences.showBubble, sleeping])

  useEffect(() => () => {
    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current)
    if (dialogueNoticeTimerRef.current !== null) window.clearTimeout(dialogueNoticeTimerRef.current)
  }, [])

  useEffect(() => {
    if (preferences.position === null) return
    const clamp = () => {
      const root = rootRef.current
      if (root === null) return
      const parent = overlayContainer(root)
      if (parent === null) return
      const { x, y } = clampPosition(
        preferences.position?.x ?? 0,
        preferences.position?.y ?? 0,
        parent.clientWidth,
        parent.clientHeight,
        preferences.size,
      )
      if (x !== preferences.position?.x || y !== preferences.position?.y) actions.setPosition(x, y)
    }
    window.addEventListener('resize', clamp)
    clamp()
    return () => { window.removeEventListener('resize', clamp) }
  }, [actions, preferences.position?.x, preferences.position?.y, preferences.size])

  const details: string[] = []
  if (activity === 'tool' && projection?.activeTool !== undefined) {
    details.push(t('tool', { tool: projection.activeTool }))
  } else if (activity === 'waiting') {
    details.push(t(waitingKey(summary?.pendingInteraction)))
  } else if (activity === 'error' && projection?.errorCode !== undefined) {
    details.push(t('errorCode', { code: projection.errorCode }))
  } else if (projection?.turn !== undefined && (activity === 'thinking' || activity === 'success')) {
    details.push(t('turn', { turn: projection.turn }))
  }

  if (preferences.showMetrics && duration !== undefined && activity !== 'idle') {
    details.push(t('duration', { duration: formatDuration(duration) }))
  }
  if (longTask) details.push(t('longTask'))

  const billingItems: { key: string; label: string; warning?: boolean }[] = []
  if (billing !== undefined) {
    if (billing.latestTurn !== undefined && billing.latestTurn.cost > 0) {
      billingItems.push({
        key: 'turn-cost',
        label: t('billing.turnCost', { cost: formatMoney(billing.currency, billing.latestTurn.cost) }),
      })
    }
    if (billing.totalCost > 0) {
      billingItems.push({
        key: 'session-cost',
        label: t('billing.sessionCost', { cost: formatMoney(billing.currency, billing.totalCost) }),
      })
    }
    if (billing.totalTokens > 0) {
      billingItems.push({
        key: 'tokens',
        label: t('tokens', { count: billing.totalTokens.toLocaleString() }),
      })
    }
    if (billing.quota !== undefined) {
      billingItems.push({
        key: 'quota',
        label: t('billing.quota', { percent: Math.round(billing.quota.percent * 100) }),
        warning: billing.quota.percent >= 0.8 || billing.quota.estimated,
      })
    }
    if (billing.unpricedModelCount > 0) {
      billingItems.push({
        key: 'unpriced',
        label: t('billing.unpriced', { count: billing.unpricedModelCount }),
        warning: true,
      })
    }
  }

  const activeDialogueGroup = dialogueGroupForActivity(activity)
  const dialogueSeed = `${activity}:${projection?.changedAt ?? projection?.startedAt ?? 0}:${projection?.turn ?? 0}`
  const dialogueLine = feedback === null && !sleeping && activeDialogueGroup !== undefined
    ? activeDialogueGroup === 'idle'
      ? dialogueLines.idle[idleDialogueIndex % dialogueLines.idle.length]
      : pickDialogueLine(dialogueLines[activeDialogueGroup], dialogueSeed)
    : undefined

  const hydratedDialogueDraft = (): Record<DialogueGroup, string> => ({
    working: dialogueLines.working.join('\n'),
    success: dialogueLines.success.join('\n'),
    idle: dialogueLines.idle.join('\n'),
  })

  const showDialogueNotice = (notice: DialogueNotice) => {
    setDialogueNotice(notice)
    if (dialogueNoticeTimerRef.current !== null) window.clearTimeout(dialogueNoticeTimerRef.current)
    dialogueNoticeTimerRef.current = window.setTimeout(() => {
      setDialogueNotice(null)
      dialogueNoticeTimerRef.current = null
    }, DIALOGUE_NOTICE_MS)
  }

  const openDialogueTab = () => {
    if (!dialogueDraftReady) {
      setDialogueDraft(hydratedDialogueDraft())
      setDialogueDraftReady(true)
    }
    setSettingsTab('dialogue')
  }

  const saveDialogueLines = () => {
    const custom: DialoguePreferences = {}
    const normalizedDraft = {} as Record<DialogueGroup, string>
    for (const group of DIALOGUE_GROUPS) {
      const lines = parseDialogueText(dialogueDraft[group])
      const effective = lines ?? defaultDialogueLines[group]
      if (lines !== null && !sameDialogueLines(lines, defaultDialogueLines[group])) custom[group] = lines
      normalizedDraft[group] = effective.join('\n')
    }
    actions.setDialogueLines(Object.keys(custom).length === 0 ? null : custom)
    setDialogueDraft(normalizedDraft)
    showDialogueNotice('saved')
  }

  const resetDialogueLines = () => {
    actions.setDialogueLines(null)
    setDialogueDraft({
      working: defaultDialogueLines.working.join('\n'),
      success: defaultDialogueLines.success.join('\n'),
      idle: defaultDialogueLines.idle.join('\n'),
    })
    setDialogueDraftReady(true)
    showDialogueNotice('reset')
  }

  const restartIdleTimer = () => {
    setSleepReady(false)
    setIdleCycle(cycle => cycle + 1)
  }

  const showInteractionFeedback = (wasSleeping = sleeping) => {
    restartIdleTimer()
    setFeedback(wasSleeping ? 'feedback.wake' : feedbackKey(activity))
    setInteractionId(id => id + 1)
    setInteractionAnimating(true)

    if (feedbackTimerRef.current !== null) window.clearTimeout(feedbackTimerRef.current)
    feedbackTimerRef.current = window.setTimeout(() => {
      setFeedback(null)
      feedbackTimerRef.current = null
    }, FEEDBACK_HOLD_MS)

    if (interactionTimerRef.current !== null) window.clearTimeout(interactionTimerRef.current)
    interactionTimerRef.current = window.setTimeout(() => {
      setInteractionAnimating(false)
      interactionTimerRef.current = null
    }, CLICK_MOTION_MS)
  }

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const root = rootRef.current
    const parent = root === null ? null : overlayContainer(root)
    if (root === null || root === undefined || parent === null || parent === undefined) return
    const rootRect = root.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: rootRect.left - parentRect.left,
      originY: rootRect.top - parentRect.top,
      moved: false,
      wasSleeping: sleeping,
      latestPosition: null,
    }
    restartIdleTimer()
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    const root = rootRef.current
    const parent = root === null ? null : overlayContainer(root)
    if (drag === null || drag.pointerId !== event.pointerId || parent === null || parent === undefined) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true
    const next = clampPosition(
      drag.originX + dx,
      drag.originY + dy,
      parent.clientWidth,
      parent.clientHeight,
      preferences.size,
    )
    drag.latestPosition = next
    setDraftPosition(next)
  }

  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    if (drag.latestPosition !== null) actions.setPosition(drag.latestPosition.x, drag.latestPosition.y)
    if (!drag.moved) showInteractionFeedback(drag.wasSleeping)
    dragRef.current = null
    setDraftPosition(null)
  }

  const onPointerCancel = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current
    if (drag === null || drag.pointerId !== event.pointerId) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    dragRef.current = null
    setDraftPosition(null)
  }

  const onPetKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const offsets: Partial<Record<string, { x: number; y: number }>> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    }
    const offset = offsets[event.key]
    if (offset === undefined) return
    const root = rootRef.current
    const parent = root === null ? null : overlayContainer(root)
    if (root === null || parent === null) return
    event.preventDefault()
    const rootRect = root.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    const step = event.shiftKey ? 24 : 8
    const next = clampPosition(
      rootRect.left - parentRect.left + offset.x * step,
      rootRect.top - parentRect.top + offset.y * step,
      parent.clientWidth,
      parent.clientHeight,
      preferences.size,
    )
    actions.setPosition(next.x, next.y)
    restartIdleTimer()
  }

  const rootStyle = position === null
    ? {
        '--pet-size': `${preferences.size}px`,
        '--pet-user-accent': accentColor,
      } as React.CSSProperties
    : {
        '--pet-size': `${preferences.size}px`,
        '--pet-user-accent': accentColor,
        left: position.x,
        top: position.y,
        right: 'auto',
        bottom: 'auto',
      } as React.CSSProperties
  const settingsAlign = (position?.x ?? Number.POSITIVE_INFINITY) < 250 ? 'left' : 'right'

  return (
    <aside
      ref={rootRef}
      className={css.root}
      style={rootStyle}
      data-activity={activity}
      data-sleeping={sleeping || undefined}
      data-long-task={longTask || undefined}
      data-click-pulse={interactionAnimating ? interactionId % 2 : undefined}
      data-align={settingsAlign}
      aria-live="polite"
    >
      {showBubble ? (
        <div
          key={feedback === null ? 'status' : `feedback-${interactionId}`}
          className={css.bubble}
          role="status"
          data-tone={activity}
          data-feedback={feedback !== null || undefined}
        >
          <span className={css.bubbleTitle}>
            {feedback === null && activity === 'success' ? <IconCheckOutline16 size={16} /> : null}
            <strong>{t(feedback ?? (sleeping ? 'status.sleeping' : statusKey(activity)))}</strong>
          </span>
          {dialogueLine !== undefined ? <span className={css.dialogueLine}>{dialogueLine}</span> : null}
          {feedback === null ? details.map(line => <span key={line}>{line}</span>) : null}
          {feedback === null && preferences.showMetrics && billingItems.length > 0 ? (
            <span className={css.metrics}>
              {billingItems.map(item => (
                <span key={item.key} className={item.warning === true ? css.metricWarning : undefined}>
                  {item.label}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      ) : null}

      <Tooltip label={settingsOpen ? t('closeSettings') : t('settings')} side="top">
        <button
          type="button"
          className={css.settingsButton}
          aria-label={settingsOpen ? t('closeSettings') : t('settings')}
          aria-expanded={settingsOpen}
          onClick={() => {
            restartIdleTimer()
            if (settingsOpen) {
              setSettingsOpen(false)
              setDialogueDraftReady(false)
            } else {
              if (settingsTab === 'dialogue') {
                setDialogueDraft(hydratedDialogueDraft())
                setDialogueDraftReady(true)
              }
              setSettingsOpen(true)
            }
          }}
        >
          {settingsOpen ? <IconCloseOutline16 size={15} /> : <IconSettingsOutline16 size={15} />}
        </button>
      </Tooltip>

      <button
        type="button"
        className={css.petButton}
        aria-label={t('drag')}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onKeyDown={onPetKeyDown}
        onClick={event => {
          if (event.detail === 0) showInteractionFeedback()
        }}
      >
        <span className={css.shadow} />
        <span className={css.blueWhale} aria-hidden="true">
          <img src={BLUE_WHALE_BOY_ASSETS[activity]} alt="" draggable={false} />
          <span className={css.stateProp} />
        </span>
        <span className={css.sleepCue} aria-hidden="true" />
        <span className={css.longTaskCue} aria-hidden="true" />
      </button>

      {settingsOpen ? (
        <section className={css.settings} data-align={settingsAlign} aria-label={t('settings')}>
          <header>
            <strong>{t('settings')}</strong>
          </header>
          <div className={css.settingsTabs} role="tablist" aria-label={t('settings')}>
            <button
              type="button"
              role="tab"
              aria-selected={settingsTab === 'status'}
              onClick={() => { setSettingsTab('status') }}
            >
              {t('settings.statusTab')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={settingsTab === 'dialogue'}
              onClick={openDialogueTab}
            >
              {t('settings.dialogueTab')}
            </button>
          </div>

          {settingsTab === 'status' ? (
            <div className={css.settingsPane} role="tabpanel">
              <label className={css.rangeRow}>
                <span>{t('size')}</span>
                <input
                  type="range"
                  min={MIN_SIZE}
                  max={MAX_SIZE}
                  step={4}
                  value={preferences.size}
                  onChange={event => { actions.setSize(Number(event.currentTarget.value)) }}
                />
                <output>{preferences.size}px</output>
              </label>
              <label className={css.colorRow}>
                <span>{t('accentColor')}</span>
                <input
                  type="color"
                  value={accentColor}
                  aria-label={t('accentColor')}
                  onInput={event => { actions.setAccentColor(event.currentTarget.value) }}
                />
                <output>{accentColor.toUpperCase()}</output>
              </label>
              <label className={css.toggleRow}>
                <input
                  type="checkbox"
                  checked={preferences.showBubble}
                  onChange={event => { actions.setShowBubble(event.currentTarget.checked) }}
                />
                <span>{t('showBubble')}</span>
              </label>
              <label className={css.toggleRow}>
                <input
                  type="checkbox"
                  checked={preferences.showMetrics}
                  onChange={event => { actions.setShowMetrics(event.currentTarget.checked) }}
                />
                <span>{t('showMetrics')}</span>
              </label>
              <button type="button" className={css.resetButton} onClick={() => { actions.resetPosition() }}>
                <IconRefreshOutline16 size={15} />
                {t('resetPosition')}
              </button>
            </div>
          ) : (
            <div className={css.settingsPane} role="tabpanel">
              <p className={css.dialogueHint}>{t('dialogue.hint')}</p>
              {DIALOGUE_GROUPS.map(group => (
                <label key={group} className={css.dialogueField}>
                  <span>{t(DIALOGUE_LABEL_KEYS[group])}</span>
                  <textarea
                    rows={3}
                    maxLength={MAX_DIALOGUE_LINES * (MAX_DIALOGUE_LINE_LENGTH + 1)}
                    value={dialogueDraft[group]}
                    onChange={event => {
                      const value = event.currentTarget.value
                      setDialogueDraft(current => ({ ...current, [group]: value }))
                      setDialogueNotice(null)
                    }}
                  />
                </label>
              ))}
              <div className={css.dialogueActions}>
                <button type="button" className={css.saveButton} onClick={saveDialogueLines}>
                  <IconCheckOutline16 size={15} />
                  {t('dialogue.save')}
                </button>
                <button type="button" className={css.resetButton} onClick={resetDialogueLines}>
                  <IconRefreshOutline16 size={15} />
                  {t('dialogue.reset')}
                </button>
              </div>
              {dialogueNotice !== null ? (
                <span className={css.dialogueNotice} role="status">
                  {t(dialogueNotice === 'saved' ? 'dialogue.saved' : 'dialogue.resetDone')}
                </span>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </aside>
  )
}
