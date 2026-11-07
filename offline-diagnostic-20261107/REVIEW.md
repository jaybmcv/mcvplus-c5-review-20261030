# A5 bounded offline diagnostic correction — 2026-11-07

## Disposition
OFFLINE CANDIDATE ONLY. No deployment retry, credential refresh, Vercel request, application edit, request-body correction or budget increase. Historical attempt remains consumed: **29/48 = prerequisite 28/28 + setup 1/12 + cleanup 0/8**. All **8 cleanup requests remain reserved**. Historical accounting caveat and separate qualification limits remain unchanged.

Application SHA: `6166eabb7bfbd2e5b162c6a141731172be6110e2`.
Historical transport and its prior acceptance are frozen. The candidate is isolated here; prior independent acceptance must not be treated as acceptance of these new bytes. No execution acceptance record or start-count guard was changed.

## Exact correction
[transport.diff](transport.diff) is the exact unified transport delta; both before and after files are included. Only a diagnostic helper and the failed-create branch changed. No request construction, accounting, lock, phase limit, refresh, snapshot, polling or cleanup logic changed.

Candidate transport SHA256: `ddcf280d43ef864c03cf82d57b4ee04f7cf3c82ac5cbc82e99b0ea2b267968b6`.

On a failed create response:
- Read at most **16 KiB**, with a **2-second** read deadline; cancel the reader on exit.
- Inspect only JSON `error.code` and `error.message`. Never retain raw response text, response headers, request bodies, environment values, tokens, credential stores or extra response fields.
- Preserve code only from a fixed known-code allowlist; withhold unknown codes.
- If code/message contains any supplied environment value or authorization token, withhold it. Message output is deliberately lossy: a small fixed diagnostic-word/field-name vocabulary, all other tokens redacted, at most **80 tokens / 512 characters**. Unknown words, identifiers, URLs, digits and arbitrary dynamic text are not emitted. Known-value detection precedes truncation.
- Malformed, oversized, missing, unreadable or stalled bodies retain only a fixed body-state indicator and HTTP status.
- Persist the bounded diagnostic in the existing STOPPED result, then throw the original generic HTTP/no-retry error. No raw message is thrown or printed.
- This deliberately sacrifices exact wording for safe persistence. It cannot recover a discarded response, and may withhold an unfamiliar Vercel error entirely.

## Offline schema review
Retained public schema: `deployment-api-schema.json`, originally retrieved **2026-11-02T00:04:08.601Z** from https://openapi.vercel.sh.
SHA256: `b02dd782a9eef520dad3df0ba0cdeede522b2dc9a83e9d074fe5f6622a318d7b`.

[Schema result](schema-review-result.json) validates the **prepared request structure using synthetic environment values**, through the unchanged exact wire constructor. Restricted manifest values are replaced in memory; no credential stores are opened. No prepared request body or real environment values are written. The included review script records the original local evidence paths; it requires the retained restricted manifest and local Ajv install and is not a portable credential-free schema-test harness. The transport mocks *are* portable with Node 24 (`node transport-fixtures.cjs`).

### Confirmed defects / facts
1. Historical failed-create branch asserted on HTTP status before retaining error details. Corrected in this candidate.
2. Cached `POST /v13/deployments` schema has **additionalProperties: false**, and permits neither top-level **env** nor **build**. Ajv reports precisely those two additional-property errors for the prepared structure.
3. Removing those two properties makes the remaining structure pass this cached schema. **That removal is NOT implemented or proposed as semantically equivalent**: it would discard required runtime/build overrides.
4. GitHub `gitSource.repoId` supports **number OR string**. The prepared numeric repo ID is not a defect under this schema. `type`, `ref`, and `repoId` are present; `sha` is supported.
5. Installed Vercel CLI **50.33.1** corroborates `/v13/deployments` and maps preview to omitted `target` (dist/chunks/chunk-DPRZMI7B.js, getApiDeploymentsUrl and postDeployment). The CLI's permissive option spreading is **not** proof that undocumented API fields are supported.
6. The original create HTTP400 remains slot29; no successful deployment ID or URL was recorded.

