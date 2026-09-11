# Unreleased Harness compatibility verification

The source fix removes the browser request for the retired
`@deepseek-ai/dsh-client-runtime/client` module. The standalone official Store
engine and its Immer/Zustand implementation are bundled; React and official UI
primitives remain host externals. Store handles remain private to registration.

Verification on Windows, 2026-09-11:

- `npm run verify` passes on locked `0.1.5-rc.2` dependencies.
- `npm run install:baseline && npm run verify` passes with `0.1.1-rc.2` host packages.
- 26 tests include legacy session summaries and the new pending-interaction hook.
- A locally packed archive was installed with `dsh plugin --profile web add`
  into an isolated, empty `DSH_HOME` using Harness `0.1.5-rc.2`.
- Web booted and rendered the companion at desktop and 390 x 844 viewports.
  Companion remained inside the viewport. The host sidebar was open at narrow
  width; its own layout is outside this plugin's scope.
- Billing, Error Lens, Concurrency Meter, Provider Probe and Git Inspect local
  archives were installed alongside it. Provider Probe and Concurrency Meter
  settings rendered and read their initial state successfully.

No API keys or real conversations were used, and no model requests were sent.
This is a boot/layout check; it does not claim a live model turn was exercised.
No Release, npm package or installer was published. Existing downloadable
archives are unchanged and do not contain this fix.
