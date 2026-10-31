> Historical builder handoff at r5. Final r6 source, build, independent-delta review and normal-host runner results are in CONSOLIDATED-REPORT.md. Earlier identities and restricted-environment failures below are intentionally retained.

# Candidate05 local build result

Local source implementation is complete for parent review. The application remains permanently source-disabled; replay target is disabled/UNBOUND; the driver accepts only SYNTHETIC ledgers/backends and has no execution CLI for actual targets. All 48 actual campaign slots remain unspent. This is local source/build acceptance evidence, not operational qualification or independent final approval.

App build identity: `6c02207ee1e574890848f4d064cae15867fd5559a23df7b49adff5aebfc7d7da`. This is a content SHA-256, not a Git commit. The canonical identity includes immutable run/provider/replay security configuration; only the two self-referential buildId fields are normalized out. App manifest: [app/SOURCE-MANIFEST.json](app/SOURCE-MANIFEST.json). Final build checkout: `D:\OpenClaw-workspace\recovery\mcvplus-candidate05-build-20261031-r5`. Earlier r1-r4 checkouts and failures are retained.

Original transport remains byte-for-byte identical to the read-only purchase baseline; SHA-256 `d25932303f23541f0099bdacabb22973d453c75212c9212d81ec1181d0a2d734`. Only the qualification API route and framework 404 page are built. No purchase composition, purchase API, purchase worker, or recovery module is traced. 777 build-trace files; 747 worker dependency files hash-recorded, none missing. No installation occurred: dependencies were existing dev-only junctions, excluded from deliverables.

| Check | Actual result | Retained evidence |
| --- | --- | --- |
| Copied Candidate04 fixtures | 22/22 | [log](evidence/original22-20261031T214136401136Z.txt) |
| Named cases and review regressions | 31/31 (20 + 11) | [log](evidence/final-fixtures-20261031T221752711533Z.txt) |
| App/worker and installed-client integration | 5/5 | [log](evidence/app-integration-20261031T220948240853Z.txt) |
| Guarded demo emulator conformance | 18/18 top-level groups | [log](evidence/emulator-conformance-20261031T214759763962Z.txt) |
| Optimized full Next build | PASS; compile + type validation + trace | [log](evidence/next-build-20261031T220948383075Z.txt) |
| Built route, loopback only | 12/12 | [log](evidence/built-http-20261031T221135297378Z.txt) |
| Immutable-config build identity mutations | 3/3 | [log](evidence/build-identity-regression-20261031T220852504345Z.txt) |
| Source/build verification | 86/86; 24 JS syntax checks | [log](evidence/source-build-verification-20261031T221135164174Z.txt) |

The 18 emulator groups used `demo-mcv-purchases` and exact loopback configuration in the independent checkout `D:\OpenClaw-workspace\recovery\mcvplus-candidate05-emulator-20261031-1743`. The complete runner and tests were read before launch. Safety guards stayed intact; a loopback-only Node guard prevented hosted sockets/DNS. No production environment was copied. Exact commands, working directories, exit codes, outputs and explicit test environment are recorded in [evidence/COMMANDS.jsonl](evidence/COMMANDS.jsonl). Run these recorded commands through run-local.py when reproducing the restricted Windows loader environment; NODE_OPTIONS symlink flags are dev-only and never passed to the qualification worker.

The named synthetic scenario uses 43 slots because evidenced denials skip later scheduled checkpoints. It does not falsely claim that every one of the 48 possible names was sent. The original copied 22-group suite separately proves 42-primary-plus-six-reserved exhaustion and concurrency. No real campaign journal was opened.

The SDK interface regression executes the pinned real v1 initialize()/GAX createStub path with an inert protobuf stub, including an UNAVAILABLE response that makes exactly one data-RPC attempt. It proves local interface/no-retry behavior only. Mock receipts, retained-token fixtures and emulator transactions do not prove effective IAM, real credential revocation, hosted cold/cache behavior, storage power-loss durability or remote cessation.

## Retained failures and limitation

[FAILURE-INDEX.json](evidence/FAILURE-INDEX.json) indexes all 19 failed wrapped commands with their full original logs. [INITIAL-FAILURES.txt](evidence/INITIAL-FAILURES.txt) and [PREWRAPPER-FAILURES.json](evidence/PREWRAPPER-FAILURES.json) retain earlier tool/read failures. These include ancestor lstat permissions, a BOM decoding error, missing copied source data, a missing pinned CLI search path, a TypeScript declaration gap, a Windows import-URL mistake, inconsistent intermediate synthetic status fixtures, a retained-session return bug, and a second SQLite fixture connection initially using the wrong journal mode. Their fixes and successful later runs do not remove the failed receipts.

The optional guarded runner stress suite is NOT a complete pass. Its first run could not taskkill an owned child; the local copy now stops tracked direct children by their ChildProcess handles. The next run passed all 12 lifecycle modes and two ownership-negative groups, then failed the unresponsive process-tree scenario because Windows tree termination was unavailable in this restricted environment. No global process kill or shared listener cleanup was substituted. Both failures remain. The complete guarded emulator conformance run subsequently passed with cleanup acknowledgement and owned child-close receipts. This environment limitation is not silently promoted to Windows stress acceptance.

## Final workers and cleanup

- PID 52068: `190f62e8-0327-4621-82de-39d8a981f189`, sequence 1, collected=true, SDK identity null (configuration denied before network).
- PID 24808: `4f209849-a977-43f7-9a48-5c0531e4918b`, sequence 1, collected=true, SDK identity null (configuration denied before network).

The built server was task-owned and stopped/collected after each run. [FINAL-CLEANUP.json](evidence/FINAL-CLEANUP.json) contains the final refreshed read-only liveness and bind/close checks for recorded task PIDs and ports; no kill or deletion occurs in that verification. All fixture source, SQLite journals, failed receipts, emulator diagnostics and copied checkouts remain. The emulator retention/owned-handle cleanup changes are listed in [EMULATOR-COPY-DELTAS.md](evidence/EMULATOR-COPY-DELTAS.md).

## Remaining gates and handoff

- Parent owns SETUP-PACKET.md, replay capacity/IAM verification and final independent review; those files were not edited by this builder. Round-one source corrections are addressed in [SOURCE-REVIEW-CLOSURE.md](SOURCE-REVIEW-CLOSURE.md), pending independent confirmation.
- No eligible existing replay database/effective IAM is established. Sealed UNBOUND replay configuration blocks client creation and environment target substitution. No alternate storage design or provisioning was introduced.
- Actual Access/retirement status contracts, supported B8 permission evaluation, named fault capabilities, platform identity, timing and independently correlated remote cessation remain prerequisites. The driver records BLOCKED/UNVERIFIED or durably HALTs when they are missing; it does not turn local socket/child close into remote proof or automate fault/service activation.
- Parent must incorporate the exact pg_backend_pid() grant/inventory requirement from [SETUP-SOURCE-DELTA.md](SETUP-SOURCE-DELTA.md) before any later Setup. No grants or service actions were applied.
- No hosted request, actual permit/key signing, credential issuance/revocation, deployment, operational service activation, approval pin, financial action, Alpha/canonical change, reboot, installation or evidence deletion was performed. Synthetic demo-emulator operations are solely local conformance fixtures.
- A lightweight operator communication draft is saved under comms-awaiting-sync; it is unpublished, media pending and awaiting synchronization. Current write scope excludes the shared communications repository, so no sync/commit/push is claimed.

Recorded 2026-10-31T22:21:44.753078+00:00.
