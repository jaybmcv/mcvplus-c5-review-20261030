# Candidate05 — bounded D12 resolution proposal
Date: 2026-10-31 (America/Toronto)
Author/reviewer: Henri
Status: DOCUMENT ONLY / PROPOSED / NOT APPROVED / NOT IMPLEMENTED / NOT TESTED

## 1. Decision requested for document review
Recommend **Option A: one exact function-permission amendment in a separately named successor revision**, preserving the existing D12 query and retained-connection evidence:
`pg_catalog.pg_stat_get_activity(integer)`.

The present 49-signature set would become exactly 50, with this sole addition. BOTH provider/driver source allowlists and the proposed SQL must change together in that future revision. A SQL grant alone would still fail the frozen excess-function predicates.

This proposal does not amend Candidate05 or approve even that single grant. Candidate05 remains frozen at commit `f7d2fe369098589364abcac9a7af7992d90042c2`, manifest SHA256 `7c2fca43299c2f70886335b33228829ba9f7fdf4472bf1f10f7c3b1a7b4d888a`. Revision 2 document corrections remain accepted at SHA256 `43b095e088f6dd81a1f62ffa52863ee23aacdb5901a02616676a2d6e641acbd6`; its 49-function SQL remains incompatible with D12.

No implementation, candidate import/execution, compilation, tests, PostgreSQL parsing/connection/SQL execution, Setup, staging, installation, provisioning, deployment, API/billing enablement, credential issuance or IAM changes occurred. Public source/document reads and document preparation only. Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged; all 48 actual attempts preserved as the supplied historical invariant, not a new ledger census.

## 2. Exact incompatibility and options

Frozen `driver/clients.mjs:64`:
```sql
SELECT pg_backend_pid() AS pid, backend_start, usename AS role,
       datname AS database, application_name, client_addr::text AS client
FROM pg_stat_activity
WHERE pid=pg_backend_pid()
```

PostgreSQL REL_18_4 defines the view over `pg_stat_get_activity(NULL)`, joined to database/role catalogs. The function is missing from both frozen allowlists. Adding only the already-allowed `pg_backend_pid()` does not solve this.

| Option | Smallest change | Evidence / visibility | Recommendation |
|---|---|---|---|
| A. Keep query; add exact activity function | One new signature in both source sets and SQL; 49 → 50 | Preserves backend_start and existing row shape, D12/V4a path and statement budget. Expands ordinary-role activity visibility as detailed below. | **Recommend**, only if that visibility is explicitly accepted for the dedicated disposable qualification cluster. |
| B. Direct self-PID activity query | Replace view query with direct `pg_stat_get_activity(pg_backend_pid())` projection; still needs the same one-function grant and both allowlist amendments | Can preserve backend_start; calling with self PID reduces the fixed query's result, NOT the caller's granted authority. No smaller permission scope than A; adds unnecessary query/validator review. | Do not select for this bounded fix. |
| C. Existing-getter-only query | PID, current_user/current_database and current_setting('application_name') use existing authority; other desired getters are not all in the frozen set | Cannot produce the server's actual backend_start with the frozen 49 functions. Dropping it, inventing it from local connect time, reusing a cached value or a nonce is not equivalent evidence. | Reject as a drop-in resolution. Requires a separate provenance redesign. |

A precise candidate for Option B, **not selected and not approved**, would be:
```sql
SELECT a.pid, a.backend_start, current_user AS role,
       current_database() AS database, a.application_name,
       a.client_addr::text AS client
FROM pg_catalog.pg_stat_get_activity(pg_catalog.pg_backend_pid()) AS a
```
Here role/database identify the executing session rather than independently joined activity OIDs/names. The self-PID argument binds the activity row to that session. This remains subject to later signature/parser/runtime and independent provenance review. It offers no permission reduction and is not part of the recommended delta.

Other per-backend statistics getters require additional grants and careful backend-ID-versus-PID mapping; they are not a zero-grant shortcut. No SECURITY DEFINER wrapper, broad monitoring role, grant-on-error, view rewrite or silent fallback is proposed. If own-session-only SQL authority is a non-negotiable requirement, **reject A and leave D12 blocked** pending a separately scoped design; a query filter cannot enforce that requirement.