### Hypotheses / unknowns, not confirmed causes
- The unsupported env/build fields are a plausible rejection cause, **not the recovered Vercel error**. The discarded response cannot be reconstructed.
- This cached schema does not establish the current server's exact behavior or exclude another validation issue.
- Repository access, framework confirmation, inherited project settings or authorization could also affect a future request. No evidence here confirms those as failures; no new roles, credentials or source changes are justified by speculation.
- Existing project environment inheritance is not proof that the required candidate-only overrides are present. Merely stripping env/build is not a safe fix.

## Mocked failure evidence and code review
**17/17 mocked cases PASS**, zero live requests, no real filesystem writes from the transport VM. [Exact test source](transport-fixtures.cjs) and [results](transport-fixtures-result.json) included.

Original 7 cases retained: normal success (16 simulated requests), missing approval (0), held lock (0), redirect (1), network failure (1), final build ERROR (11), fresh alias drift (14).

Added: already-consumed 29-start ledger refuses execution (0); cleanup phase already touched fails before send (0); create400, echoed secrets, malformed body, oversized body, stream error, timeout, unknown code/dynamic text and long-message limit (5 each = 4 fresh mocked reads + **exactly one create**). Failure cases assert one setup debit, 29 total starts, no cleanup debit, STOPPED/not deployed, lock close/unlink, bounded diagnostics and absence of secret sentinels from persisted writes, errors and ledger rows. Synthetic error messages are fixtures, not the original Vercel response; the repoId/string fixture is intentionally synthetic and does not contradict the schema.

Owner review of exact diff: all counters/guards/lock acquisition and release remain byte-identical outside the helper and failed-create branch; no retry path added. All new diagnostic exceptions are swallowed into fixed states and the generic stop error. This is an execution-owner offline review, **not a new independent acceptance or live attestation**. No model reviewer/cloud service was invoked.

[Integrity receipt](integrity-receipt.json) recounts 29 starts and records the ledger hash; original failed transport and wire constructor hashes still match the published historical handoff. The real ledger and restricted manifest are not published.

## Smallest next attempt and remaining blockers — together
**No executable next attempt is authorized or ready.** First resolve the unsupported environment-override mechanism offline, using an authoritative supported deployment route that preserves the required configuration **without** app changes or unapproved shared-setting mutations. Removing env/build alone does not meet that requirement. This is the concrete technical blocker.

Once that is resolved and separately reviewed, the smallest proposed *create* attempt is **one exact preview POST, no automatic retry**, using the same source and safe diagnostic branch. No refresh is included. Local checks must establish credential validity at that time without exposing credentials; if validity cannot be established, stop rather than refresh.

For a guarded attempt with freshness and verification, a possible **maximum 11-request setup-only envelope** is: 4 fresh scoped project/alias reads + 1 create + at most 1 status read + 4 preservation readbacks + 1 anonymous protection probe. Run readbacks/probe only if READY; otherwise stop and report unverified. Failed create consumes just the four reads + one POST. All 8 cleanup requests stay reserved, and no budget increase is proposed. This envelope is a proposal, not an implemented transport.

**Authorization blocker:** the existing no-retry boundary and start-count guard forbid rerun. Prerequisite allocation is exhausted. A future owner authorization would have to explicitly approve one new bounded attempt and use of remaining setup slots for the four prerequisite-like freshness reads (no silent phase transfer); review and bind a new one-shot guard/acceptance to the unchanged ledger. Do not reset 29 used, replenish qualification, or borrow cleanup slots. If a refresh or additional polling is needed, stop and return that concrete dependency rather than spending outside the approved envelope.

Claude: review the exact diff, lossy diagnostic policy, schema errors and proposed envelope. Do not deploy, refresh, sign, activate purchases or assume the schema mismatch establishes the historical rejection cause.
