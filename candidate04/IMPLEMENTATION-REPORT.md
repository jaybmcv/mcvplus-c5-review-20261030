# MCV+ Candidate04 — consolidated bounded local implementation report
Date: 2026-10-31. Owner: Henri. Operator: Biggunn.
Status: OFFLINE CANDIDATE; NOT Setup-ready, staged, installed or deployed.
Independent review chain: INDEPENDENT-REVIEW.md (initial), INDEPENDENT-REVIEW-FINAL.md (follow-up), INDEPENDENT-REVIEW-CLOSEOUT.md (focused final corrections). Source/test disposition: REVIEW-DISPOSITION.md.

## Approved scope and preserved state
48 authorized campaign attempts:42 primary +6 reserved, not a universal network-request ceiling. Every named HTTP/direct SDK/DB attempt consumes before sending; denials, failures and authorized retries count; unknowns remain consumed. Expected fanout is inventoried separately.
This is a separate source overlay at D:\OpenClaw-workspace\artifacts\mcvplus-bounded-candidate04-20261031. Candidate03, previous candidates, original runs and evidence were not edited. Five historical source references are hash-checked unchanged in evidence/CHECKS.json; no claim of a comprehensive host re-verification.
No PG-R1 historical campaign rerun, actual ledger, real slot, usable permit, approval pin, real credential change, installation, operational staging, deployment, hosted project request, paid resource, financial activity, reboot or deletion. Final candidate uses PERSIST rollback journals and retains all synthetic fixture/evidence files; no cleanup/deletion script runs.
Purchases OFF, recovery DISARMED, Alpha/canonical unchanged: preserved constraints, not freshly probed live state.

## Implementation
| Area | Candidate files | Behavior / limit |
|---|---|---|
| One case-aware path | operator.mjs | Fixed primary case IDs + designated reserved43–48. Built-in SQLite transaction FULL commit records spent slot + active owner before transport. HTTP/SDK/DB invoke through same dispatch method. Concurrent callers reject while active; no queue/retry. |
| Status / accounting | operator.mjs, adapters.mjs | Expected HTTP/SQLSTATE statuses explicit per named plan. Unexpected status/throw/missing or mismatched independent cessation => durable HALT. Explicit authorized primary retry consumes fresh primary slot; fixed reserved cases cannot reuse their slot. |
| Crash/ack/recovery | operator.mjs | Crash-held active row prevents next send. Post-send persistence failure retains active consumption. recoveryReport is inspection only, resumeAllowed:false; no reset/refund/auto-clear. Actual power-loss durability still depends on supported Windows VFS/storage and protected journal/sidecars. |
| Replay before child | replay.mjs, qualification/handler.mjs | Atomic Firestore createDocument(runId,slot), retry:null, before runChild. Duplicate409/store uncertainty503; no worker. Immutable record retained after failed/unknown child. Separate database/principal/key required. |
| Credential separation | replay.mjs, handler child allowlist, CREDENTIAL-PLACEMENT.md | Explicit replay credentials only, no ADC; key/email differ from qualification reader; same qualification database refused. Replay credentials excluded from child. Effective IAM separation remains later Setup evidence, not established by string checks. |
| Disabled route | route.ts | Static candidate activation false, empty public-key base; no private key or usable permit. Full app packaging/integration is a separate reviewed change before activation; this overlay is not a standalone installable application. |
| Conventional services | SERVICE-INSTALLATION-SPEC.md | Existing SCM + existing wrapper where required, separate identities/state, protected code/config/control/credentials, PG loading and actual SQL/IAM boundary decisions. No general checker/supervisor/broker. |

## Evidence and verification
Initial synthetic run:12/12 fixture groups passed. Revised candidate including independent-review regressions:22/22 offline fixture groups passed. Retained run and syntax results: evidence/offline-tests.txt and evidence/CHECKS.json. Tests use fake in-memory Firestore clients, fake HTTP/SDK/DB transports and fresh SYNTHETIC SQLite journals under synthetic/. Only fixture child processes run; no service or server starts.
Checks parse candidate JS and disabled TypeScript route with installed Node24.18.0. This is NOT a full Next application build, SDK installation, Firestore integration test, hardware power-loss test, Windows ACL/SCM acceptance, remote cancellation proof or historical campaign qualification.
Fixtures cover42+6 exhaustion, same/independent-process contention, process-death persistence, denial/fresh retry, uncertainty/halt, unexpected statuses/cessation mismatch, persistence faults before/after send, all3dispatch kinds, explicit anomaly halt, atomic duplicate claims, unknown replay writes and pre-child refusal.
Historical full application/provider fixtures were not executed.