## 3. Visibility implications of Option A
This is a read-only **activity-observation exception**, not a claim that the added routine is a pure/immutable function. The existing symbol name `PURE_FUNCTIONS` must not disguise that semantic distinction. Do not rename/refactor that symbol in this narrow change; annotate the exception.

The grant permits direct invocation with another PID or NULL (all backends). The fixed D12 WHERE clause is not an ACL, and EXECUTE grants do not restrict argument values or output columns. PostgreSQL's function itself enforces ordinary-role visibility:
- Across the cluster, including sessions in other databases: basic backend metadata such as PID, database/user OIDs, application name and backend transaction IDs/xmin can be exposed. Through permitted catalogs/views, some OIDs can be resolved to names.
- For the caller's own sessions and sessions of roles whose privileges it has: fuller activity can include query text, state, timestamps including backend_start, client/network information, waits and transport/authentication metadata where available.
- For other unrelated roles without statistics authority: sensitive fields are masked/NULL and query text is reported as insufficient privilege. This is not blanket secrecy of all other-session metadata.
- Do not grant `pg_monitor`, `pg_read_all_stats`, superuser, role memberships, SET-role routes, ownership or grant options. Such grants would materially expand visibility beyond this proposal.
- It does not itself authorize fixture writes, sequence use, cancellation/termination, filesystem access, or new role/DB authority. Those existing denials must remain separately established.
- The provider shares the qualification role's allowance; it gains the same function authority even though its fixed workload does not need D12. No new driver-only identity/role split is proposed.

This is acceptable only as an explicitly reviewed tradeoff on the NEW isolated cluster, never the old 55432 cluster or a shared/Alpha/canonical cluster. Use no unrelated workloads or secret-bearing SQL under the qualification role. Isolation reduces exposure; it does not make the grant self-session-only or protect against a malicious PostgreSQL OS service/administrator. Full effective role/ACL/default evidence remains necessary.

## 4. How same-connection identity evidence is preserved
Option A changes **no D12 or V4a executable logic**:
1. `driver/clients.mjs:66–78`: one explicit pg.Client, fixed loopback target, application name and read-only default; no Pool, connection URL/ADC fallback, reconnect or retry.
2. D12 stays exactly `db-login → db-session-identity → db-marker` (`driver/cases.mjs:42`). Identity query must return exactly one row with integer PID, nonempty server backend_start, expected role/database/application_name and client 127.0.0.1. The marker must match the dedicated resource.
3. `clients.mjs:145–148` freezes the returned identity and retains that actual Client only after successful identity and marker validation. PID plus server start time avoids treating PID reuse alone as continuity.
4. V4a uses that retained Client, not a new connection. `driver/evidence.mjs:63` requires independent sameSession and noReconnect proof and exact equality with the D12 identity.
5. **Important limit:** V4a carries the stored D12 identity; it does not independently re-query backend_start after revocation. Equal cached JSON is not by itself proof of continuity. Preserve the independent observer's actual connection/backend correlation and no-reconnect evidence, plus the concrete Client lifecycle and failure behavior. Server-side termination may make re-query impossible; do not replace missing independent evidence with cached equality.
6. Keep complete original fanout/accounting, revocation schedule, transport-vs-semantic classification and cessation requirements. No extra campaign identity probe, slot, retry or attempt is added by A. If independent continuity cannot be established within those bounds, leave the relevant result UNVERIFIED/BLOCKED.

The amendment repairs a static dependency mismatch. It does not certify session revocation, hosted execution, or compatibility against a live PostgreSQL installation.

## 5. Exact future change list — specification only
Apply none of this to Candidate05. A later explicitly authorized successor must carry a new identity, review and manifest.

