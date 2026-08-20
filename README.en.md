# dsh-companion

English | [简体中文](README.md)

> Unofficial community plugin. This project is not affiliated with or endorsed by DeepSeek.

A state-aware desktop companion for DeepSeek Harness Web. Instead of looping decorative animation, it reacts to the current session and clearly signals when the user needs to act.

## Features

- Uses the official `shell.overlay` slot without replacing UI components or injecting DOM;
- Distinguishes idle, thinking, tool use, waiting, success, and error states;
- Shows the active tool, turn, elapsed time, and a redacted error code;
- Automatically shows tokens and estimated cost when `dsh-billing` is installed;
- Remembers its dragged position and supports sizes from 80 to 140 px;
- Lets users disable the bubble, metrics, or motion and respects reduced-motion preferences;
- Follows the Harness language in Chinese and English;
- Runs locally and does not read API keys, prompts, or tool results or send telemetry.

## State Mapping

| Companion state | Harness signal | Motion |
| --- | --- | --- |
| Idle | The current session is not running | Gentle breathing |
| Thinking | A Turn is running | Head and eye movement |
| Tool | At least one `tool/call` is unsettled | Working arm and pulsing badge |
| Waiting | Approval, Question, or Plan Review | Amber signal and antenna pulse |
| Success | `turn/end: completed` | Brief celebration, then idle |
| Error | Error, max-tokens, or interrupted | Red signal and brief shake |

Parallel tool calls are tracked by Call ID. Completing one call does not move the companion back to thinking while another call is still active.

## Installation

Requires Node.js `>=22.19` and DeepSeek Harness `0.1.0-rc.6` or later. Development verification targets `0.1.0-rc.8`.

Release archive:

```bash
dsh plugin --profile web add https://github.com/Wanbinyu/dsh-companion/releases/download/v0.1.0/dsh-companion-0.1.0.tgz
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
dsh plugin --profile web add G:\dsh-packages\dsh-companion-0.1.0.tgz
```


Uninstall:

```bash
dsh plugin --profile web remove dsh-companion
```

## Usage

- Drag the companion to move it; the position is saved in the current browser.
- Click the companion to temporarily toggle its status bubble.
- Open the gear menu to change size, animation, and visible information.
- Reset returns it to the bottom-right corner.
- A pending approval, question, or plan review takes precedence over tool animation.

## Optional Billing Integration

The plugin does not depend on `dsh-billing`. When that plugin is present in the Web profile, Companion reads its public, read-only `billing` session projection and shows cumulative tokens and estimated cost. Nothing is shown when the plugin is absent, pricing is unavailable, or no usage has been reported.

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

Position, size, bubble, metrics, and motion are browser preferences persisted through the Harness Store. They are not written to session logs.

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
