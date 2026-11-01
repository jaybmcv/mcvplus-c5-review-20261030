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

