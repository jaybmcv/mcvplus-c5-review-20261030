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