## Deliberately bounded integration limits
- The actual campaign-specific B7 BEGIN/one statement/ROLLBACK and retained issued-token SDK/fresh-login DB probes are NOT replaced by a generic query loop. Generic adapters expose single-method calls; review real clients for no reconnect/auth refresh/data retries before campaign execution. No claim that arbitrary injected clients cannot retry internally.
- Platform structured replay anomaly logging exists; attended operator must inspect independent ingress/platform records before every dispatch and persist HALT on unplanned activity. No claim of automatic cross-machine halt or universal request ceiling.
- Replay SDK dependency is declared/pinned, not installed or initialized. Existing eligible replay database and database-scoped create-only IAM must be available on no-additional-paid resources. If not, hosted execution remains blocked; no new service is proposed.
- Candidate operator accepts synthetic filenames/run IDs only. Real-ledger activation, exact actual target/plan manifest and deployment packaging remain separately reviewed integration. This fence is intentional under no-operational-staging authorization, not an assertion that synthetic fixtures qualify production.

## Remaining prerequisites
| Prerequisite | Owner | Evidence needed | Blocks |
|---|---|---|---|
| Review any residual source findings | Henri + independent reviewer | Resolved disposition and exact final candidate hashes | source acceptance |
| Exact service Setup scope and partial containment authorization | Biggunn + Windows administrator | Revised conventional service spec; target occupancy; exact identities/ACLs/loading/storage decisions; bounded checks; disabled end state | Setup |
| Supported separate replay storage | platform owner | Existing eligible database/no paid capacity, effective DB-scoped create-only writer, no reader write grants, no qualification data write authority | replay Setup and hosted execution |
| Protected journal durability | Windows administrator | Stable local storage honoring flushes, protected parent/SQLite sidecars, effective identity ACLs, no rollback/reset, final supported runtime pin | operator activation / execution |
| Actual driver/adapters and independent evidence | Henri + reviewer/operator | Reviewed named-case/status/fanout mapping, no retry/refresh/reconnect, exact-session cessation/log correlation, retained-client behavior, bounded containment | execution |
| Disabled candidate/app packaging and exact build binding | Henri + platform owner | Separately reviewed actual application integration/build; disabled configuration; no usable permit during Setup | app Setup / execution |
| Vercel access, kept separate | Vercel team owner | Test team/project access/protection/logging; recorded IDs are not access proof | Vercel Setup / hosted execution |
| Later campaign/credential containment authorization | Biggunn | Named test activation, exact budget/plan, revocation/cleanup and emergency containment; no automatic recovery | execution |

## Communications
Local private opportunity note retained in COMMUNICATION-OPPORTUNITY-LOCAL.md. No public copy, message, repository sync or hosted request; awaiting separately authorized synchronization.

## Consolidated review result
Initial independent read-only review found seven local defects; follow-up confirmed all seven closed and identified two additional narrow issues. All nine corrected in candidate source.22/22 synthetic offline fixture groups and11syntax checks pass;5historical source hashes unchanged. See REVIEW-DISPOSITION.md for each finding, correction and regression. The original written reviews/source snapshots are retained rather than overwritten.
Independent review is static source review, not an independent test rerun. The focused closeout separately assesses final route-time-budget/adapter-receiver corrections. Exact final source/spec hashes in SOURCE-MANIFEST.json.
The separate candidate implements the authorized generic admission path and replay boundary, not the full operational qualification campaign. It remains disabled/synthetic-only. Named campaign probes, production packaging, actual IAM/service/journal evidence, independent log/cessation operation and separate Vercel access remain prerequisites listed above.
Nothing automatically continues after closeout. No operational installer, worker/server/browser session or cleanup job was started. No source-only acceptance authorizes Setup or campaign execution.

## Final independent closeout
Both follow-up findings are closed at source level. Reviewer verdict: qualified local offline-source acceptance stands; operational acceptance remains pending. All nine concrete source findings addressed;22/22offlinefixturegroups,11syntaxchecks,5historicalreferencesunchanged;14finalsource/specfileshashverified. Complete review chain collected; no active reviewer or task server/browser remains. See INDEPENDENT-REVIEW-CONSOLIDATED.md for verbatim independent written reviews. No Setup, actual campaign execution or operational activation authorized/inferred.