### Source
| File / anchor | Required change in successor |
|---|---|
| `driver/provider-contract.mjs`, exported `PURE_FUNCTIONS` | Add exactly one JS string `'pg_stat_get_activity(integer)'`; retain all existing 49 entries byte-semantically. Stored regprocedure text is unqualified, as existing schema-qualified predicate already requires pg_catalog. Annotate this as activity-observation exception, not immutable/pure authority. |
| `local-service/provider/readonly-db.mjs`, exported `PURE_FUNCTIONS` | Identical single-signature addition and comment. Do not relax `PRIVILEGE_SQL`, schema checks or excess-function predicate. |
| `driver/clients.mjs`, `driver/cases.mjs`, `driver/evidence.mjs` | **No executable change** for A. In particular preserve SESSION_SQL, D12 row checks/retention and V4a same-session/no-reconnect proof. |
| `tests/review-closures.test.mjs`, existing D12 dependency assertion; `tests/provider-bundle.test.mjs`, set-equality assertion | Future authorized verification must cover the missing activity dependency as well as pg_backend_pid(), exact set equality and sole 49→50 delta. No tests edited or run now. |
| `local-service/SOURCE-MANIFEST.json`, `FINAL-SOURCE-MANIFEST.json` and successor package/delivery receipts | Recompute changed provider/driver/document hashes and the manifest/package identity; archive predecessor unchanged. Do not copy Candidate05 hashes as attestations for modified files. |
| Provider-bundle construction recipe (`prepare-provider-bundle.py` in retained preparation provenance) | A successor must reproducibly emit the same amended provider allowance, not overwrite it with the old 49-set. Preserve imported historical input packet; update successor recipe/provenance only when implementation is authorized. |

No application route, purchase implementation, replay target/run binding, credential flow or build activation change is part of A. The app source/build can remain unchanged if actually byte-identical. Any provider/driver/package identity that incorporates changed files must be recomputed; propagate only genuine changed dependencies, without enabling bindings or making a usable permit. Exact successor package pins require later implementation review, not invented hashes here.

### Proposed SQL revision (three existing phases)
- **Phase A:** no semantic change; preserve unconditional review-only guard, dedicated-cluster/role setup and NOLOGIN/password NULL.
- **Phase B:** retain its guard and strict PUBLIC/default/routine revocations. Add precisely this statement to the exact-signature grant block, with no grant option:
```sql
-- FUTURE PROPOSAL ONLY; NOT AUTHORIZED TO EXECUTE
GRANT EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity(integer)
TO c5_qualification_readonly;
```
- **Phase C:** retain its guard and administrator-only metadata scope. Add exactly `'pg_stat_get_activity(integer)'` to EACH of the two existing signature arrays (49 → 50 each). Keep risk-query logic intact. Its previously forbidden-dependency metadata row becomes a required-dependency row: exact Boolean TRUE for this signature only, alongside exactly 50 resolvable permitted signatures. Do not merely change a label while retaining contradictory FALSE criteria.
- Preserve plain SQL `"char"` quoting from revision 2, all role/schema/table/sequence/ownership/default safeguards and no grant-on-error policy. No new runtime query or live workload is added to Phase C.
- Update the decision, role table, section comments and explicit acceptance table wherever they say 49 or D12-incompatible: label those statements as the preserved Candidate05 baseline, versus the proposed successor's exact 50 set. The successor is only **statically compatible in design**, pending separately authorized validation.

### Acceptance criteria to amend/add (future review/validation, not tasks authorized now)
1. Exact set delta: successor set minus frozen set = {pg_stat_get_activity(integer)}; frozen minus successor = empty. Exactly 50 distinct entries in both source sets, Phase B grants and both Phase C arrays. Resolve every exact signature on the approved PostgreSQL build; count-only equality is insufficient.
2. Administrator inventory: all 50 non-NULL/resolvable and permitted=true; specific activity dependency TRUE; zero excess-risk rows; no PUBLIC/default/inherited/grant-option escape. Missing/extra/NULL/error/contradictory output blocks acceptance. All other revision 2 criteria remain.
3. Explicit visibility disposition: SQL reviewer and Wes accept this cluster-wide basic/same-role fuller activity visibility on the exact dedicated cluster, or reject A. No claim of own-session-only authority; no broad role grants.
4. Under later authorized verification, establish D12's exact one-row server identity and marker on the strict resulting ACLs, provider startup privilege compatibility, and denial of any unapproved executable routine. No additional grants on failure; record failure and return to review. Catalog inventory alone is not runtime PASS.
5. Under later authorized campaign scope, preserve D12/V4a same retained Client, independent backend/connection continuity, no reconnect, fanout/attempt bounds and semantic revocation evidence. Neither PostgreSQL NOLOGIN nor IAM change acknowledgement is existing-session termination proof.
6. In any eventual local S receipt: runtime NOLOGIN/password NULL, services stopped/disabled at end, no real campaign journal/claim/slot, no provider/tunnel workload. A successful catalog receipt is not hosted T acceptance.
7. New successor review/manifest/package receipts must bind the actual changed bytes; Candidate05, all historical evidence and the 48-attempt history remain immutable. No execution authority follows from document acceptance.

