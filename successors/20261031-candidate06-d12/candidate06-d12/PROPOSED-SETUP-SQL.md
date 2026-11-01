# C5 Candidate06-D12 — source-only successor proposed Setup and SQL

**31 October 2026 · Option A successor · SOURCE CHANGE AUTHORIZED / SQL EXECUTION NOT AUTHORIZED / UNTESTED**

Prepared for Wes and Henri. Candidate05 and accepted Revision 2 are unchanged predecessors; their exact bytes are retained in provenance. This successor incorporates only the accepted Option A function-permission correction. No candidate execution, builds, tests, PostgreSQL parsing or SQL execution, Setup, installation, staging, provisioning, deployment, credential/IAM changes or hosted attempts are authorized or performed.

## 1. Narrow successor disposition

Candidate05 had 49 signatures and omitted the activity function required by its unchanged D12 view query. This successor adds exactly pg_catalog.pg_stat_get_activity(integer) to BOTH source sets, the Phase B grant list and BOTH Phase C inventories (50 each). No other privilege predicate or executable query changes. Static dependency alignment is not runtime compatibility proof.

The requester accepts this visibility tradeoff SOLELY for the dedicated disposable qualification cluster. EXECUTE allows direct calls with other PIDs or NULL: basic metadata across the cluster, fuller activity (including query text/client/start metadata where available) for own sessions and roles whose privileges the caller has; ordinary-role masking applies to unrelated roles. The query WHERE filter is NOT a permission boundary. The provider shares this authority. No pg_monitor, pg_read_all_stats, memberships, ownership, grant options or alternate role are added. Never apply to a shared, old-55432, Alpha or canonical cluster.

D12 query, row validation, retained Client, server backend PID/start evidence and V4a independent sameSession/noReconnect requirements remain byte-identical. Cached D12 JSON carried by V4a is not independent continuity proof; retain observer connection/backend correlation and lifecycle evidence. No extra probes/retries/slots are added. Purchases OFF; recovery DISARMED; approval pin UNSET; Alpha/canonical unchanged; all 48 attempts preserved (supplied invariant, not a fresh ledger census).

The guarded SQL below is PROPOSED ONLY. All three unconditional review-only guards remain. Missing, NULL, extra, erroneous or contradictory evidence blocks acceptance. Setup remains BLOCKED pending the separate exact S packet, prerequisites and authorization; cloud C/V and campaign T remain independent.

## 2. Frozen predecessor inputs (historical; not successor identities)

- Repository: https://github.com/jaybmcv/mcvplus-c5-review-20261030
- Commit: `f7d2fe369098589364abcac9a7af7992d90042c2`.
- Source manifest stated in final report: `7c2fca43299c2f70886335b33228829ba9f7fdf4472bf1f10f7c3b1a7b4d888a` (70 files).
- Final app identity: `21731f14dec5805d720d0f6cff7853924781c8e9730da3a13f1d2e2dcda42de4`.
- Selected files read: Setup packet and its independent review; replay dependency; provider readonly-db, entry and server; driver provider-contract, clients, cases and evidence; app/service constants; provider-bundle fixture source. Full 70-file source review and byte verification are not claimed by this document review.
- Provider/driver function sets were extracted as text and compared: 49 unique signatures, sets equal. No candidate module was imported or executed.
- Final Setup packet already incorporates its earlier review's distinction between IAM propagation and +30-second cessation, and the correction that SERVICE_DISABLED inventories do not prove database absence. No reopening of those resolved wording issues is requested.
- This is a nonfinancial qualification application. It does not qualify the real-CREAM purchase routes or activate the committed purchase implementation.

## 3. Exact outstanding inputs

| Input | Owner | Needed before | Current fact / required receipt |
|---|---|---|---|
| New local-cluster instance and administrator | Windows administrator | S mutation | Exact administrator, independently recorded new cluster system identifier, data/config/HBA paths, port 55442, supported binary/version and SHA256. No old 55432 cluster. |
| OS/runtime package closure | Henri + Windows administrator | S copy/service creation | Exact Node, PostgreSQL, NSSM, cloudflared, dependencies, executable/DLL/cwd/config/environment paths and copy manifest; no development links, test caches or ambient build inputs. Source hash is not installed-payload proof. |
| SQL review | independent SQL reviewer + Wes | S database provisioning | Review the three proposed SQL phases below, the Option A activity exception, default privileges, global PUBLIC implications and exact 50 grants. No SQL execution now. |
| Physical target occupancy and ACLs | Windows administrator | first S mutation | Named roots/services/ports absent; owner/DACL/inheritance/parent deletion and reparse evidence; at most initial/apply/final snapshots per object. Collision means stop, not adoption. |
| Conventional loading profile | Henri + Windows administrator | S configuration acceptance | Actual SCM/NSSM account/SID type, privilege list, image/arguments/cwd/restart, PG config/include/preload/tablespace/archive/auto.conf, DLL/library/environment trust boundaries. Do not claim protection against a malicious database OS service from SQL read-only grants. |
| Journal/evidence storage | operator + Windows administrator | S operator-path acceptance; T activation | Exact non-synced local paths, owner and sidecar ACLs, supported runtime/VFS/flush assumptions, space and storage-bound policy. No power-loss test or independent physical-durability certification is requested here. No real attempt journal initialized in S. |
| Secret scope | Wes + administrator | any later secret placement | Explicit new credential IDs and destination ACLs; none supplied here. Proposed S omits real secret issuance/placement and leaves runtime DB role NOLOGIN/PASSWORD NULL. |
| Replay project/database and costs | Jay / project owner | separate C provisioning | Existing eligible dedicated unused capacity OR conditional new Spark project proposal below; actual project ID/number, parent, region, billing disabled, quota eligibility/headroom. Owner-dependent, unresolved. |
| Effective Google IAM | project/organization owner | C acceptance and T | Full applicable inherited policy, groups and role definitions; dedicated create-only replay principal; no qualification-reader broadening or alternate authority. Current 403 is an access gap, not failed isolation proof. |
| Vercel project/protection/log access | Vercel owner | V | Supported access and exact project/deployment/source/build/protection/logging evidence. No fallback account or paid seat. Separate from local S. |
| Campaign activation/evidence schedule | Wes + operators | T | Exact source-bound targets, 42+6 allocation, durable operator journal, run+slot replay continuity, semantic statuses/fanout, fault/revocation authorities and independent cessation/ingress evidence. Existing source is permanently disabled/UNBOUND. |

Do not reclassify the unavailable Google inventories as empty projects or request broad new runtime roles to inspect owner metadata. Jay may supply sanitized owner receipts without changing runtime permissions. No secrets/password verifiers/token values are part of the review return.

## 4. PostgreSQL proposed privilege matrix

This profile is ONLY for a new dedicated PostgreSQL 18.4 cluster on loopback 55442; the version is a proposed baseline and must be independently reconciled to approved binary hashes. Other versions require review, not an automatic upgrade. `template0` avoids copying user-added template1 objects. All broad routine/PUBLIC revocations below are confined to the new database, with connection restrictions on its new-cluster administrative databases; never run them on an existing/shared cluster.

