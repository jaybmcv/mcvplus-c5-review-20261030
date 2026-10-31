# Independent written review — consolidated retained reports

Three separate read-only Codex reviewer invocations. Reviews are static; author ran the offline tests. Final closeout first; prior reports retained verbatim below for findings/coverage and audit. No operational acceptance inferred.

## Final focused source closeout

**Both remaining concrete findings are closed at source level.** Comparison of current `route.ts` and `operator.mjs` against `review-round2-source/` shows only the two stated source changes, including the deadline comment.

- **Medium — combined route budget: closed.** `route.ts` now sets a 14,000 ms deadline shared by initialization and handling. With the previously reviewed cleanup bound of 100 ms, this leaves 900 ms nominal response margin within `maxDuration=15`. This addresses the identified budget composition defect; timers do not establish a hard scheduling or platform-delivery guarantee.
- **Low — captured adapter receiver: closed.** `operator.mjs` now invokes `dispatchAdapter.call(adapters, …)`, preserving the original method receiver while retaining the captured function and frozen dispatch input.

`SERVICE-INSTALLATION-SPEC.md` explicitly limits fixtures to current-schema synthetic journals and forbids migration, reset or reuse of prior round-one synthetic journals, which remain evidence. The compatibility limitation is therefore explicitly scoped, rather than implying transparent upgrades. Future real-ledger migration still requires a separately reviewed, history-preserving specification.

**Qualified local offline-source acceptance stands; operational acceptance remains pending.** Existing prerequisites remain: reviewed worker/case integration and B7 probes; pinned client behavior without unintended retries, refresh or reconnect; independent cessation evidence and log correlation; effective IAM separation and replay-target continuity; and installation, ACL and journal-durability verification. The no-install, no-hosted-request and no-real-slots constraints remain intact.

This is a static source closeout. No candidate code, tests or network operations were executed; no credentials were read or files edited. Reported test results were not independently verified. Actual process termination, hosted timing and storage durability remain unverified operational prerequisites.

## Follow-up review including original finding dispositions

**Qualified local offline-source acceptance is reasonable.** All seven original findings are addressed by inspection. Two narrow defects remain in the changed source, plus a journal compatibility limitation. Operational acceptance remains pending.

I compared the requested current files with `review-round1-source/` and the initial review. No candidate code or tests were executed; no network, credentials or file mutations were used.

The seven original findings:

1. **Empty halt reason — addressed.** `operator.mjs:20` rejects empty or whitespace reasons and receipts. Admission and completion treat every non-NULL halt as terminal, including an existing empty string.

2. **Mutable dispatch outcomes — addressed.** `operator.mjs:28–29` captures the plan, expected statuses and adapter before awaiting. Lines 48–49 capture status before observation and freeze the observer-facing result.

3. **Admission surviving cancellation/deadline — addressed.** Replay claims and anomaly reporting now have bounded waits. Admission is checked again before runner invocation, and `runChild` checks cancellation and remaining budget before spawning. Client initialization shares the route deadline. Late or uncertain claims remain consumed.

4. **Queued success overwriting cancellation — addressed.** `qualification/handler.mjs:73` latches terminal cancellation; line 77 rejects subsequent messages.

5. **Unbounded child collection — addressed at runner level.** Collection now has a fallback returning `504/collection_unverified` with `workerCollected:false`. It does not claim successful collection when termination remains uncertain. The combined route deadline still has the issue below.

6. **Cleanup rejection replacing a prepared response — addressed.** `closeReplay` catches cleanup failures and bounds nonsettlement; the route uses that helper.

7. **Post-completion storage failure losing the fence — addressed.** Halt and active ownership are checked inside the completion transaction. The former storage read after releasing the active fence is removed.

**New concrete defects:**

