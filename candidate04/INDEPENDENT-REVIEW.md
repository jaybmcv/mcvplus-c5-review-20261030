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