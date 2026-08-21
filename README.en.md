<h1 align="center">dsh-companion</h1>

<p align="center">
  <strong>A DeepSeek Harness Web companion that understands task state</strong><br>
  Character motion, status bubbles, and optional billing data make long-running work easier to follow.
</p>

<p align="center">
  <strong>English</strong> · <a href="README.md">简体中文</a>
</p>

<p align="center">
  <a href="https://github.com/Wanbinyu/dsh-companion/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/Wanbinyu/dsh-companion/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://github.com/Wanbinyu/dsh-companion/releases/latest"><img alt="Release" src="https://img.shields.io/github/v/release/Wanbinyu/dsh-companion?style=flat-square"></a>
  <img alt="DeepSeek Harness >= 0.1.0-rc.6" src="https://img.shields.io/badge/DeepSeek_Harness-%3E%3D0.1.0--rc.6-4f8cff?style=flat-square">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/badge/code-MIT-2ea44f?style=flat-square"></a>
</p>

> [!IMPORTANT]
> This is an unofficial community plugin. It is not affiliated with or endorsed by DeepSeek.

## In Action

<p align="center">
  <img src="https://raw.githubusercontent.com/Wanbinyu/dsh-companion/main/docs/images/companion-overview.png" width="320" alt="dsh-companion idle state, character, and billing information">
  &nbsp;&nbsp;
  <img src="https://raw.githubusercontent.com/Wanbinyu/dsh-companion/main/docs/images/companion-dialogue-settings.png" width="250" alt="dsh-companion dialogue settings panel">
</p>

<p align="center"><sub>Real host screenshots: status and billing overview · frosted-glass dialogue settings</sub></p>

## Highlights

- **Real task-state awareness**: distinguishes idle, thinking, tool use, waiting, success, and error instead of looping decorative animation.
- **Responsive character interaction**: supports dragging, scaling, click feedback, a five-minute rest motion, a ten-minute long-task motion, completion bubbles, and editable working, completion, and idle lines.
- **Optional billing integration**: automatically shows turn/session cost, tokens, quota progress, and unpriced-model warnings when `dsh-billing` is installed, without duplicating its accounting logic or requiring extra configuration.
- **Local and privacy-conscious**: retains only status, turn, tool name, timing, and a short error code. It does not read prompts, responses, tool arguments, file contents, or API keys, and sends no telemetry.

## Quick Start

Requires Node.js `>=22.19` and DeepSeek Harness `0.1.0-rc.6` or later. Development is verified against the currently pinned `0.1.0-rc.8` packages.

Install the release archive and start Harness Web:

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz
dsh web
```

[Download v0.1.9](https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz) · [View all releases](https://github.com/Wanbinyu/dsh-companion/releases)

Uninstall:

```bash
dsh plugin --profile web remove dsh-companion
```

## Usage

- Drag the character to move it. Once focused, use the arrow keys for precise movement and hold Shift for larger steps.
- Click the character for a short response motion and bubble. Clicking while resting wakes it immediately.
- Open the gear menu to change the 80-140 px size, UI accent color, status bubble, and billing information.
- Switch between Status and Lines in settings. All three dialogue pools can be edited one line at a time; leave a pool empty to restore its localized defaults.
- Reset returns the character to the bottom-right corner. Position, size, accent, and lines stay in the current browser only.
- A pending approval, question, or plan review takes precedence over tool animation.

Character motion is always enabled and respects the system reduced-motion preference. Short click feedback remains visible for about 1.8 seconds even when the persistent status bubble is disabled.

## State Mapping

| Companion state | Harness signal | Character behavior |
| --- | --- | --- |
| Idle | The current session is not running | Gentle breathing, then resting after five minutes |
| Thinking | A Turn is running | Eye-level focus lens and observing motion; long-task motion after ten minutes |
| Tool | At least one `tool/call` is unsettled | Pocket terminal by the left hand; clock cue after ten minutes |
| Waiting | Approval, Question, or Plan Review | Gold prompt ring beside the whale tail |
| Success | `turn/end: completed` | Lapel-pin and tail glints with an icon-led completion bubble |
| Error | Error, max-tokens, or interrupted | Red collar alert and a brief shake |

Parallel tool calls are tracked by Call ID. Completing one call does not move the companion back to thinking while another call is still active.

## Optional Billing Integration

The plugin does not depend on `dsh-billing`. When that plugin is installed in the current Web profile, Companion reads its public, read-only `billing` session projection and shows:

- turn and session cost;
- cumulative tokens and quota progress;
- the number of unpriced models.

The section stays hidden when the billing plugin is absent or no usage has been reported. Pricing, catalog lookup, quota calculation, and usage deduplication remain owned by `dsh-billing`. Billing data is not copied into another store or sent to an external service.

## Configuration

The Web profile receives this default Host configuration through `cordis.patch.yml`:

```yaml
- insert:
    - id: companion
      name: dsh-companion
      config:
        successHoldMs: 5000
        errorHoldMs: 10000