| Principal/object | Proposed allow | Explicitly withheld / boundary |
|---|---|---|
| Setup administrator | Provision and catalog-inspect only the new cluster; database owner | Credential absent from provider, driver and hosted worker. Does not confer host-wide or shared-cluster change authority. |
| `c5_qualification_fixture_owner` | NOLOGIN ownership of the two fixture schemas and their objects | No membership granted to runtime; no superuser/createdb/createrole/replication/bypassrls. Owner is not a runtime security boundary if an administrator acts as it. |
| `c5_qualification_readonly` | In S: NOLOGIN/PASSWORD NULL; CONNECT on test DB, USAGE schemas, SELECT exactly three fixture tables, EXECUTE exactly 50 functions | No ownership, role memberships/SET-role route, grant options, CREATE/TEMP, table/column writes, MAINTAIN, sequence privileges or nonallowlisted routine EXECUTE. LOGIN/secret issuance requires separate authority. |
| `resource_marker` | One fixed synthetic marker; SELECT | No defaults/RLS/triggers/rules/partitions/inheritance/foreign tables; PK column 1. |
| `members_fixture` | One synthetic member, no balance/economy; SELECT | UUID/text/text/text exact column order, alias nullable, PK id, UNIQUE discord ID. No extra CHECK/default constraint. |
| `reservation_keys_fixture` | One synthetic nonfinancial closed key; SELECT | Text/text/boolean, composite PK columns 1/2. Not a Creamery financial key or cancellation tombstone. |
| `public.throwaway_write_probe` | Exists, seeded id=1; no runtime SELECT/write | B7 INSERT/UPDATE/DELETE/TRUNCATE must reach an existing object and deny by privileges. |
| `public.throwaway_sequence` | Exists; no runtime USAGE/SELECT/UPDATE | B7g may deny at `nextval` EXECUTE before checking sequence ACL. SQLSTATE 42501 alone does not isolate which privilege denied; catalog checks separately establish no sequence grant. |
| `pg_catalog` / system views | Existing nonsecret catalog SELECT/USAGE necessary for frozen checks; exact routine allowlist | No `pg_monitor`, `pg_read_all_stats`, `pg_read_all_data`, `pg_write_all_data`, server-file/program, signal or management memberships. Sensitive catalogs remain administrator-only. Activity exception is explicit and restricted to the dedicated disposable cluster. |
| `PUBLIC` | No CREATE/TEMP/CONNECT on the dedicated DB; no fixture/probe/sequence grants; no routine EXECUTE in current DB after hardening | Runtime direct REVOKE alone cannot negate PUBLIC/inherited rights. Existing and future-object grants are handled separately. |
| PG OS service | Modify its own isolated cluster/data paths | SQL readonly does not constrain its file privileges or prove safety of mutable configuration; actual loading/ACL review remains separate. |

Default read-only transactions are supplementary. B7 deliberately uses BEGIN READ WRITE so a read-only-transaction error is not mistaken for an ACL denial. The exact 50-signature restriction is the frozen 49 plus only pg_stat_get_activity(integer). D12 static dependency alignment is not a live compatibility result.

## 5. Proposed SQL — review only, not executable authorization

The following are exact draft bodies for independent review, NOT approved scripts. Each block has an unconditional psql quit before all work. Keep it. Any later extracted execution version requires its own review, exact hash and named authorization. No password, real token, system identifier or operator identity is fabricated. Required psql variables are unresolved owner inputs. No DROP, IF NOT EXISTS adoption, password generation, runtime login or automatic retry is included.

### Phase A — new-cluster roles and database

Before any later use: physical/SCM/provenance preflight must already establish the exact NEW dedicated cluster. SQL identity checks supplement that proof; an attacker-controlled server can claim metadata. Partial Phase A is not atomic across CREATE DATABASE; retain any partial roles/database stopped and disabled on error. Never rerun to adopt them.

```sql
-- DOCUMENT DRAFT ONLY. No SQL or psql command in this document was executed.
-- This unconditional guard is intentional, not an installation option.
\echo REVIEW_ONLY_NOT_AUTHORIZED_DO_NOT_EXECUTE
\quit 3
-- Everything below is a proposed future separately reviewed extraction.
-- No current authorization permits removing the guard or executing the body.
\set ON_ERROR_STOP on
\set ECHO none
\set VERBOSITY terse

-- Required future operator bindings: approved_system_identifier,
-- approved_data_directory, approved_admin_role. No values are invented here.
-- These must come from an independently approved new-cluster receipt.
\if :{?approved_system_identifier}
\else
  \quit 3
\endif
\if :{?approved_data_directory}
\else
  \quit 3
\endif
\if :{?approved_admin_role}
\else
  \quit 3
\endif
SELECT current_setting('server_version_num')::integer = 180004
   AND inet_server_addr() = '127.0.0.1'::inet
   AND inet_server_port() = 55442
   AND current_user = session_user
   AND current_user::text = :'approved_admin_role'
   AND current_setting('data_directory') = :'approved_data_directory'
   AND (SELECT system_identifier::text FROM pg_control_system())
       = :'approved_system_identifier'
   AND (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
   AS exact_new_cluster_ok
\gset
\if :exact_new_cluster_ok
\else
  \quit 3
\endif

-- Administrative connection must be to postgres on the NEW dedicated cluster.
-- Read-only physical/collision checks must already have established its isolation.
DO $review$
BEGIN
  IF current_database() <> 'postgres' THEN
    RAISE EXCEPTION 'Expected new-cluster administrative database';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_database
             WHERE datname NOT IN ('postgres','template0','template1'))
     OR EXISTS (SELECT 1 FROM pg_roles
                WHERE rolname IN ('c5_qualification_fixture_owner',
                                  'c5_qualification_readonly')) THEN
    RAISE EXCEPTION 'Collision or non-pristine dedicated cluster; no adoption';
  END IF;
END
$review$;

BEGIN;
CREATE ROLE c5_qualification_fixture_owner
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT
  NOREPLICATION NOBYPASSRLS PASSWORD NULL;
CREATE ROLE c5_qualification_readonly
  NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT
  NOREPLICATION NOBYPASSRLS PASSWORD NULL CONNECTION LIMIT 4;
-- Cluster-local administrative databases only. Never run on a shared cluster.
REVOKE ALL PRIVILEGES ON DATABASE postgres, template1
  FROM PUBLIC, c5_qualification_readonly;
COMMIT;

-- CREATE DATABASE cannot be placed inside the preceding transaction.
-- The setup administrator remains database owner; runtime/fixture owner do not.
CREATE DATABASE mcvplus_c5_roq_20261029
  WITH OWNER = CURRENT_USER TEMPLATE = template0 ENCODING = 'UTF8';
REVOKE ALL PRIVILEGES ON DATABASE mcvplus_c5_roq_20261029
  FROM PUBLIC, c5_qualification_readonly;
-- Stop here; Phase B requires a new explicitly targeted admin connection.
-- If anything fails, preserve the partial resources. No DROP or rerun.

```

