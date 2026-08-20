# dsh-companion Development Notes

## Purpose

Build a small, local, state-aware companion overlay for DeepSeek Harness Web. It must provide useful task status, not just decorative animation.

## Compatibility

- Keep peer dependency compatibility at DeepSeek Harness `0.1.0-rc.6` or newer.
- Verify development against the current pinned `rc.8` packages.
- Use the official `shell.overlay`, session projection, locale, and Store APIs.
- Do not query or mutate Harness DOM outside the registered Slot component.
- Keep `@deepseek-ai/dsh-client-runtime/client` external in the browser bundle because its published JS is a ModuleLoader wrapper.

## Privacy

- Never read API keys, prompts, model responses, tool arguments, tool results, workspace paths, or file contents.
- The companion projection may retain only status, turn, tool name, timing, and a short error code.
- Do not add telemetry or network calls.

## Verification

Run `npm run verify` before committing. It must pass Host/Web type checks, all tests, client bundling, and package-content validation.

For a real-host check, install a packed archive into the Web profile and verify desktop plus a narrow mobile viewport. On `dsh 0.1.0-rc.7`, use a package path without spaces.
