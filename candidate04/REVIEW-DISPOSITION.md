# Independent review disposition
Initial review retained verbatim in INDEPENDENT-REVIEW.md; its inspected source retained in review-round1-source/. No historical candidate/evidence was replaced.
Follow-up review: INDEPENDENT-REVIEW-FINAL.md (separate independent invocation; static review only).

| Initial finding | Candidate correction | Offline regression |
|---|---|---|
| Empty halt poisoning | Reject empty/blank reason+receipt; every non-NULL stored halt is terminal | empty halt rejected / existing empty latch blocks |
| Mutable expected/status | Copy+freeze plan and expected list, snapshot adapter; capture/freeze returned status before observation | caller mutation cannot change expected outcome/kind/status |
| Late/aborted admission child spawn | Shared deadline across route initialization, claim, anomaly and handler; pre-run/pre-spawn cancellation/deadline checks; late claim retained | late/uncertain/aborted claim; expired jobs never spawn |
| Cancellation overwritten by IPC | Terminal cancellation/deadline latch prevents queued success overriding outcome | abort then queued valid success stays504 |
| Unbounded collection | Bounded exact-child collection; report504/collection_unverified with workerCollected:false if close unobserved | fake failed-kill/uncollected child bounded; no real child spawned |
| Cleanup masks response | Bounded cleanup helper catches close rejection/nonsettlement and emits sanitized notice, preserves response | cleanup rejection+hang return without throw |
| Post-release storage read loses fence | Check halt/active within completion transaction; no DB reads after commit releases active fence | halt in observer retains active; forbid every postcommit prepare |

Additional improvements: retry authorization provenance stored with reservation; native HTTPS elapsed (not inactivity) deadline; PERSIST/FULL synthetic journal; replay target continuity and non-global singleflight explicitly documented.

No claim the fixtures independently verify live IAM/Windows flush/remote cessation/Next build. Synthetic-only and disabled entrypoint remain deliberate. No operational recovery/unhalt function added.

## Follow-up two findings
Independent follow-up INDEPENDENT-REVIEW-FINAL.md confirmed all seven initial fixes; identified two additional narrow defects. Both corrected:
- Route uses14s initialization/handler deadline, <=100ms cleanup, >=900ms nominal response margin under15s maxDuration.
- Captured adapter is invoked with .call(adapters,context), preserving its method receiver; dedicated offline regression passes.
Current-schema-only synthetic journal compatibility is explicit. Prior journals are retained with no reset/migration/reuse. Independent focused closeout: INDEPENDENT-REVIEW-CLOSEOUT.md.
