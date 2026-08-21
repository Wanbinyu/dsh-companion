# Project Context

This document carries the implementation context needed to continue the project from a fresh Codex task without copying private conversation history into a public repository.

## Current Release

- Package: `dsh-companion`
- Version: `0.1.9`
- Target: DeepSeek Harness Web `0.1.0-rc.6+`
- Development baseline: `0.1.0-rc.8`
- License: MIT

## Product Decisions

- The companion is a practical status surface first and a pet second.
- It uses the user-provided blue whale boy in a black suit as its only character. There is no robot fallback, character picker, or appearance palette.
- States are idle, thinking, tool, waiting, success, and error.
- Waiting is derived from live pending interactions so Approval, Question, and Plan Review override the running animation.
- Tool calls are tracked by Call ID, including parallel calls.
- Position, size, UI accent color, bubble, and metrics are browser-local preferences. Motion is always enabled unless the operating system requests reduced motion. The existing v1 Store key remains unchanged so upgrades preserve the remaining preferences; a missing or malformed accent falls back to the default blue.
- The compact settings panel uses a dark translucent glass surface and explicit high-contrast text so it remains legible across Harness themes.
- The current blue whale boy identity asset lives in `assets/suave-whale-boy/`; it is a deterministic transparent-background cleanup of a user-generated image that the user has confirmed this project may publicly redistribute.
- Optimized WebP files are inlined into the browser bundle as data URIs, with no network requests.
- Non-idle states reuse the same identity cutout. Thinking adds an eye-level focus lens, tool use adds a pocket terminal by the left hand, waiting adds a gold ring by the whale tail, success glints at the lapel pin and tail, and error adds a red collar alert.
- After five idle minutes the character enters a CSS-only resting motion. Pointer, keyboard, or settings interaction restarts the local idle timer; clicking the character also shows localized feedback for about 1.8 seconds.
- A running task that reaches ten minutes gets a focused long-task motion and clock cue. The threshold is derived only from the existing session timing projection.
- The success bubble has an explicit check icon and success surface while retaining duration and optional billing details.
- Dialogue borrows `pet-tty`'s three-pool mood-line model without its event bridge or raw event titles. Working and success lines are selected deterministically per projected event; idle lines rotate every ten seconds until sleep.
- Users can edit working, success, and idle pools in a second settings tab. Inputs are capped at 12 lines of 80 characters, sanitized before browser-local Store persistence, and never sourced from session content.
- Pointer movement handles cancellation and fast release; keyboard arrows move by 8 px or 24 px with Shift.
- `dsh-billing` integration is optional and reads only its public projection. The bubble surfaces turn/session cost, cumulative tokens, quota progress, and unpriced-model warnings without duplicating accounting logic.

## Implementation Shape

- `src/projection.ts`: pure Host-side session projection.
- `src/client/derive.ts`: pure client activity, timing, and billing adapters.
- `src/client/Companion.tsx`: overlay and interactions.
- `src/client/store.ts`: root-scoped persisted Harness Store.
- `src/client/Companion.module.css`: visual states and responsive layout.

## Verified Behavior

- Strict Host and Web type checks pass.
- Seventeen unit/integration tests pass.
- The browser module builds as the DSH CommonJS ModuleLoader factory.
- The transparent idle WebP is about 85 kB before data URI encoding.
- Real-host rendering was checked at 1280x720 and 390x845.
- The settings panel stays inside both viewports.
- The optional billing plugin coexists and is detected without a hard dependency.

## Known Tooling Detail

`dsh 0.1.0-rc.7` can split a local Windows plugin path containing spaces. Package to a no-space path before calling `dsh plugin --profile web add`.

## Next Candidate Work

- Add a screenshot and short demo GIF after a reliable capture path is available.
- Publish the `v0.1.9` package as a GitHub Release asset.
- Visually check the resting, repeated-click, long-task, and completion states in a real Host.
- Consider a settings-page section only when it adds controls beyond the compact overlay panel.
