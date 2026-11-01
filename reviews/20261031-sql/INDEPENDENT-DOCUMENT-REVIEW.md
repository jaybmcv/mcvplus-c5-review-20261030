# Candidate05 — independent document-only SQL review
Date: 2026-10-31
Reviewer: Henri, independently reviewing the supplied ChatGPT-prepared document. No second-agent review is claimed.

## Disposition: CHANGES REQUIRED; no Setup authorized
Candidate05 stays frozen at f7d2fe369098589364abcac9a7af7992d90042c2.
The submitted document is a useful proposed scope, not executable/approved SQL. Two blockers prevent accepting it as a campaign-compatible SQL baseline.

Input: C5_Candidate05_Proposed_Setup_SQL_and_Replay_Review_2026-10-31.md
Input SHA256: 9815542015f98b414518657ad05a416d9eeb0d465752629ca9425c8eaf951f99

## 1. HIGH — literal JavaScript escapes were copied into SQL
Attachment lines 309, 317, 319 contain actual backslash bytes before double quotes in GRANT function signatures. This is not just display escaping. PostgreSQL SQL identifier syntax requires plain double quotes here, not JavaScript escapes.

Document correction for review only:
```sql
GRANT EXECUTE ON FUNCTION pg_catalog.hashchar("char") TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btcharcmp("char","char") TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.chareq("char","char") TO c5_qualification_readonly;
```
Also correct the corresponding signature TEXT entries in both Phase C arrays at lines 451/459/461 and 515/523/525 to:
```sql
'hashchar("char")',
'btcharcmp("char","char")',
'chareq("char","char")'
```
Under standard_conforming_strings=on, those existing text literals retain the backslashes, so the risk comparison and to_regprocedure inventory also cannot be treated as exact matches. Do not work around this by changing string settings or using psql extraction tricks. Preserve the unconditional review-only guards. Return a new document/hash; do not modify the submitted original or Candidate05.

Text-only comparison found 49 entries in each frozen source allowlist and 49 GRANT statements. After decoding the JavaScript source literals correctly, both source sets agree. The draft SQL differs in exactly the three signatures above; correcting those escapes makes the GRANT signature sets equal. This is not PostgreSQL parsing or execution validation.

## 2. HIGH — D12/frozen allowlist incompatibility is confirmed
Frozen driver/clients.mjs:64 queries pg_stat_activity for backend PID/start, role, database, application name and loopback client. D12 validates these at line 145 and retains the same Client for V4a at lines 148 onward.

Official REL_18_4 system_views.sql defines pg_stat_activity with FROM pg_stat_get_activity(NULL), plus catalog joins. PostgreSQL CREATE VIEW documentation explicitly requires callers to have permission to call functions used by a view.
Both frozen allowlists omit pg_catalog.pg_stat_get_activity(integer). The draft revokes PUBLIC/runtime routine execution, then grants only the 49. D12 therefore has an expected permission failure; this is a static compatibility conclusion, not a live reproduction. pg_backend_pid() is already allowed and does not resolve the missing function.

Disposition while the freeze holds: keep the function forbidden; do not authorize SQL-inclusive Setup as campaign-compatible, grant on error, add monitoring roles, or silently change D12.
A future separately authorized source revision could retain D12 and add exactly this function to both allowlists plus the SQL. That is the smallest obvious contract amendment, but its broader statistics visibility needs explicit review: granting the function is not permission restricted to the WHERE pid filter, and a caller can invoke it directly. Ordinary-role restrictions on other sessions still apply; do not claim own-session-only access.
An alternative session-identity query must retain equivalent backend-start and same-Client provenance; PID alone, application_name alone, or client assertions are not equivalent. No replacement query or source amendment is approved here.

