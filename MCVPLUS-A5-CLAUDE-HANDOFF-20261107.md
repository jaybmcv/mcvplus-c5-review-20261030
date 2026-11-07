# Claude handoff: MCV+ A5 preview attempt — 2026-11-07

## Read this first
The latest preview attempt is STOPPED, not deployed or verified. Vercel rejected the single preview-create request with HTTP 400 at 2026-11-07T20:12:11.501Z. No successful deployment, deployment ID or preview URL was returned/recorded. No retry followed. This update supersedes earlier "pre-deployment / acceptance pending" updates.

This is a credential-free publication of the execution handoff for Claude and human review. It does not grant permission to retry, deploy, sign, activate purchases, or execute financial operations. No running MCV+ worker remains.

## Note for Claude
Please review where we stand and recommend the smallest next diagnostic step:
1. Distinguish accepted local preparation from failed cloud execution. Do not describe this as a successful preview.
2. The create transport rejected non-2xx status before retaining the error body. The exact Vercel validation code/message is therefore UNKNOWN. Do not invent a root cause or assume new credentials, roles, source edits, or budget are needed.
3. Any proposed transport correction should retain bounded, secret-safe non-2xx response diagnostics without automatic retry. Review this offline; do not issue a cloud request.
4. Preserve the existing ledger, per-phase limits, original-used count, exclusive execution ownership, and all eight cleanup requests. The existing start-count guards deliberately prevent rerunning the transport.
5. Return an evidence-backed assessment and concrete diagnostic/re-attempt proposal for the owner to resolve the existing no-retry boundary. This handoff is not authorization to cross it.
6. Keep approval signing/install, runtime attestation, activation and any fake-funded attended purchase separate from setup.

## Source and configuration
Exact reviewed application source remains unchanged:
6166eabb7bfbd2e5b162c6a141731172be6110e2

This SHA was identified before cloud execution. The clean source checkout and all five referenced credential-file hashes passed local verification. No application source edits or application source SHA change occurred. The GitHub commit containing this document is a documentation commit in the review-only repository, not a new application source SHA.

The configuration correction was confined to the candidate deployment manifest:
MCV_PURCHASE_TEST_UIDS was bare text; stagingConfig uses JSON.parse and requires a UID array. It was changed to JSON.stringify([selectedUid]), a one-element JSON array. The selected real UID and restricted manifest are intentionally not published. The original manifest was retained unchanged.
Corrected candidate manifest SHA-256: f2e7ce69f663ffdf16696ba8ff37a8d65fddff67daceffe2567946c484cd7d72.

Legacy rejection was reproduced; the corrected actual parser passes with synthetic platform metadata. Full offline staging fixtures passed 29 output groups; current source/config preflight PASS. These are local checks, not runtime attestation.

## Four independent-review findings and resolutions
| Finding | Resolution |
| --- | --- |
| Request-count race | Shared exclusive EXECUTION-A5.lock covers refresh and deployment; held-lock regression sends zero requests. |
| Non-atomic credential rewrite | Same-directory flushed temporary file plus atomic rename replace only the original credential store; before-write equality guards remain. |
| Final poll ERROR/CANCELED mislabeled WAITING | Terminal-state check also runs after the final poll; terminal-error regression stops correctly. |
| Stale alias baseline misses newly preexisting aliases | Fresh scoped project/config/environment and complete alias snapshots for purchase and Alpha precede creation; regression detects aliases absent from the historical snapshot. |

Final independent review of the current transport: ACCEPT. Exact reviewed script hashes matched before execution. Reviewer could not access the optional external ledger; execution owner independently recounted it. Acceptance did not predict or establish deployment success.

Reviewed scripts, SHA-256:
- deploy-counted.cjs: fda8e17125d248009b7c071023d041fa6a2a5f3edd5a712247de47c0026ec83b
- refresh-once.cjs: 70b8cf13bea405a9dc82e105072cd2fd3f5890bbd6de5984669a479637f1adf7
- create-wire.cjs: c5e8d23cc9c9c53ce5d99f78aa676439e6be506c100abfbee6986f742f81329c
- verify-source-inputs.cjs: c5191551088897c18bba24f2feae03c96bb26de88cb9d454693abb8c5e62d091

## Transport mock evidence
7/7 pass, zero live requests made by the regression suite. Request counts below are simulated, NOT ledger usage:
| Case | Simulated requests | Result |
| --- | ---: | --- |
| normal | 16 | PASS |
| unapproved | 0 | PASS |
| locked | 0 | PASS |
| redirect | 1 | PASS |
| network-failure | 1 | PASS |
| final-build-error | 11 | PASS |
| alias-drift | 14 | PASS |

## Live execution actually observed
| Ledger slot | Operation | Result |
| --- | --- | --- |
| 24 | Same-account OAuth refresh | HTTP 200; original credential store atomically updated, token not exposed |
| 25–26 | Fresh purchase project/config/environment and alias reads | HTTP 200; all-deployment login protection required and checked before create |
| 27–28 | Fresh Alpha project and alias reads | HTTP 200 |
| 29 | One preview-only POST /v13/deployments | HTTP 400; STOP, no retry |

No post-create status, protection or readback requests ran. No claim of before/after equality or protection on a newly created preview is possible. No successful preview was confirmed. No task-owned deployment ID is available for cleanup; zero cleanup requests consumed.

## Binding A5 accounting
Owner approved 48 metered supplemental requests TOTAL INCLUDING the original 23 used. Amendment retained the same ledger; no reset.
| Phase | Limit | Used | Remaining |
| --- | ---: | ---: | ---: |
| Prerequisite | 28 | 28 | 0 |
| Setup | 12 | 1 | 11 |
| Cleanup (reserved) | 8 | 0 | 8 |
| Total | 48 | 29 | 19 |

This execution used six: one refresh, four fresh snapshot reads, one create POST.
No unused-phase transfer. Separate qualification campaign NOT replenished.
Historical original four plus unknown/unmetered browser accounting remains unchanged: 48 describes the amended metered supplemental envelope, not certified lifetime traffic.
No budget increase is currently requested.

## Still unproven / excluded
- Specific reason for the HTTP 400.
- Successful new deployment and its runtime identity, generated URL, protection, resource bindings and post-deployment preservation.
- Valid signed activation approval and later purchase gates.
- No approval signing/install, financial execution, purchase activation, service startup, alias mutation or shared-setting mutation followed this attempt.
- No alternate principal or retry used.

## Evidence custody and publication limits
The execution owner retains the original A5-EXECUTION-HANDOFF.md, owner authorization, binding accounting amendment, complete supplemental ledger, independent acceptance and hash record, source/config preflight, offline and mock results, refresh result, fresh baseline, and deployment result in the local readiness evidence folder. These local artifacts are not all accessible to Claude through this repository.

Only this credential-free status/handoff is published here. Restricted configuration, real UID, tokens, credential stores, raw project/environment snapshots and internal authorization identifiers are deliberately excluded. The summary does not substitute for inspecting exact transport code if Claude is asked to approve a future code change.

Earlier checkpoint source/review context:
https://github.com/jaybmcv/mcvplus-c5-review-20261030/issues/1

## Current disposition
STOPPED under the existing no-retry rule. Review and offline diagnosis may be proposed; do not rerun the guarded transport or spend cloud requests from this note.