### Phase B — synthetic schema, seed and exact grants

Admin-only provisioning, conditional on later explicit S authorization. The synthetic member UUID/alias and key below are proposed fixtures for reviewer approval, not copied users or purchase data. No fake CREAM balances, credits, reservation charges or entitlements are created. Text columns explicitly use the default collation expected by frozen validation (OID 100); confirm that catalog identity during later admin inventory.

```sql
-- DOCUMENT DRAFT ONLY. No SQL or psql command in this document was executed.
-- This unconditional guard is intentional, not an installation option.
\echo REVIEW_ONLY_NOT_AUTHORIZED_DO_NOT_EXECUTE
\quit 3
-- Everything below is a proposed future separately reviewed extraction.
-- No current authorization permits removing the guard or executing the body.
\set ON_ERROR_STOP on
\set ECHO none
\set VERBOSITY terse

-- Required future operator bindings: approved_system_identifier,
-- approved_data_directory, approved_admin_role. No values are invented here.
-- These must come from an independently approved new-cluster receipt.
\if :{?approved_system_identifier}
\else
  \quit 3
\endif
\if :{?approved_data_directory}
\else
  \quit 3
\endif
\if :{?approved_admin_role}
\else
  \quit 3
\endif
SELECT current_setting('server_version_num')::integer = 180004
   AND inet_server_addr() = '127.0.0.1'::inet
   AND inet_server_port() = 55442
   AND current_user = session_user
   AND current_user::text = :'approved_admin_role'
   AND current_setting('data_directory') = :'approved_data_directory'
   AND (SELECT system_identifier::text FROM pg_control_system())
       = :'approved_system_identifier'
   AND (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
   AS exact_new_cluster_ok
\gset
\if :exact_new_cluster_ok
\else
  \quit 3
\endif

-- Connect as the SAME approved setup administrator directly to the NEW test DB.
SET search_path = pg_catalog;
BEGIN;
DO $review$
BEGIN
  IF current_database() <> 'mcvplus_c5_roq_20261029' THEN
    RAISE EXCEPTION 'Wrong database';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname='c5_qualification')
     OR EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
                WHERE n.nspname='public')
     OR EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
                WHERE n.nspname='public')
     OR EXISTS (SELECT 1 FROM pg_extension WHERE extname <> 'plpgsql')
     OR EXISTS (SELECT 1 FROM pg_auth_members
                WHERE member IN (SELECT oid FROM pg_roles WHERE rolname IN
                    ('c5_qualification_readonly','c5_qualification_fixture_owner'))) THEN
    RAISE EXCEPTION 'Collision, extension or unexpected membership; no repair';
  END IF;
END
$review$;

REVOKE ALL PRIVILEGES ON SCHEMA public FROM PUBLIC, c5_qualification_readonly;
ALTER SCHEMA public OWNER TO c5_qualification_fixture_owner;
CREATE SCHEMA c5_qualification AUTHORIZATION c5_qualification_fixture_owner;

-- Remove globally default PUBLIC EXECUTE for FUTURE routines of both creators.
-- This does not replace the explicit revocation on already existing routines below.
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON ROUTINES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE c5_qualification_fixture_owner
  REVOKE EXECUTE ON ROUTINES FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE c5_qualification_fixture_owner
  REVOKE ALL PRIVILEGES ON TABLES FROM PUBLIC, c5_qualification_readonly;
ALTER DEFAULT PRIVILEGES FOR ROLE c5_qualification_fixture_owner
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM PUBLIC, c5_qualification_readonly;

SET ROLE c5_qualification_fixture_owner;
CREATE TABLE c5_qualification.resource_marker (
  marker text COLLATE pg_catalog."default" NOT NULL PRIMARY KEY
);
CREATE TABLE c5_qualification.members_fixture (
  id uuid NOT NULL PRIMARY KEY,
  discord_user_id text COLLATE pg_catalog."default" NOT NULL UNIQUE,
  username_alias text COLLATE pg_catalog."default",
  status text COLLATE pg_catalog."default" NOT NULL
);
CREATE TABLE c5_qualification.reservation_keys_fixture (
  scope text COLLATE pg_catalog."default" NOT NULL,
  idempotency_key text COLLATE pg_catalog."default" NOT NULL,
  closed boolean NOT NULL,
  PRIMARY KEY (scope, idempotency_key)
);
-- Existing negative statements require real objects; absent objects give wrong errors.
CREATE TABLE public.throwaway_write_probe (id integer NOT NULL PRIMARY KEY);
CREATE SEQUENCE public.throwaway_sequence AS bigint START WITH 1;

INSERT INTO c5_qualification.resource_marker(marker)
  VALUES ('mcvplus_c5_roq_20261029:c5-readonly-20261029');
INSERT INTO c5_qualification.members_fixture
  (id,discord_user_id,username_alias,status)
  VALUES ('00000000-0000-4000-8000-000000000001',
          '990000000000000001','SYNTHETIC-C5-READONLY','active');
INSERT INTO c5_qualification.reservation_keys_fixture
  (scope,idempotency_key,closed)
  VALUES ('mcvplus-c5-qualification','SYNTHETIC-NONFINANCIAL-KEY-1',true);
INSERT INTO public.throwaway_write_probe(id) VALUES (1);
RESET ROLE;

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public,c5_qualification
  FROM PUBLIC,c5_qualification_readonly;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public,c5_qualification
  FROM PUBLIC,c5_qualification_readonly;
-- Essential: revoking directly from runtime does NOT remove PUBLIC EXECUTE.
-- These changes affect this NEW database only, not template0/template1 functions.
REVOKE ALL PRIVILEGES ON ALL ROUTINES
  IN SCHEMA pg_catalog,information_schema,public,c5_qualification
  FROM PUBLIC,c5_qualification_readonly;

GRANT CONNECT ON DATABASE mcvplus_c5_roq_20261029 TO c5_qualification_readonly;
GRANT USAGE ON SCHEMA pg_catalog,public,c5_qualification
  TO c5_qualification_readonly;
GRANT SELECT ON TABLE c5_qualification.resource_marker,
  c5_qualification.members_fixture,c5_qualification.reservation_keys_fixture
  TO c5_qualification_readonly;

-- Supplementary defaults, NOT the read-only security boundary.
ALTER ROLE c5_qualification_readonly IN DATABASE mcvplus_c5_roq_20261029
  SET default_transaction_read_only = on;
ALTER ROLE c5_qualification_readonly IN DATABASE mcvplus_c5_roq_20261029
  SET search_path = pg_catalog;
ALTER ROLE c5_qualification_readonly IN DATABASE mcvplus_c5_roq_20261029
  SET statement_timeout = '2000ms';
ALTER ROLE c5_qualification_readonly IN DATABASE mcvplus_c5_roq_20261029
  SET idle_in_transaction_session_timeout = '2000ms';
ALTER ROLE c5_qualification_readonly IN DATABASE mcvplus_c5_roq_20261029
  SET lock_timeout = '1000ms';

-- Exact successor 50-signature set: frozen 49 plus pg_stat_get_activity(integer). No pg_monitor, pg_read_all_stats,
-- pg_read_all_data, pg_write_all_data, file/program or role memberships.
GRANT EXECUTE ON FUNCTION pg_catalog.has_database_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_schema_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_table_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_any_column_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_column_privilege(name,oid,smallint,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_sequence_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.has_function_privilege(name,oid,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashtext(text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashname(name) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashoid(oid) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashchar("char") TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashint2(smallint) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.hashint4(integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.bttextcmp(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btnamecmp(name,name) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btoidcmp(oid,oid) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btint2cmp(smallint,smallint) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btint4cmp(integer,integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.btcharcmp("char","char") TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.namene(name,name) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.chareq("char","char") TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.int24gt(smallint,integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.int2gt(smallint,smallint) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textne(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.anytextcat(anynonarray,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textanycat(text,anynonarray) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textcat(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.text(inet) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.text(name) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.pg_backend_pid() TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.pg_stat_get_activity(integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.current_database() TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.inet_server_addr() TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.inet_server_port() TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.current_setting(text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.aclexplode(aclitem[]) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.nameeq(name,name) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.texteq(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.int4eq(integer,integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.oideq(oid,oid) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textlike(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textnlike(text,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.nameeqtext(name,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.namelike(name,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.namenlike(name,text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.regprocedureout(regprocedure) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textin(cstring) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.textout(text) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.array_in(cstring,oid,integer) TO c5_qualification_readonly;
GRANT EXECUTE ON FUNCTION pg_catalog.array_out(anyarray) TO c5_qualification_readonly;

COMMIT;
-- Both new roles remain NOLOGIN and PASSWORD NULL. No real secret is generated.
-- Login/SCRAM credential placement requires its own named later authority.
-- D12 dependency is aligned statically; runtime qualification remains UNTESTED.

```