## 3. Boundaries and nonblocker observations
- Database-local PUBLIC routine revocation and creator default-privilege changes are consistent with the proposed dedicated-cluster boundary. They are not suitable for an existing/shared database. SQL asserts do not replace independently established physical instance identity.
- Phase B DOES restore USAGE on public as well as pg_catalog/c5_qualification (line 279). The public negative objects are not blocked merely by missing schema USAGE.
- Phase A's CREATE DATABASE is outside its preceding transaction. Partial resources must remain stopped/disabled and attributed; the receipt must not imply atomic rollback.
- Phase C emits inventories for later independent comparison; a successful psql exit by itself is not a PASS. Require 49 non-null resolved signatures with permitted=true, empty risk rows, the explicitly false D12-dependency baseline while frozen, exact expected role/owner/column/constraint/grant/default inventories and disabled role state. Missing/NULL inventory results must block acceptance. No new checker or test suite requested.
- NOLOGIN/password NULL and unstarted provider/tunnel correctly avoid treating local installation as runtime acceptance.
- Local S, cloud C, Vercel V and qualification T remain distinct. No partial file/service-only outcome may be described as full Setup readiness. There is no reason to install partial services merely to demonstrate progress.
- The Spark first/default-database proposal is conditional, not an established zero-cost resource. Existing eligible isolated capacity comes first. Actual project/parent/region, nonbilling eligibility/headroom, effective IAM, token issuance and evidence access remain owner-dependent. No new inspection or owner response was established in this review.
- Exact Vercel protection/log access remains unresolved from the earlier receipt. This review did not retry access or send another owner message.
- No SQL execution, PostgreSQL parser, candidate import/build/test, application call, cloud mutation, installation, staging, deployment or credential/IAM change occurred. Source files were read and hashed only. Public PostgreSQL source/docs were fetched as text.
- Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged. All 48 actual attempts preserved by nonexecution here; no fresh ledger census claimed.

## Evidence
Verified local FINAL-SOURCE-MANIFEST.json SHA256: 7c2fca43299c2f70886335b33228829ba9f7fdf4472bf1f10f7c3b1a7b4d888a.
Selected source bytes matched this manifest:
- driver/clients.mjs: 415218d2ebe5444dff60b7fdb9381f84db9c011d534cd4f61a6956f02717405d
- driver/provider-contract.mjs: c1aade362e363c1f4b7b681d577879ade45c5e6be9a241720e22e02a8f07edd2
- local-service/provider/readonly-db.mjs: c9a11c62117a631b88b0088182127b42337708da9d2ec102e86b1afc2a747e47
- SETUP-PACKET.md: 160327ec7641ca745214a33cbfc0732c14bc3085b7fa9d683611363a7febf662
This is selected-file verification, not a fresh full GitHub tree attestation.
Official references:
- https://raw.githubusercontent.com/postgres/postgres/REL_18_4/src/backend/catalog/system_views.sql (HTTP 200)
- https://www.postgresql.org/docs/18/sql-createview.html

## Paste-ready reply to ChatGPT
Henri's independent document-only review returns CHANGES REQUIRED, not Setup authorization.

1. Fix literal JavaScript-style backslash-double-quote escapes in the three Phase B GRANTs for hashchar, btcharcmp and chareq, and their corresponding entries in BOTH Phase C arrays. SQL needs plain quoted "char". Preserve all review-only guards. Correcting these makes the text signature sets match the frozen 49; no execution validation is claimed.
2. D12's pg_stat_activity / pg_stat_get_activity(integer) mismatch is independently confirmed. Keep Candidate05 and its 49-function contract frozen. Mark SQL-inclusive campaign-compatible Setup BLOCKED pending a separately approved future contract/query disposition. Do not silently grant the function or replace same-session provenance with PID alone.
3. Return a revised document and hash, with explicit expected Phase C results and no readiness inference from successful command exit. Keep owner evidence and S/C/V/T gates distinct.

No implementation, tests, SQL execution, installation, staging, deployment, cloud provisioning, API/billing enablement, credential/IAM changes or hosted qualification. Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged; preserve all 48 actual attempts.
