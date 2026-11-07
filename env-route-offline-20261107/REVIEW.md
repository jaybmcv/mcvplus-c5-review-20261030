# Deployment-specific configuration investigation — HOLD

## Scope and result
Offline investigation only. **The technical blocker is NOT fully resolved.** No corrected, schema-conforming create request is certified or installed. No application, historical request constructor, counted transport, execution acceptance, credential, shared project setting, or ledger was changed. No Vercel requests or CLI execution occurred.

The installed Vercel CLI **50.33.1** explicitly supports runtime `--env` and build-time `--build-env`. Its actual constructors preserve those values as top-level `env` and `build.env` through the final POST. This is stronger evidence than permissive spreading alone, but is not proof of current server acceptance or support for this custom Git-source combination.

The cached public schema rejects those same fields; it also rejects the CLI's `source: "cli"`. Thus the supported CLI feature and cached REST contract disagree. The prior finding remains precisely **a confirmed mismatch against the cached schema**, not proof that Vercel universally disallows deployment overrides, nor an explanation of the discarded HTTP400.

## Exact observed request construction (not a corrected executable request)
The published `cli-excerpts.json` contains byte-exact extracted installed source for:
1. `parseEnv`: parses option names or KEY=VALUE pairs.
2. `addProcessEnv`: resolves name-only options from the child process environment.
3. `Now.create`: constructs per-deployment `env`, `build`, `project`, `name`, `source: "cli"` and forwards to `processDeployment`.
4. `postDeployment`: omits preview target, adds file references, serializes the request and submits it.
5. `upload`: handles missing files, upload, and a subsequent deployment submission.

Configuration-bearing portion, with values deliberately omitted:
```js
// CLI argument parsing:
deploymentEnv = {...parseEnv(localConfig.env), ...parseEnv(flags["--env"])};
deploymentBuildEnv = {...parseEnv(localConfig.build?.env), ...parseEnv(flags["--build-env"])};
// Then name-only options resolve from child process.env.
// Now.create's observed payload:
requestBody = {
  ...nowConfig, env: deploymentEnv, build: {env: deploymentBuildEnv},
  name, project, source: "cli", /* other CLI fields */
};
// postDeployment's observed serialization:
JSON.stringify({...deploymentOptions, files: preparedFiles});
// Preview target is omitted before serialization.
```

The existing custom constructor already has the same configuration-bearing `env/build.env` fields. Renaming, deleting them, adding `source: "cli"`, or relabeling the existing body as CLI-backed is NOT an evidenced correction. **There is no transport/request diff in this follow-up.** PR #2's exact diagnostic diff remains unchanged. New files contain the investigation, extracted public source, and synthetic validation only.

## Focused validation
- `node validate.cjs`: **8/8** extracted-function checks pass. All inputs synthetic. Actual extracted parser/resolver/wrapper/final builder run in mocked VMs. No real auth/config/manifest read; no network facilities provided to those VMs. Values remain in memory; no constructed request body is persisted.
- Proves name-only env resolution without value logging in that resolver; missing values fail; separate runtime/build maps survive serialization; preview target omitted; BUILDING is only a created event, not READY; an isolated failed POST sends once.
- Also proves the isolated POST forwards raw error messages. Full CLI output is therefore NOT an acceptable replacement for PR #2's bounded secret-safe error capture.
- `node schema-check.cjs`: exact frozen schema hash checked; synthetic prepared shape rejected for `env/build`; synthetic minimal CLI shape rejected for `env/build/source`. The shape without overrides passes but is not semantically equivalent. Requires the installed CLI's local Ajv dependency; path documented in script. Cached schema is included in the parent diagnostic package.
- Existing diagnostic `transport-fixtures.cjs`: **17/17 rerun successfully**, retaining no-retry/accounting/exclusive locking/cleanup tests. This follow-up does not constitute independent acceptance.
- First fixture run lacked the mock client context; corrected fixture then passed. First schema expectation omitted the additional CLI `source` conflict; corrected expectation then passed. Neither involved live requests.
- Source hashes and CLI version are in `cli-source-receipt.json`. `probe-installed.cjs` only reads public installed source; it does not import/run the CLI. `validate.cjs` is portable with the published excerpts and Node24.

## CLI route: secret handling and accounting, not approved execution
A possible future wrapper can use name-only `--env NAME` and `--build-env NAME` arguments, with actual values injected through a dedicated child environment, never shell command strings/arguments or generated vercel.json. Only NEXT_PUBLIC names belong in the build override map. Never place runtime secrets there. This resolver logs names, not values; **that does not establish full CLI secret safety**. Raw error events/debug output can contain server text, so default output must not be persisted; only the reviewed bounded diagnostic sink may retain errors. Never pass credential values as CLI flags or emit child environments.

The full CLI was NOT selected:
- Its upload function has two deployment-call sites and a missing_files upload/re-submit path. It is not a guaranteed one-create operation.
- Upload retries and deployment status polling exist; the full request envelope is not established within the remaining setup allowance.
- Full CLI setup/linking, telemetry, identity/project checks, file upload, aliases and project-setting behavior have not been bounded here.
- Local-file deployment differs from the historical exact Git-SHA route; source identity/upload semantics need explicit proof, not an implicit route switch.
- Do not run CLI help/deploy/login/pull/link to investigate online under this authorization.
No complete CLI launch command is proposed as safe or budgeted.

## Confirmed facts versus unknowns
Confirmed: installed option semantics; actual CLI config mapping; exact cached-schema conflicts; upload re-submission path; raw error forwarding; preserved diagnostics and historical budget.
Unknown: current server contract, whether this custom Git-source request accepts those overrides, exact original400 cause, full CLI request count and safety. The discarded original response cannot be reconstructed.
No evidence calls for purchase-code redesign, role/token changes, or shared-setting edits.

## Smallest next attempt and blocker — together
**No live attempt is ready or authorized.** The smallest eventual custom-transport attempt remains **one create POST with no automatic second create**, but only after an authoritative supported contract for deployment overrides plus Git source is established and independently reviewed. Do not approve the prior 11-request envelope based on this work.

Remaining technical blocker: reconcile the installed supported CLI override contract with the cached public REST schema for the exact Git-source route. If that cannot be reconciled, a full CLI alternative requires a separately reviewed, hard-capped counted network boundary, secret-safe output boundary, no automatic re-create, source-identity proof, and exact request envelope before authorization. This investigation is not that implementation.

Smallest next *offline* step: reviewer examines these byte-pinned CLI builders and schema conflict and identifies an authoritative contract/reference for this combination. If fresh vendor documentation/support is required, return that specific dependency rather than issuing unapproved requests. Do not invent a new field or infer support from CLI options alone.

A future single status read returning QUEUED/INITIALIZING/BUILDING means **created, build pending**. Report pending/unverified and stop; never create again or silently poll more.

## Frozen budget
**29/48 consumed** = prerequisite **28/28**, setup **1/12**, cleanup **0/8**. Remaining setup **11**; all **8 cleanup requests reserved**. Historical failed attempt remains consumed. No phase transfer, refresh, budget increase, qualification replenishment, signing, financial execution, purchase activation or worker.