## 6. Separate remaining evidence register
These are retained Oct31 findings, **not fresh control-plane checks this turn**. Evidence gaps do not disappear if D12 is resolved.

| Track / owner | Last documented position | Exact receipt / remaining path |
|---|---|---|
| **Owner / effective Google IAM** — Jay + project/org owners | Existing project IAM and billing reads denied (403); full effective separation unproven. An access gap is not a proof of unsafe or safe isolation. | Named qualification-reader and separate replay-writer principals; complete applicable organization/folder/project policies, groups, conditions and custom-role expansion; prove create-only replay writer and no qualification-write/alternate authority; prove no reader replay grant. Use supported owner evidence, no new role/key/identity or bypass now. |
| **Replay target / no-added-cost capacity** — Jay + project/billing owner | Qualification project has only (default), nam5, STANDARD/NATIVE, freeTier=true; that qualification DB is ineligible for replay writes. Three other project inventories returned SERVICE_DISABLED, which proves neither absence nor free capacity. No eligible store established. | Exact project ID/number/parent, database/location and isolation; current billing/plan, free-DB eligibility, usage/headroom and policy support. Prefer owner-verified eligible existing dedicated capacity. No second database in qualification project disguised as free. No resource selected here. |
| **Conditional replay provisioning decision** — owner + independent reviewer | Prior papers differ: readiness receipt prefers an unused EXISTING nonproduction project; revision 2 also describes a NEW Spark project fallback. Neither is approval or a selected target. | Reconcile into ONE exact owner-reviewed resource/cost plan after inventory. A new project is a separately enumerated fallback only if authorized; no implicit project/API/SA/role/binding/token creation. Published free quotas are not account headroom or a spend guarantee. |
| **Replay binding / continuity** — Wes + source reviewer/operator | Frozen app/config/replay-binding.json disabled, projectId/databaseId UNBOUND. | Separately reviewed successor binding to exact approved immutable target, same run+slot namespace across redeployments; retain claims, no TTL/delete/reset/restore. Dedicated create-only permission datastore.entities.create with supported exact database resource.name condition, not collection-scoped IAM or broad datastore.user. Effective and runtime behavior require later scoped acceptance. No source binding edit now. |
| **Credential / revocation schedule** — authorized issuer + independent observer | Credential values not requested; effective IAM and retained-token revocation unverified. | Later input names: C5_REPLAY_PROJECT, C5_REPLAY_DATABASE, C5_REPLAY_CLIENT_EMAIL, C5_REPLAY_ISSUED_TOKEN, C5_REPLAY_TOKEN_EXPIRES_AT; distinct reader metadata and issuer authority. Later separately reviewed issuance/expiry/revocation schedule respecting permission caches, 42+6 allocation and all 48 attempts. No new probes/retries/reset to force a result. Local expiry, admin acknowledgement or +30-second silence alone is not server rejection. |
| **Vercel** — Vercel owner | Oct31 exact project, deployment and build-events metadata requests returned 403; protection and runtime logs unverified. Historical access restoration/protection is stale. | Supported access to team_eZc4TyPpmQowyAwr765G6Pb4 / prj_bnugVcBR13UQb0N8q43GbxC5flDP; exact reviewed source/build/deployment binding (historical deployment dpl_CgimcFm1HucsAT18UeMC7giYHmL3 is not successor acceptance), all-deployment protection evidence and permitted test ingress, build AND bounded runtime log access/retention/correlation. No fallback account, paid seat, env edit, deployment or application probe now. |

