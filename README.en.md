# dsh-companion

English | [简体中文](README.md)

> Unofficial community plugin. This project is not affiliated with or endorsed by DeepSeek.

A state-aware desktop companion for DeepSeek Harness Web. Instead of looping decorative animation, it reacts to the current session and clearly signals when the user needs to act.

## Features

- Uses the official `shell.overlay` slot without replacing UI components or injecting DOM;
- Distinguishes idle, thinking, tool use, waiting, success, and error states;
- Shows the active tool, turn, elapsed time, and a redacted error code;
- Automatically shows turn/session cost, tokens, quota progress, and unpriced-model warnings when `dsh-billing` is installed;
- Remembers its dragged position and supports sizes from 80 to 140 px;
- Uses the user-provided blue whale boy in a black suit as its only character, with no character or appearance switcher;
- Expresses all six states through character motion and no-text cues aligned with his eye, left hand, lapel pin, and whale tail;
- Provides a high-contrast frosted-glass settings panel with a browser-persisted UI accent color;
- Enters a resting motion with a `Z` cue after five idle minutes, then wakes with a short click response;
- Switches to a focused motion and clock cue after ten minutes of continuous work without reading task content;
- Gives completion a stronger success bubble and icon while retaining elapsed time and optional billing details;
- Adapts `pet-tty`'s mood-line approach into separate working, completion, and idle pools; event lines stay stable while idle lines rotate every ten seconds;
- Adds a Lines settings tab for editing all three pools one line at a time, with localized defaults and browser-local persistence;
- Lets users disable the bubble or metrics; character motion runs automatically and respects reduced-motion preferences;
- Follows the Harness language in Chinese and English;
- Runs locally and does not read API keys, prompts, or tool results or send telemetry.

## State Mapping

| Companion state | Harness signal | Motion |
| --- | --- | --- |
| Idle | The current session is not running | Gentle breathing, then resting after five minutes |
| Thinking | A Turn is running | Eye-level focus lens; long-task motion after ten minutes |
| Tool | At least one `tool/call` is unsettled | Pocket terminal; clock cue after ten minutes |
| Waiting | Approval, Question, or Plan Review | Gold prompt ring beside the whale tail |
| Success | `turn/end: completed` | Lapel-pin and tail glints with an icon-led completion bubble |
| Error | Error, max-tokens, or interrupted | Red collar alert and brief shake |

Parallel tool calls are tracked by Call ID. Completing one call does not move the companion back to thinking while another call is still active.

## Installation

Requires Node.js `>=22.19` and DeepSeek Harness `0.1.0-rc.6` or later. Development verification targets `0.1.0-rc.8`.

Release archive:

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.9/dsh-companion-0.1.9.tgz
dsh web
```

Local development build, from this repository:

```bash
npm install
npm run build
dsh plugin --profile web add .
dsh web
```

On Windows, `dsh 0.1.0-rc.7` may split a local plugin path that contains spaces. If the repository path contains spaces, pack to a path without spaces first:

```powershell
New-Item -ItemType Directory -Force G:\dsh-packages
npm pack --pack-destination G:\dsh-packages
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.9.tgz
```


Uninstall:

```bash
dsh plugin --profile web remove dsh-companion
```

## Usage

- Drag the companion to move it; the position is saved in the current browser.
- Focus the companion and use the arrow keys for precise movement; hold Shift for larger steps.
- Click the companion for a short motion and feedback bubble; clicking while resting wakes it immediately.
- Open the gear menu to change size, UI accent color, and visible information.
- Switch between Status and Lines in settings; custom pools allow up to 12 lines of 80 characters each.
- Reset returns it to the bottom-right corner.
- A pending approval, question, or plan review takes precedence over tool animation.
- Click feedback still appears when the persistent status bubble is disabled, then clears after about 1.8 seconds without changing the saved preference.

## Optional Billing Integration

The plugin does not depend on `dsh-billing`. When that plugin is present in the Web profile, Companion reads its public, read-only `billing` session projection and shows turn cost, session cost, cumulative tokens, quota progress, and the number of unpriced models. Nothing is shown when the plugin is absent or no usage has been reported. Pricing, catalog lookup, quota calculation, and usage deduplication remain owned by the billing plugin; Companion does not duplicate accounting logic.

Billing data is not copied into another store or sent to an external service.

## Configuration

The Web profile receives this default `cordis.patch.yml` entry:

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

Position, size, UI accent color, bubble, metrics, and custom dialogue lines are browser preferences persisted through the Harness Store. They are not written to session logs. Character motion runs automatically without a separate toggle and respects reduced-motion preferences. The accent does not recolor the character image, and waiting, success, and error retain distinct semantic cues.

## Asset Source And License

The blue whale boy character image was generated and provided by the user. The current runtime asset is a deterministic transparent-background cleanup and WebP compression of that user-provided image, recorded in `assets/suave-whale-boy/`. All six states reuse the same character cutout with CSS motion and no-text cues aligned with the eye, left hand, lapel pin, and whale tail. Runtime assets are inlined into the browser bundle and do not create network requests.

The user has confirmed that this project may publicly redistribute the character image. The bitmap asset is not automatically covered by the repository's MIT license; the code remains covered by the repository license.

## Privacy Boundary

The host projection stores only status, turn, tool name, timing, and an error code. It does not store or display:

- User prompts or model responses;
- Tool arguments or tool results;
- API keys, request headers, or full provider error messages;
- Workspace file contents or paths;
- External telemetry identifiers.

## Development

```bash
npm install
npm run verify
```

`verify` runs Host/Web type checks, projection and client derivation tests, the browser module build, and a package-content check.

## Feedback

Please report problems and suggestions through [GitHub Issues](https://github.com/Wanbinyu/dsh-companion/issues).

## License

[MIT](LICENSE)