- **Medium — The combined route budget omits cleanup and response time.** [route.ts:16](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/route.ts:16) gives the handler a full 15 seconds. Failed collection can consume that deadline at [handler.mjs:69](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/qualification/handler.mjs:69), after which `finally` awaits cleanup for up to another 100 ms. The combined path can therefore exceed the declared `maxDuration=15`, leaving acknowledgement vulnerable to platform cutoff. Reserve cleanup and response time within the outer budget.

- **Low — Capturing the adapter drops its method receiver.** [operator.mjs:29](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/operator.mjs:29) captures the function, and line 47 invokes it without its original receiver. An injected adapter method using `this` previously worked; it now throws after reservation, consuming the slot and halting. Preserve the receiver when invoking the captured function. The supplied factory adapters use closures and are unaffected.

**Compatibility limitation:** The new authorization columns are created without migrating existing tables (`operator.mjs:15,42`). Reopening a round-one journal therefore fails on insertion before transport. This fails closed, but acceptance should explicitly cover current-schema journals rather than imply transparent journal upgrades.

The regression source contains useful assertions for the original failures, including fake child lifecycle events and cleanup nonsettlement. It does not establish real process-termination behavior or exercise the combined route budget. I have not independently verified the reported test results.

Acceptance is reasonable for the intentionally disabled, synthetic-only artifact with these exceptions recorded. Before activation, resolve the deadline composition and retain the existing prerequisites: reviewed worker/case integration and B7 probes; pinned client behavior without unintended retries, refresh or reconnect; independent cessation and log correlation; effective IAM separation and replay-target continuity; and installation, ACL and journal-durability verification. The no-install, no-hosted-request and no-real-slots constraints remain intact.

## Initial independent review

**Verdict: the local implementation is not yet complete within its offline boundary.** The journal and replay scaffolding address important failure modes, but several source defects remain. Operational readiness is separately blocked by design: the route is disabled, the binding is incomplete, and installation prerequisites remain unverified.

This was a static review. I read the requested files without executing candidate code/tests, accessing the network, reading credentials, or changing files. Fixture coverage below refers to source assertions, not independently verified test results.

1. **Medium — An empty halt reason permanently defeats the halt latch.**  
   [operator.mjs:20](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/operator.mjs:20), checks at lines 30 and 54.  
   `halt('')` stores an empty string, which dispatch treats as false. Later nonempty halt calls cannot repair it because `COALESCE` preserves that first empty value. Thus even a subsequent legitimate anomaly halt permits dispatch. Validate the reason and treat every non-NULL halt value as terminal. The fixture only uses a nonempty reason.

2. **Medium — Expected outcomes and recorded transport status remain mutable after dispatch.**  
   [operator.mjs:44](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/operator.mjs:44), lines 44–48.  
   While transport or observation is pending, the caller can change `plan.expected`, allowing an originally unexpected status to complete without halting. `plan.kind` is also reread after transport, and `result.status` is read only after the observer runs, so observation can alter the recorded outcome. Snapshot validated dispatch fields before reservation and capture transport status before calling the observer.

3. **Medium — Admission can outlive cancellation/deadline and still create a child.**  
   [qualification/handler.mjs:19](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/qualification/handler.mjs:19), lines 19, 22, 28, 41 and 58.  
   Replay claims and anomaly reporting have no enforced deadline or cancellation handling. A late successful claim still invokes the runner; `runChild` spawns before checking whether the request is already aborted or its budget exhausted. The default runner then withholds the IPC job, so this establishes unnecessary child creation—not a demonstrated remote read. Route client initialization also occurs before the handler starts its budget. Admission needs a shared deadline and a pre-spawn check; uncertain claims must remain consumed.

4. **Medium — Cancellation can be overwritten by a queued success message.**  
   [qualification/handler.mjs:48](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/qualification/handler.mjs:48), lines 48–53.  
   Abort sets `504/cancelled` and requests termination. Before `close`, an already-queued valid IPC success can replace that result with `200/qualified` while time remains. There is no terminal cancellation latch. Preserve cancellation while collecting subsequent evidence. The early termination timer has the same overwrite path, although accepting completion before the nominal deadline may be intentional policy.