```

| Option | Default | Range | Description |
| --- | ---: | ---: | --- |
| `successHoldMs` | `5000` | 0-60000 | How long the success state remains visible, in milliseconds |
| `errorHoldMs` | `10000` | 0-120000 | How long the error state remains visible, in milliseconds |

Position, size, UI accent color, bubble, metrics, and custom dialogue lines are browser preferences persisted through the Harness Store. They are not written to session logs. The accent does not recolor the character image, and waiting, success, and error retain distinct semantic cues.

## Implementation And Compatibility

- Renders through the official `shell.overlay` slot without replacing Harness components or querying or mutating the DOM outside its Slot.
- Uses the official Session Projection, Locale, and Store APIs.
- Keeps `@deepseek-ai/dsh-client-runtime/client` external in the browser bundle for compatibility with its ModuleLoader wrapper.
- Automatically follows the Harness language in Chinese and English.
- Supports DeepSeek Harness `0.1.0-rc.6` and later, with ongoing development verification against the pinned `rc.8` packages.

## Privacy Boundary

The Host projection stores only status, turn, tool name, timing, and an error code. It does not store or display:

- user prompts or model responses;
- tool arguments or tool results;
- API keys, request headers, or full provider error messages;
- workspace file contents or paths;
- external telemetry identifiers.

## Asset Source And License

The blue whale boy character image was generated and provided by the user. The current runtime asset is a deterministic transparent-background cleanup and WebP compression of that image, recorded in `assets/suave-whale-boy/`. All six states reuse the same character cutout with CSS motion and no-text cues aligned with the eye, left hand, lapel pin, and whale tail. Runtime assets are inlined into the browser bundle and create no network requests.

The user has confirmed that this project may publicly redistribute the character image. The bitmap asset is not automatically covered by the repository's MIT license; the code remains covered by the repository license.

## Local Development

```bash
npm install
npm run verify
```

`verify` runs Host/Web type checks, projection and client derivation tests, the browser module build, and a package-content check.

Install a local development build:

```bash
npm run build
dsh plugin --profile web add .
dsh web
```

On Windows, `dsh 0.1.0-rc.7` may split a local plugin path that contains spaces. If that occurs, pack to a path without spaces first:

```powershell
New-Item -ItemType Directory -Force G:\dsh-packages
npm pack --pack-destination G:\dsh-packages
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.9.tgz
```

Project structure:

```text
src/projection.ts        Read-only Host session-state projection
src/client/derive.ts     State, timing, and optional billing derivation
src/client/Companion.tsx shell.overlay component
src/client/store.ts      Harness Store-backed browser preferences
cordis.patch.yml         DSH plugin manifest
```

## Feedback And License

Please report problems and suggestions through [GitHub Issues](https://github.com/Wanbinyu/dsh-companion/issues). Code is available under the [MIT License](LICENSE); see the asset section above for the character bitmap terms.