### Phase C — administrator catalog inventory, not runtime acceptance

These are proposed catalog-only reads for a later authorized S. No runtime login, fixture-table read, negative write, nextval, startupGate or D12 execution is authorized. An empty risk result plus exact owner/table/function inventory is necessary, not sufficient, for operational acceptance. Preserve query failures rather than running alternative probes.

```sql
-- DOCUMENT DRAFT ONLY. No SQL or psql command in this document was executed.
-- This unconditional guard is intentional, not an installation option.
\echo REVIEW_ONLY_NOT_AUTHORIZED_DO_NOT_EXECUTE
\quit 3
-- Everything below is a proposed future separately reviewed extraction.
-- No current authorization permits removing the guard or executing the body.
\set ON_ERROR_STOP on
\set ECHO none
\set VERBOSITY terse

-- Required future operator bindings: approved_system_identifier,
-- approved_data_directory, approved_admin_role. No values are invented here.
-- These must come from an independently approved new-cluster receipt.
\if :{?approved_system_identifier}
\else
  \quit 3
\endif
\if :{?approved_data_directory}
\else
  \quit 3
\endif
\if :{?approved_admin_role}
\else
  \quit 3
\endif
SELECT current_setting('server_version_num')::integer = 180004
   AND inet_server_addr() = '127.0.0.1'::inet
   AND inet_server_port() = 55442
   AND current_user = session_user
   AND current_user::text = :'approved_admin_role'
   AND current_setting('data_directory') = :'approved_data_directory'
   AND (SELECT system_identifier::text FROM pg_control_system())
       = :'approved_system_identifier'
   AND (SELECT rolsuper FROM pg_roles WHERE rolname = current_user)
   AS exact_new_cluster_ok
\gset
\if :exact_new_cluster_ok
\else
  \quit 3
\endif

-- Admin-only CATALOG inspection in the new test DB; no SET ROLE runtime,
-- no runtime login, startupGate, fixture SELECT, workload or denial probe.
SET search_path = pg_catalog;
BEGIN READ ONLY;
DO $review$
BEGIN
  IF current_database() <> 'mcvplus_c5_roq_20261029' THEN
    RAISE EXCEPTION 'Wrong database';
  END IF;
END
$review$;
SELECT rolname,rolcanlogin,rolsuper,rolinherit,rolcreaterole,rolcreatedb,
       rolreplication,rolbypassrls,rolconnlimit
FROM pg_roles WHERE rolname IN
  ('c5_qualification_fixture_owner','c5_qualification_readonly');
-- MUST be empty: same frozen risk predicate, but evaluating the named role
-- from an administrative catalog session instead of a runtime session.

SELECT 'role_flags' AS risk FROM pg_roles WHERE rolname='c5_qualification_readonly'::name AND
 (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls OR rolinherit)
UNION ALL SELECT 'membership' FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name)
UNION ALL SELECT 'database_create_temp' FROM pg_database WHERE datallowconn AND
 (has_database_privilege('c5_qualification_readonly'::name,oid,'CREATE') OR has_database_privilege('c5_qualification_readonly'::name,oid,'TEMP'))
UNION ALL SELECT 'other_database_connect' FROM pg_database WHERE datallowconn AND datname<>current_database() AND has_database_privilege('c5_qualification_readonly'::name,oid,'CONNECT')
UNION ALL SELECT 'database_owner' FROM pg_database WHERE datdba=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name)
UNION ALL SELECT 'schema_create_or_owner' FROM pg_namespace WHERE nspname NOT LIKE 'pg_temp_%' AND
 (has_schema_privilege('c5_qualification_readonly'::name,oid,'CREATE') OR nspowner=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name))
UNION ALL SELECT 'relation_owner_or_write' FROM pg_class WHERE relkind IN ('r','p','v','m','f') AND
 (relowner=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name) OR
 has_table_privilege('c5_qualification_readonly'::name,oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'))
UNION ALL SELECT 'column_write' FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
 WHERE c.relkind IN ('r','p','v','m','f') AND a.attnum>0 AND NOT a.attisdropped AND
 has_column_privilege('c5_qualification_readonly'::name,c.oid,a.attnum,'INSERT,UPDATE,REFERENCES')
UNION ALL SELECT 'sequence_privilege' FROM pg_class WHERE relkind='S' AND
 (relowner=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name) OR has_sequence_privilege('c5_qualification_readonly'::name,oid,'USAGE,SELECT,UPDATE'))
UNION ALL SELECT 'function_execute_or_owner' FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE
 p.proowner=(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name) OR
 (has_function_privilege('c5_qualification_readonly'::name,p.oid,'EXECUTE') AND
 NOT (n.nspname='pg_catalog' AND p.oid::regprocedure::text = ANY(ARRAY[
  'has_database_privilege(name,oid,text)',
  'has_schema_privilege(name,oid,text)',
  'has_table_privilege(name,oid,text)',
  'has_any_column_privilege(name,oid,text)',
  'has_column_privilege(name,oid,smallint,text)',
  'has_sequence_privilege(name,oid,text)',
  'has_function_privilege(name,oid,text)',
  'hashtext(text)',
  'hashname(name)',
  'hashoid(oid)',
  'hashchar("char")',
  'hashint2(smallint)',
  'hashint4(integer)',
  'bttextcmp(text,text)',
  'btnamecmp(name,name)',
  'btoidcmp(oid,oid)',
  'btint2cmp(smallint,smallint)',
  'btint4cmp(integer,integer)',
  'btcharcmp("char","char")',
  'namene(name,name)',
  'chareq("char","char")',
  'int24gt(smallint,integer)',
  'int2gt(smallint,smallint)',
  'textne(text,text)',
  'anytextcat(anynonarray,text)',
  'textanycat(text,anynonarray)',
  'textcat(text,text)',
  'text(inet)',
  'text(name)',
  'pg_backend_pid()',
  'pg_stat_get_activity(integer)',
  'current_database()',
  'inet_server_addr()',
  'inet_server_port()',
  'current_setting(text)',
  'aclexplode(aclitem[])',
  'nameeq(name,name)',
  'texteq(text,text)',
  'int4eq(integer,integer)',
  'oideq(oid,oid)',
  'textlike(text,text)',
  'textnlike(text,text)',
  'nameeqtext(name,text)',
  'namelike(name,text)',
  'namenlike(name,text)',
  'regprocedureout(regprocedure)',
  'textin(cstring)',
  'textout(text)',
  'array_in(cstring,oid,integer)',
  'array_out(anyarray)'
]::text[])))
UNION ALL SELECT 'default_role_grant' FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a
 WHERE a.grantee IN (0,(SELECT oid FROM pg_roles WHERE rolname='c5_qualification_readonly'::name))
UNION ALL SELECT 'excess_user_relation_read' FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE c.relkind IN ('r','p','v','m','f') AND n.nspname NOT IN ('pg_catalog','information_schema') AND
 n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp_%' AND
 (has_table_privilege('c5_qualification_readonly'::name,c.oid,'SELECT') OR has_any_column_privilege('c5_qualification_readonly'::name,c.oid,'SELECT')) AND (n.nspname||'.'||c.relname) NOT IN
 ('c5_qualification.resource_marker','c5_qualification.members_fixture','c5_qualification.reservation_keys_fixture');

-- All 50 must resolve and have EXECUTE; metadata inspection only.
SELECT signature, to_regprocedure('pg_catalog.'||signature) AS oid,
       has_function_privilege('c5_qualification_readonly',
         to_regprocedure('pg_catalog.'||signature),'EXECUTE') AS permitted
FROM unnest(
ARRAY[
  'has_database_privilege(name,oid,text)',
  'has_schema_privilege(name,oid,text)',
  'has_table_privilege(name,oid,text)',
  'has_any_column_privilege(name,oid,text)',
  'has_column_privilege(name,oid,smallint,text)',
  'has_sequence_privilege(name,oid,text)',
  'has_function_privilege(name,oid,text)',
  'hashtext(text)',
  'hashname(name)',
  'hashoid(oid)',
  'hashchar("char")',
  'hashint2(smallint)',
  'hashint4(integer)',
  'bttextcmp(text,text)',
  'btnamecmp(name,name)',
  'btoidcmp(oid,oid)',
  'btint2cmp(smallint,smallint)',
  'btint4cmp(integer,integer)',
  'btcharcmp("char","char")',
  'namene(name,name)',
  'chareq("char","char")',
  'int24gt(smallint,integer)',
  'int2gt(smallint,smallint)',
  'textne(text,text)',
  'anytextcat(anynonarray,text)',
  'textanycat(text,anynonarray)',
  'textcat(text,text)',
  'text(inet)',
  'text(name)',
  'pg_backend_pid()',
  'pg_stat_get_activity(integer)',
  'current_database()',
  'inet_server_addr()',
  'inet_server_port()',
  'current_setting(text)',
  'aclexplode(aclitem[])',
  'nameeq(name,name)',
  'texteq(text,text)',
  'int4eq(integer,integer)',
  'oideq(oid,oid)',
  'textlike(text,text)',
  'textnlike(text,text)',
  'nameeqtext(name,text)',
  'namelike(name,text)',
  'namenlike(name,text)',
  'regprocedureout(regprocedure)',
  'textin(cstring)',
  'textout(text)',
  'array_in(cstring,oid,integer)',
  'array_out(anyarray)'
]::text[]
) AS requested(signature);

-- Required successor D12 dependency. Required result is Boolean TRUE.
-- No other function, monitoring role or grant-on-error is permitted.
SELECT has_function_privilege('c5_qualification_readonly',
  'pg_catalog.pg_stat_get_activity(integer)'::regprocedure,'EXECUTE')
  AS d12_dependency_required;

-- Existence/owner/schema/columns/types/collations/constraint metadata only.
SELECT e.name,c.relkind,c.relispartition,c.relrowsecurity,c.relforcerowsecurity,
 o.rolname AS owner,o.rolcanlogin AS owner_login,o.rolsuper AS owner_super,
 a.attnum,a.attname,a.atttypid,a.attnotnull,a.attidentity,a.attgenerated,a.attcollation,
 EXISTS(SELECT 1 FROM pg_attrdef x WHERE x.adrelid=c.oid) AS has_defaults,
 EXISTS(SELECT 1 FROM pg_policy x WHERE x.polrelid=c.oid) AS has_policies,
 EXISTS(SELECT 1 FROM pg_inherits x WHERE x.inhrelid=c.oid OR x.inhparent=c.oid) AS has_inheritance,
 EXISTS(SELECT 1 FROM pg_foreign_table x WHERE x.ftrelid=c.oid) AS has_foreign,
 EXISTS(SELECT 1 FROM pg_trigger x WHERE x.tgrelid=c.oid AND NOT x.tgisinternal) AS has_triggers,
 EXISTS(SELECT 1 FROM pg_rewrite x WHERE x.ev_class=c.oid) AS has_rules
 FROM (VALUES ('resource_marker'),('members_fixture'),('reservation_keys_fixture')) e(name)
 LEFT JOIN pg_namespace n ON n.nspname='c5_qualification'
 LEFT JOIN pg_class c ON c.relnamespace=n.oid AND c.relname=e.name
 LEFT JOIN pg_roles o ON o.oid=c.relowner
 LEFT JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
 ORDER BY e.name,a.attnum;
SELECT c.relname,t.contype,t.conkey FROM pg_constraint t JOIN pg_class c ON c.oid=t.conrelid
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='c5_qualification' AND c.relname IN
 ('resource_marker','members_fixture','reservation_keys_fixture');
-- Database/role defaults and grants: no password hashes or secret values.
SELECT d.datname,d.datallowconn,r.rolname AS owner,d.datacl
FROM pg_database d JOIN pg_roles r ON r.oid=d.datdba ORDER BY d.datname;
SELECT nspname,pg_get_userbyid(nspowner) AS owner,nspacl
FROM pg_namespace WHERE nspname IN ('public','c5_qualification');
SELECT c.relname,c.relkind,c.relacl,pg_get_userbyid(c.relowner) AS owner
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE n.nspname IN ('public','c5_qualification') ORDER BY n.nspname,c.relname;
COMMIT;
-- Retain results for independent review. A query error or unexpected row blocks;
-- no grant-on-error, retry, escalation or live negative test is implied.

```


