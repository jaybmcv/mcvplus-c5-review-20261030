# Candidate06-D12 â€” Option A source-only successor

Status: SOURCE ONLY / UNBUILT / UNTESTED / SQL UNEXECUTED / SETUP BLOCKED.

This is a separately named successor to frozen Candidate05 (commit f7d2fe369098589364abcac9a7af7992d90042c2). It is not an installed/staged payload or hosted deployment. Only two executable source files differ: driver/provider-contract.mjs and local-service/provider/readonly-db.mjs each add exactly pg_stat_get_activity(integer) plus an explanatory activity-observation comment. Both 49-signature sets become exactly 50; no existing signature or strict privilege predicate is changed.

The matching proposed SQL is in PROPOSED-SETUP-SQL.md and its byte-exact guarded extracts proposed-sql/PHASE-{A,B,C}.sql. Phase A is unchanged; Phase B adds one exact GRANT; Phase C adds one signature in each array and changes the explicit dependency result to required TRUE. Revision 2 plain SQL "char" quoting and all three unconditional review-only guards are retained. These files MUST NOT be executed under this authorization.

## Evidence and visibility

The requester accepted the activity-visibility tradeoff solely for the dedicated disposable qualification cluster. Direct calls may expose cluster-wide basic metadata and fuller activity of own/accessible-role sessions; ordinary-role masking is not own-session-only authority. The provider shares the grant. Do not use on a shared/old-55432/Alpha/canonical cluster; no unrelated or secret-bearing workloads. No broad monitoring memberships, grant options or wrapper are added.

Driver clients.mjs, cases.mjs, evidence.mjs and all tests are byte-identical to Candidate05. D12 query, actual backend PID/start, row/marker validation and retained Client are preserved. V4a still requires independent sameSession/noReconnect evidence; its cached identity equality alone is not proof. No new campaign probes, retries or attempts.

## Identity and construction

FINAL-SOURCE-MANIFEST.json covers the successor's source/spec/SQL/recipe/provenance files. Baseline manifests are retained explicitly as historical in provenance; the service manifest is resealed for changed provider bytes. App source, app manifest, disabled bindings and inherited appBuildId remain byte-identical; no new app build or run is claimed. Provider bytes now have a NEW service/source identity, not Candidate05's old service identity. Legacy inherited build/seal scripts still contain Candidate05 assumptions; they are historical unchanged source, NOT the sealing authority or instructions to run. The new final manifest and DELIVERY.json are authoritative for THIS static packet.

prepare-provider-bundle.py is the updated construction recipe, read and reviewed as TEXT ONLY, not executed. It preserves the predecessor Windows CRLF text conversion, then adds the exception comment and signature; it uses explicit path ordering for the service manifest and the same disabled binding/current README references. This is a static construction design, not an executed reproducibility result. No dependency installation, build cache, runtime database, secret, usable permit or operational approval is included.

Historical Setup text is retained below a current-disposition banner. Historical predecessor receipts do not attest the changed successor. Independent review scope is this bounded delta, NOT a fresh full-source certification, PostgreSQL parse/runtime PASS, effective IAM audit or Setup approval. See REMAINING-WORK.md for the single consolidated path.

Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged; all 48 attempts preserved as the supplied historical invariant (not a fresh ledger census). No execution authority is inferred from source acceptance.
