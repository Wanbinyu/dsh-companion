# Project Context

This document carries the implementation context needed to continue the project from a fresh Codex task without copying private conversation history into a public repository.

## Current Release

- Package: `dsh-companion`
- Version: `0.1.0`
- Target: DeepSeek Harness Web `0.1.0-rc.6+`
- Development baseline: `0.1.0-rc.8`
- License: MIT

## Product Decisions

- The companion is a practical status surface first and a pet second.
- It uses an original CSS robot to avoid asset licensing and keep the package small.
- States are idle, thinking, tool, waiting, success, and error.
- Waiting is derived from live pending interactions so Approval, Question, and Plan Review override the running animation.
- Tool calls are tracked by Call ID, including parallel calls.
- Position, size, bubble, metrics, and motion are browser-local preferences.
- `dsh-billing` integration is optional and reads only its public projection.

## Implementation Shape

- `src/projection.ts`: pure Host-side session projection.
- `src/client/derive.ts`: pure client activity, timing, and billing adapters.
- `src/client/Companion.tsx`: overlay and interactions.
- `src/client/store.ts`: root-scoped persisted Harness Store.
- `src/client/Companion.module.css`: visual states and responsive layout.

## Verified Behavior

- Strict Host and Web type checks pass.
- Ten unit/integration tests pass.
- The browser module builds as the DSH CommonJS ModuleLoader factory.
- The packed release is about 26 kB.
- Real-host rendering was checked at 1280x720 and 390x845.
- The settings panel stays inside both viewports.
- The optional billing plugin coexists and is detected without a hard dependency.

## Known Tooling Detail

`dsh 0.1.0-rc.7` can split a local Windows plugin path containing spaces. Package to a no-space path before calling `dsh plugin --profile web add`.

## Next Candidate Work

- Add a screenshot and short demo GIF after a reliable capture path is available.
- Add one or two optional bitmap skins without changing the status model.
- Publish the `v0.1.0` package as a GitHub Release asset.
- Consider a settings-page section only when it adds controls beyond the compact overlay panel.