### Explicit Phase C expected results — review criteria, not new probes

These are the acceptance conditions for the already proposed administrator catalog inventory. They add no test or runtime call. The independent reviewer must compare the complete retained results with the final reviewed inventory; NULL, missing, extra or contradictory evidence blocks acceptance. Successful psql exit, an empty output file or an unexamined query result is insufficient.

| Existing inventory | Required result under the successor contract |
|---|---|
| Role flags | Exactly the two named roles. Both NOLOGIN, NOSUPERUSER, NOCREATEDB, NOCREATEROLE, NOINHERIT, NOREPLICATION and NOBYPASSRLS. Runtime connection limit 4 as proposed; no role memberships or alternate inherited authority. Password NULL is a provisioning requirement; this packet does not query or emit password verifiers. If independent nonsecret provisioning evidence cannot establish it, leave it unresolved. |
| Frozen named-role risk query | Exactly zero risk rows; any row, query failure, missing result or inability to establish completion blocks. |
| Function inventory | Exactly 50 distinct requested signatures; all 50 resolve to non-NULL OIDs and have permitted=true. The complete set equals both decoded successor source sets, not merely the same count. Successor minus frozen must be exactly {pg_stat_get_activity(integer)} and frozen minus successor empty; duplicates are forbidden. No extra executable routine outside the set; the risk query and complete ACL review must support this. |
| D12 required dependency | Exactly one Boolean TRUE for pg_catalog.pg_stat_get_activity(integer). FALSE, NULL, missing, erroneous or contradictory output blocks acceptance. TRUE establishes only catalog authority, not D12 runtime compatibility, session continuity or campaign authorization. |
| Fixture relations | Exactly the three expected names/columns in frozen order: marker text NOT NULL; member uuid/text/text/text with only alias nullable; key text/text/boolean NOT NULL. Type OIDs 25/2950/16 and text default collation OID100; ordinary nonpartitioned relations, no defaults/RLS/policies/inheritance/foreign tables/user triggers/rules/generated/identity columns. Each belongs to the NOLOGIN, nonsuperuser fixture owner. |
| Constraints | Marker PK(1); member PK(1) plus UNIQUE(2); key PK(1,2). Only the expected PostgreSQL 18 NOT NULL metadata in addition. No extra CHECK/default/other constraint or additional column. |
| Schemas/probes/sequence | Exact dedicated schema owners and approved objects only. Existing negative probe table and sequence, no runtime SELECT/write on probe and no sequence USAGE/SELECT/UPDATE. Runtime public-schema USAGE is present so missing USAGE cannot be presented as the intended object-level denial. |
| Database/ACL/default inventory | Exact new-cluster databases and approved administrator owner; runtime CONNECT only to the dedicated DB, no CREATE/TEMP; only approved schema USAGE, three table SELECT grants and 50 function EXECUTE grants; no grant option or excess column/role/default/PUBLIC route. New routine defaults for both creators exclude PUBLIC EXECUTE. Preserve complete relevant inventories for comparison, not a command-exit-only certificate. |
| Overall disposition | Even all expected baseline inventory results establish proposed catalog consistency only. Runtime role stays disabled, provider/tunnel unstarted, D12 is statically aligned but runtime-unverified, operational confinement remains unverified, and no S/C/V/T permission follows. |