### Local S prerequisites remain separate too
Named supported Windows administrator and independent reviewer; exact new PG cluster system ID/data/config/HBA paths/55442, binary/dependency hashes and trusted loading closure; named service/root/port occupancy and effective owner/DACL/inheritance/deletion/reparse/SCM evidence; non-synced protected operator journal paths, bounds and durability assumptions; reviewed partial-Setup containment and final stopped/disabled receipts. These are not supplied by a D12 allowlist amendment or by cloud owner evidence. No old cluster/old SQL carry-forward.

## 7. Full remaining path and hold points
1. **Now:** review this bounded document and choose/reject A, including visibility. Obtain independent SQL/Wes disposition; no implementation or tests implied.
2. **Only under later explicit source-work authority:** create a separate successor, apply the exact source/document/SQL deltas, preserve Candidate05, reseal genuine changed identities and obtain independent source/SQL review. Any test execution requires its separately permitted scope.
3. **In parallel as owner evidence, not provisioning:** close effective IAM, replay target/cost and Vercel access/log/protection gaps. Resolve the existing-project/new-project fallback discrepancy before any C request.
4. **S — local Setup:** only a separately authorized concrete packet after applicable local prerequisites and SQL review. S does not close C/V or establish T; partial stopped/disabled installation must not be reported as hosted readiness.
5. **C — replay provisioning:** only a separately approved exact no-added-cost resource/policy plan and owner evidence. No authority inferred from S.
6. **V — isolated disabled preview:** only supported exact access/protection/log/source/build evidence and separate authority. No canonical/Alpha changes or purchase activation.
7. **T — qualification execution:** only after independently accepted successor, exact targets/credentials/continuity/revocation/fault/cessation plan, durable accounting and separate execution authority. Preserve the existing 42+6/all-48 discipline; no extra attempts authorized here.

**Current outcome: proposal complete; D12 resolution NOT applied. Setup and hosted execution remain BLOCKED.** No background worker, monitor or operational continuation is scheduled.

## 8. Evidence and scope
- Frozen source: [Candidate05 commit](https://github.com/jaybmcv/mcvplus-c5-review-20261030/tree/f7d2fe369098589364abcac9a7af7992d90042c2).
- [Accepted targeted revision 2 review](https://raw.githubusercontent.com/jaybmcv/mcvplus-c5-review-20261030/797eeb64d9cb038a6784aa011e2812533ed8e82c/reviews/20261031-sql-v2/INDEPENDENT-REVIEW-V2.md) and sibling SUBMITTED-REVIEW-V2.md / STATIC-RECEIPT.json.
- Frozen anchors read: driver/clients.mjs:64,66–78,126–152; driver/cases.mjs:42; driver/evidence.mjs:63; driver/provider-contract.mjs PURE_FUNCTIONS/PRIVILEGE_SQL; local-service/provider/readonly-db.mjs PURE_FUNCTIONS/startupGate; retained provider-bundle recipe and relevant existing test assertions read as text only.
- PostgreSQL version-pinned source: [REL_18_4 system_views.sql](https://github.com/postgres/postgres/blob/REL_18_4/src/backend/catalog/system_views.sql), pg_stat_activity definition; [REL_18_4 pgstatfuncs.c](https://github.com/postgres/postgres/blob/REL_18_4/src/backend/utils/adt/pgstatfuncs.c), HAS_PGSTAT_PERMISSIONS and pg_stat_get_activity. Visibility analysis is source-based, not live verification.
- Remaining gates: Candidate05 REPLAY-DEPENDENCY.md and SETUP-PACKET.md; retained Oct31 readiness receipt and accepted revision 2 outstanding-input/acceptance sections. The readiness receipt is local/private and not newly published as part of this proposal.
- Review scope is this bounded D12 design and consolidation of recorded gaps, not a new full 70-file certification, live IAM/billing/Vercel audit or SQL approval. Henri performed this review; no second-agent review is claimed.
