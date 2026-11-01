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