No extra catalog or workload queries are authorized by this table. If the existing inventory plus independently retained provisioning receipts cannot establish an item, record the specific evidence gap for later review rather than improvise a query or promote it to PASS.

### SQL review dispositions required

1. Confirm version/runtime/header/locale and exact function signatures against approved PostgreSQL 18.4 sources; do not execute SQL to resolve that question under this source-only task.
2. Review the exact Option A sole addition in both source sets, Phase B and both Phase C arrays. Requester visibility acceptance is restricted to the dedicated disposable cluster; the function is not own-session-only. Preserve D12/retained-Client/independent continuity byte-exactly and all strict predicates. No other role family, live grant, replacement query or silent fallback.
3. Check PUBLIC default privileges, builtin and sensitive catalogs, no excess function/sequence/column grants, no role membership, schema and database owner separation. Inspect grants as administrator; runtime negative probes belong to T.
4. Confirm that no unexpected implicit/default user object or extension is inherited from template0. Stop on mismatch; do not remove it to make the inventory pass.
5. Runtime NOLOGIN remains the deliberately disabled S state; later LOGIN/SCRAM/password placement and revocation are separate named actions. Do not execute a test login during S.
6. No approval is claimed for the newly drafted SQL. This is the exact baseline proposed for independent review; its runtime behavior is UNTESTED.

## 6. Conditional no-added-cost Firestore proposal — separate scope C

No separate owner-authored provisioning packet was provided for this turn. The following is the smallest conditional proposal derived from Candidate05's replay contract and current official documentation, NOT a claim that resources/permissions are available.

**Selection order:** first use an owner-verified, genuinely dedicated existing project/database that has no qualification/Alpha data and qualifies for unused no-cost capacity. If none exists, propose ONE new dedicated Firebase Spark project with its first and only Standard/Native `(default)` Firestore database. Suggested project name `mcvplus-c5-replay-test`; final globally unique project ID/number and parent are UNRESOLVED. Do not append suffixes or pick another project during execution. Review the exact target first.