5. **Medium — Child collection has no enforced completion bound.**  
   [qualification/handler.mjs:47](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/qualification/handler.mjs:47), lines 47–55.  
   The kill result is unchecked, and the promise resolves only on `close`. Failed or delayed termination can leave it pending until platform termination. Reserving 750 ms does not establish collection within that interval. A bounded uncertain-collection outcome is needed; it must not report successful collection. The supplied fixtures inject `run` and never exercise this lifecycle.

6. **Low — Cleanup failure can discard an otherwise prepared response.**  
   [route.ts:23](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/route.ts:23).  
   `replay.close()` is awaited in `finally`, outside the catch. A rejection overrides the prepared response even after a completed worker, creating avoidable acknowledgement ambiguity. Consumption remains protected, but the caller receives an infrastructure failure instead of the available result.

7. **Low — A combined post-completion storage failure can lose the terminal fence.**  
   [operator.mjs:49](D:/OpenClaw-workspace/artifacts/mcvplus-bounded-candidate04-20261031/operator.mjs:49), lines 49–59.  
   Completion commits `active=NULL` before the final halt read. If that read fails and the subsequent halt write also fails, reopening can find neither active nor halt. The comment that the pre-send active row always remains protective is therefore too broad. Cessation was already established, so this is not an overlapping-operation finding, but it weakens the claimed terminal treatment of persistence errors.

**Concurrency, crashes and retries:** For cooperating callers sharing one intact journal, transactionally reserving the slot and active owner before transport is sound. Active ownership spans transport and observation; interrupted or uncertain dispatches retain consumption and block further sends. Fixed reserved slots stay separate, and primary retries consume additional primary capacity. Synthetic retry authorization is only a prefix check, without retained authorization provenance. The crash fixture exits after adapter entry; it does not establish power-loss durability or every commit-boundary outcome.

**Pre-child replay:** The ordering is correct: an acknowledged claim precedes the runner, and duplicate, failed or uncertain claims do not start it. Claims are never refunded. However, uniqueness is per `(runId, slot)`, not campaign-wide exclusion: different unused slots can run concurrently. Replacement-deployment continuity also depends on retaining the same replay database. These are limitations to preserve explicitly; local contention and fake-store fixtures do not establish hosted single-flight behavior.

**Credential separation and operator halt:** Explicit replay credentials and the child environment allowlist provide useful separation in source. Different email/key strings do not prove effective IAM isolation, as the credential document correctly acknowledges. A normal nonempty operator halt blocks subsequent dispatches; it does not cancel remote work already admitted. `workerCollected:true` establishes local child closure, not provider/SQL/Firestore cessation. Independent evidence remains necessary. Gate and binding denials bypass the replay anomaly logger, so independent ingress records must cover those events and fresh unsolicited valid traffic too.

**Offline-source readiness remains partial.** The fixtures omit mutable inputs, empty halt poisoning, delayed claims, actual child lifecycle, route cleanup, and real client behavior. The synthetic filename/run guards constrain ledger admission; they do not sandbox injected transports. `httpsOnce` remains capable of real HTTPS, and its socket inactivity timeout is not an elapsed deadline.

**Operational readiness remains blocked.** Outstanding integration includes the actual worker and case adapters, B7 transactional probes, cessation/log correlation, pinned runtime/client behavior, nonrefreshing direct credentials, and immutable replay-target continuity. Setup must establish approved existing replay capacity and database IAM separation, collision checks, service identities/ACLs, protected executable/configuration paths, PostgreSQL loading confinement, journal storage durability, storage limits where required, and partial-Setup containment. The stopped/disabled end state and prohibition on Setup smoke requests remain requirements, not verified machine state.

The intentionally disabled entrypoint and missing operational integration are not authentication bypass findings. The local defects can be addressed in the existing components without introducing a broker, checker or supervisor.