- No Cloud Billing linkage or Blaze upgrade. Spark/no-payment eligibility, project creation quota, organization policies and billing-disabled enforcement are owner-dependent. If any prerequisite requires paid billing, deny it and return BLOCKED. Quotas are a ceiling, not a reason to silently enable billing. Do not count promotional credits as no-cost assurance.
- Region proposed `nam5`, matching the reported qualification database; owner must confirm availability/support and final selection before creation. Location/target is immutable for the campaign, not an env-selectable fallback. Future sealed-target code/build reconciliation is separate and cannot enable Candidate05 by flags alone.
- Resources proposed, only if separately authorized later: one project/Firebase binding if new; required Firestore/API enablement; one Standard/Native default database with deletion protection; one dedicated replay service account with no downloaded private key; one project custom role containing ONLY `datastore.entities.create`; one binding restricted to the exact approved database. No web app, Auth population, Storage bucket, hosting, functions, scheduled job, paid audit/logging export, TTL, PITR, backup, restore, clone or second database.
- Rules: default-deny mobile/web access in this replay-only database/project. Rules do not constrain server credentials; IAM is the server boundary. No changes to qualification or Alpha rules/indexes. Default automatic indexing only; no custom composite index required for deterministic creates. Preserve existing reader permissions exactly; do not add replay rights to it.
- Example policy DATA for later review, not a command: custom role ID `c5ReplayCreateOnly`; includedPermissions `["datastore.entities.create"]`; member `serviceAccount:<OWNER_APPROVED_REPLAY_ACCOUNT_EMAIL>`; condition `resource.name == "projects/<OWNER_APPROVED_PROJECT_ID>/databases/(default)"`. This is database-scoped, NOT collection/document-scoped enforcement. It permits arbitrary document creates within that dedicated DB, not just 48 named claims. The trusted operator budget and sealed run/slot validation remain separate controls.
- Replay writer has no get/list/update/delete, schema/index/admin, IAM, token-creation, service-account impersonation or qualification/purchase access. Effective inherited owner/editor/group/service-agent bindings must be inspected by an authorized owner; absence of them cannot be inferred from the narrow custom role. Existing qualification reader has no replay create grant. A broad `roles/datastore.user` replacement is not acceptable.
- An approved operator may later obtain short-lived issued tokens for the dedicated principal using an owner-approved issuance path. Candidate05 uses issued tokens, not a runtime private key. Who may issue/impersonate and how token subject/expiry is evidenced are UNRESOLVED. No token/key generation or new impersonation authority is authorized here.
- Retain original replay claims without TTL/deletion/reset/restore/target replacement across redeployments and uncertainty. A new build must keep the same approved run+slot namespace. Do not create canaries or test documents during provisioning unless separately and explicitly budgeted; initial DB may be empty. No data smoke is included in C.

**Cost envelope:** documentation lists a single free database per project, 1 GiB storage, 20,000 writes/day, 50,000 reads/day and 10 GiB/month outbound. At most 48 successful unique claims for this one campaign are far below those published quotas; this is arithmetic, not account-specific capacity evidence. Failed/denied RPCs, SDK/control/metadata/logging fanout and other users still require owner budgeting. No promise of 48 total network packets or free paid logging is made. No-cost protection depends on the actual project remaining on a nonbilling plan and supported API/IAM behavior; 403 means unresolved, not consent to work around it.

| Owner-dependent fact | Evidence required before C approval |
|---|---|
| Exact resource and parent ownership | Sanitized project ID/number/parent and authority to create/use it; no Alpha or shared production relationship |
| No-added-cost enforcement | Actual Spark/no billing linkage, first-database eligibility, quota/headroom, no enabled paid addons or auto-upgrade requirement |
| Role capability and inherited access | Full relevant policy/custom-role/condition/group/organization review; service account effective create-only authority; qualification reader unchanged |
| Token issuance | Named existing supported operator path and approved principal/expiry evidence; no runtime provisioning/impersonation credentials |
| IAM/database support | Owner confirmation custom role and exact resource condition are available under the chosen nonbilling project/policies |
| Evidence/log access | Existing independent ingress/platform records can cover the attended campaign within included allowances/retention; no paid export assumed |
| Permanent control retention | No TTL, routine deletion, rollback, restore or target switch; responsible owner and evidence retention decisions |

Official IAM conditions are enforced through REST/client libraries; the console has different documented behavior and must not be used as the sole negative-access proof. Actual IAM mutation-denial tests, replay race and retained-token checks belong to separately approved T; catalog/metadata inspection is not their substitute. Do not assert a five-minute hard revocation deadline: Firestore permission caching and general IAM propagation are distinct; reconcile the provider's current guidance and the approved schedule. A role-change acknowledgement, local token expiry and +30-second quiet period are not proof of server-enforced revocation.

## 7. One bounded proposed local Setup scope S — not authorized

**Purpose:** install only the reviewed local qualification service footprint in a stopped/disabled state, optionally provision its new isolated SQL fixtures, and return confinement/containment receipts. It does not run the qualification campaign and does not establish hosted acceptance.

### Entry prerequisites

1. Wes's later written S authorization identifies exact source/config/SQL/binary hashes, executor, machine, target roots, service names, ports and maintenance window. It explicitly states whether PostgreSQL initialization is included. This document is not that authorization.
2. Independent SQL review is complete; the D12 Option A source/SQL disposition and exact successor manifest have been independently accepted. If unresolved, omit all database provisioning and return a partial file/service-only result; do not claim whole Setup ready. A separate reviewed continuation is required for retained partial resources.
3. Fixed target absence and parent/path/ACL/provenance readbacks succeed without altering shared ancestors. Record actual local administrator/service authority. Fresh inventory belongs to an authorized preflight, not this document task.
4. Exact finite config/loading/credential matrix and operator journal/evidence path are approved. No runtime data path feeds a more-privileged loader. Identify actual disk capacity/control policy without demanding an unqualified universal adversarial disk bound.
5. Bounded supported service/provisioning stop procedure, exact-owned process identity tracking and protected receipt destination are ready; uncertainties halt. No new custom supervisor/checker is introduced.

### Allowed proposed footprint and sequence

| Stage | Proposed action | Bound / result |
|---|---|---|
| S0 | Read-only input, target, binary, parent ACL, service/port and existing-Alpha baseline inventory | At most initial/apply/final snapshots per named object/config; no canary/login/HTTP/SDK/denial smoke. Failed prerequisite ends before mutations. |
| S1 | Create only approved `C:\Program Files\MCVQ5-20261029` and `C:\ProgramData\MCVQ5-20261029` dedicated roots and reviewed subdirectories; copy finite approved payload | Exclusive creation; collision/reparse/unknown owner or shared replacement authority stops. Admin/SYSTEM code/config/control; separate runtime writable data only. No historical installer wholesale, source links, caches, automatic suffixes or parent ACL repair. |
| S2 | Register exact services `MCVQ5Postgres1029`, `MCVQ5Provider1029`, `MCVQ5Tunnel1029` with their virtual-account SIDs and approved existing wrapper | Disabled/Stopped; no restart/trigger/autostart. Exact code/RX, own-secret read, own-state Modify, no lifecycle/config authority. Provider/tunnel remain unstarted and may stay unconfigured. |
| S3, optional | Only if specifically approved, initialize new PG 18.4 cluster at approved data path; start PG alone on 127.0.0.1:55442 for admin provisioning and catalog inventory using reviewed extraction of SQL A/B/C | No old 55432 cluster. Provision credentials/login omitted in this proposed scope. Runtime role NOLOGIN/password NULL. No fixture workload/negative query or provider startupGate. Fixed administrator statements only; no runtime acceptance claimed. |
| S4 | Stop/disable exact new services and owned provisioning children; collect final configuration/ACL/catalog/payload/containment receipts | PID0/no owned descendants/listeners/connectors, independently read back. Preserve partial resources and logs; no deletion or retry. |

**Proposed numerical bounds for review:** one attended invocation, maximum 45 minutes; initial preflight maximum 10 minutes. Any one service-control/provisioning command maximum 60 seconds; once per command, no automatic retries. Stop/termination collection maximum 30 seconds plus one independent final identity/listener readback. Earlier campaign per-check bounds are not silently reused as Setup deadlines. Use existing supported command timeouts; if an operation cannot be contained by existing tools within the approved bound, exclude that operation or stop for scoped review—do not build another supervisor. No process-name or port sweep. These new proposed S bounds need explicit acceptance, not an assertion that Windows honors hard scheduling guarantees.

PG listens only during optional administrator provisioning. No actual operator slot or replay claim is created. No real secret, signing key, credential issuance or role LOGIN is included. The three services finish disabled; an unconfigured tunnel is an honest partial state, not gateway qualification.

### Partial-Setup containment and stop conditions

- Before each mutation, record intent and exact newly owned resource identity in protected receipts; after success, record concrete identity/hash/state. Stop if receipt persistence or resource attribution is uncertain.
- Stop on wrong machine/target/binary/version/system identifier; path/service/account/port/database collision; unexpected inheritance/reparse/parent replacement; missing permissions; unexpected SQL rows/errors; unknown existing resource; storage/evidence failure or timeout. Never suffix, adopt, grant broadly, repair shared ACLs or retry into a partial installation.
- On failure, cease subsequent provisioning; stop/disable only services created by that S invocation and collect only exact owned PG/provisioning processes. Preserve the primary failure and separate cleanup/cessation uncertainty. A stop request or taskkill acknowledgement is not proof of exit.
- No cloud credentials/resources exist under proposed S; thus S grants no cloud revocation/IAM authority. If some later separately authorized scope creates credentials, its containment authority must name those exact new IDs. Never disable shared credentials to compensate for local failure.
- Retain partial files, new cluster, stopped services, logs and receipts. No DROP, deletion, rollback to old snapshots, history reset, ledger refund, automatic retry or resource replacement. A dedicated-object grant may be suspended only if explicitly named in the later S containment authorization and attributable to that invocation.
- If exact cessation cannot be verified within the bound, record residual PID/start/service/listener uncertainty and return BLOCKED. Request only the concrete remediation needed. Do not claim a whole-machine or remote census.

### Explicit exclusions and independent scopes

S excludes Cloudflare DNS/tunnel/Access provisioning or connector startup, Firebase project/database/API/role/SA/token/rules/index changes, Vercel access changes/project/env/deploy/alias changes, hosted calls, browser tests, worker or provider startup, SQL runtime login/workload/denial tests, credential revocation tests, signing/private key/usable permit, purchase approval pin, intake activation, financial effects, paid services, reboot and deletion. Alpha/canonical remain unchanged. Recovery remains DISARMED and purchases OFF.

| Separate future scope | Can proceed only after | Never implied by S |
|---|---|---|
| C: replay cloud provisioning | Owner evidence + exact no-added-cost resource/policy proposal + separate approval | API/billing enablement, project/DB/SA/custom role/issued token, qualifier permission changes |
| V: disabled isolated preview deployment | Supported exact Vercel team/project/protection/log access, source/build/target review and separate approval | Canonical/Alpha changes, paid seat, source activation or usable permit |
| T: 42+6 qualification | Accepted S/C/V, narrowly reviewed source activation/bindings, credential/fault/revocation/cleanup authorities and campaign schedule | Fake-funded purchasing, financial recovery, no-login/reboot or real CREAM |

Local S is technically separable from replay/Vercel access. Whether to provision local services before those dependencies are resolved is an explicit scheduling choice for Wes; avoid presenting partial local installation as proof that hosted testing is now ready.

### Required S return receipt

Authorization ID and scope; exact original/installed source and binary hashes; copied inventory; named service SIDs/account/SID type, command/cwd/environment NAMES/restart/privileges/SCM security; root and subdirectory owner/ACL/parent evidence; PG system identifier/version/config/HBA paths/catalog privileges if S3 included; proposed versus actual journal/evidence paths; no secret values or password verifiers; every partial resource/error/containment action; final stopped/disabled/PID/start/descendant/listener evidence; scoped baseline comparison; S/C/V/T status separately. All 48 actual attempts remain untouched; no invented live no-spend proof.

## 8. One handoff request — no operational authorization

Obtain independent static review of this exact successor, especially the sole D12 activity addition and unchanged private-cluster PUBLIC routine revocations. Ask Jay only for supported owner evidence on replay project/cost/IAM and the exact Vercel project/log access. Return their dispositions and missing concrete inputs together, then bind one final S authorization packet. Do not implement a new checker, expand or execute tests, change Candidate05, execute SQL or provision resources in response to this document. Source-only acceptance conveys no S/C/V/T permission.

## 9. Sources and evidence limits

Pinned source links (all at commit `f7d2fe369098589364abcac9a7af7992d90042c2`):

- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/SETUP-PACKET.md
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/SETUP-INDEPENDENT-REVIEW.md
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/local-service/provider/readonly-db.mjs
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/driver/provider-contract.mjs
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/driver/clients.mjs
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/driver/cases.mjs
- https://github.com/jaybmcv/mcvplus-c5-review-20261030/blob/f7d2fe369098589364abcac9a7af7992d90042c2/candidate05/REPLAY-DEPENDENCY.md

Official semantics reviewed on 31 October 2026:

- PostgreSQL 18 CREATE VIEW, Notes: https://www.postgresql.org/docs/18/sql-createview.html — function EXECUTE checked for view callers.
- PostgreSQL 18 statistics functions: https://www.postgresql.org/docs/18/monitoring-stats.html — pg_stat_get_activity and own-session statistics.
- PostgreSQL 18.4 system_views.sql: https://github.com/postgres/postgres/blob/REL_18_4/src/backend/catalog/system_views.sql — actual pg_stat_activity definition.
- PostgreSQL 18 REVOKE: https://www.postgresql.org/docs/18/sql-revoke.html — PUBLIC/direct and object permissions.
- PostgreSQL 18 ALTER DEFAULT PRIVILEGES: https://www.postgresql.org/docs/18/sql-alterdefaultprivileges.html — future grants distinct from existing grants; global PUBLIC defaults require global revocation.
- PostgreSQL 18 CREATE DATABASE: https://www.postgresql.org/docs/18/sql-createdatabase.html — template0 and nontransactional database creation.
- Firebase pricing: https://firebase.google.com/pricing — Spark/nonbilling and Standard quotas.
- Firestore pricing: https://firebase.google.com/docs/firestore/pricing — one free database/project and paid features.
- Firebase pricing-plan behavior: https://firebase.google.com/docs/projects/billing/firebase-pricing-plans — billing linkage/Blaze and quota constraints.
- Firestore server IAM: https://docs.cloud.google.com/firestore/native/docs/security/iam — createDocument requires datastore.entities.create; server clients use IAM.
- Firestore manage databases: https://docs.cloud.google.com/firestore/native/docs/manage-databases — per-database IAM conditions and console caveat.

This document establishes proposed text and source-level compatibility analysis only. SQL was not parsed by PostgreSQL, connected, executed or tested. No claim of effective live IAM, no-cost account eligibility, installed ACLs, cold/idle execution, cached-token/DB-session revocation, hard timeout containment, restart/no-login/reboot acceptance, backup/restore or financial readiness is made.
