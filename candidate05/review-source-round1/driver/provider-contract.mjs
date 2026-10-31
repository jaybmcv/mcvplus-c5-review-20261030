import {RESOURCE} from '../app/qualification/constants.mjs';
export const IDENTITY_SQL = `SELECT current_user AS role, current_database() AS database, inet_server_addr()::text AS host,
 inet_server_port() AS port, current_setting('default_transaction_read_only') AS readonly`;
// Each query is SELECT only. has_*_privilege includes effective PUBLIC and inherited grants.
// Any non-system function outside a short exact pure allowlist, including SECURITY DEFINER,
// is rejected. All catalog function execution also requires the reviewed whitelist below.
export const PRIVILEGE_SQL = `
SELECT 'role_flags' AS risk FROM pg_roles WHERE rolname=current_user AND
 (rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication OR rolbypassrls OR rolinherit)
UNION ALL SELECT 'membership' FROM pg_auth_members WHERE member=(SELECT oid FROM pg_roles WHERE rolname=current_user)
UNION ALL SELECT 'database_create_temp' FROM pg_database WHERE datallowconn AND
 (has_database_privilege(current_user,oid,'CREATE') OR has_database_privilege(current_user,oid,'TEMP'))
UNION ALL SELECT 'other_database_connect' FROM pg_database WHERE datallowconn AND datname<>current_database() AND has_database_privilege(current_user,oid,'CONNECT')
UNION ALL SELECT 'database_owner' FROM pg_database WHERE datdba=(SELECT oid FROM pg_roles WHERE rolname=current_user)
UNION ALL SELECT 'schema_create_or_owner' FROM pg_namespace WHERE nspname NOT LIKE 'pg_temp_%' AND
 (has_schema_privilege(current_user,oid,'CREATE') OR nspowner=(SELECT oid FROM pg_roles WHERE rolname=current_user))
UNION ALL SELECT 'relation_owner_or_write' FROM pg_class WHERE relkind IN ('r','p','v','m','f') AND
 (relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) OR
 has_table_privilege(current_user,oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN'))
UNION ALL SELECT 'column_write' FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid
 WHERE c.relkind IN ('r','p','v','m','f') AND a.attnum>0 AND NOT a.attisdropped AND
 has_column_privilege(current_user,c.oid,a.attnum,'INSERT,UPDATE,REFERENCES')
UNION ALL SELECT 'sequence_privilege' FROM pg_class WHERE relkind='S' AND
 (relowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) OR has_sequence_privilege(current_user,oid,'USAGE,SELECT,UPDATE'))
UNION ALL SELECT 'function_execute_or_owner' FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE
 p.proowner=(SELECT oid FROM pg_roles WHERE rolname=current_user) OR
 (has_function_privilege(current_user,p.oid,'EXECUTE') AND
 NOT (n.nspname='pg_catalog' AND p.oid::regprocedure::text = ANY($1::text[])))
UNION ALL SELECT 'default_role_grant' FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) a
 WHERE a.grantee IN (0,(SELECT oid FROM pg_roles WHERE rolname=current_user))
UNION ALL SELECT 'excess_user_relation_read' FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE c.relkind IN ('r','p','v','m','f') AND n.nspname NOT IN ('pg_catalog','information_schema') AND
 n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp_%' AND
 (has_table_privilege(current_user,c.oid,'SELECT') OR has_any_column_privilege(current_user,c.oid,'SELECT')) AND (n.nspname||'.'||c.relname) NOT IN
 ('c5_qualification.resource_marker','c5_qualification.members_fixture','c5_qualification.reservation_keys_fixture')`;
export const PURE_FUNCTIONS=Object.freeze([
 'has_database_privilege(name,oid,text)','has_schema_privilege(name,oid,text)','has_table_privilege(name,oid,text)',
 'has_any_column_privilege(name,oid,text)','has_column_privilege(name,oid,smallint,text)','has_sequence_privilege(name,oid,text)','has_function_privilege(name,oid,text)',
 'hashtext(text)','hashname(name)','hashoid(oid)','hashchar(\"char\")','hashint2(smallint)','hashint4(integer)','bttextcmp(text,text)','btnamecmp(name,name)','btoidcmp(oid,oid)','btint2cmp(smallint,smallint)','btint4cmp(integer,integer)','btcharcmp(\"char\",\"char\")','namene(name,name)','chareq(\"char\",\"char\")','int24gt(smallint,integer)','int2gt(smallint,smallint)','textne(text,text)','anytextcat(anynonarray,text)','textanycat(text,anynonarray)','textcat(text,text)','text(inet)','text(name)','current_database()','inet_server_addr()','inet_server_port()','current_setting(text)','aclexplode(aclitem[])',
 // Exact immutable cast/operator helpers required by these catalog checks/parameter comparisons.
 'nameeq(name,name)','texteq(text,text)','int4eq(integer,integer)','oideq(oid,oid)','textlike(text,text)','textnlike(text,text)',
 'nameeqtext(name,text)','namelike(name,text)','namenlike(name,text)','regprocedureout(regprocedure)','textin(cstring)',
 'textout(text)','array_in(cstring,oid,integer)','array_out(anyarray)'
]);
export const MARKER_SQL='SELECT marker FROM c5_qualification.resource_marker';
export const MEMBER_SQL='SELECT id, discord_user_id, username_alias, status FROM c5_qualification.members_fixture WHERE discord_user_id = $1';
export const KEY_SQL='SELECT scope, idempotency_key, closed FROM c5_qualification.reservation_keys_fixture WHERE scope = $1 AND idempotency_key = $2';
export const EXPECTED_COLUMNS=Object.freeze({
 resource_marker:[['marker',25,true]],
 members_fixture:[['id',2950,true],['discord_user_id',25,true],['username_alias',25,false],['status',25,true]],
 reservation_keys_fixture:[['scope',25,true],['idempotency_key',25,true],['closed',16,true]]
});
export const RELATION_SQL=`SELECT e.name,c.relkind,c.relispartition,c.relrowsecurity,c.relforcerowsecurity,
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
 ORDER BY e.name,a.attnum`;
export const CONSTRAINT_SQL=`SELECT c.relname,t.contype,t.conkey FROM pg_constraint t JOIN pg_class c ON c.oid=t.conrelid
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='c5_qualification' AND c.relname IN
 ('resource_marker','members_fixture','reservation_keys_fixture')`;
export function validateRelations(rows,constraints){
 for(const [name,columns] of Object.entries(EXPECTED_COLUMNS)){
  const actual=rows.filter(r=>r.name===name);
  if(actual.length!==columns.length)throw Error('fixture column definition');
  for(let i=0;i<columns.length;i++){
   const r=actual[i],c=columns[i];
   if(r.relkind!=='r'||r.relispartition||r.relrowsecurity||r.relforcerowsecurity||r.owner!=='c5_qualification_fixture_owner'||r.owner_login||r.owner_super||
     r.has_defaults||r.has_policies||r.has_inheritance||r.has_foreign||r.has_triggers||r.has_rules||
     r.attnum!==i+1||r.attname!==c[0]||Number(r.atttypid)!==c[1]||r.attnotnull!==c[2]||r.attidentity!==''||r.attgenerated!==''||Number(r.attcollation)!==(c[1]===25?100:0))throw Error('unsafe fixture relation');
  }
  const expected=name==='members_fixture'?['p:1','u:2']:name==='resource_marker'?['p:1']:['p:1,2'];
  const local=constraints.filter(r=>r.relname===name);
  for(const r of local.filter(r=>r.contype==='n'))if(r.conkey.length!==1||columns[r.conkey[0]-1]?.[2]!==true)throw Error('unexpected not-null constraint');
  const keys=local.filter(r=>r.contype!=='n').map(r=>r.contype+':'+r.conkey.join(',')).sort();
  if(JSON.stringify(keys)!==JSON.stringify(expected))throw Error('fixture constraint definition');
 }
}
export async function startupGate(db,{testPort}={}) {
 const identity=(await db.query(IDENTITY_SQL)).rows;
 if(identity.length!==1||identity[0].role!=='c5_qualification_readonly'||identity[0].database!=='mcvplus_c5_roq_20261029'||
    !['127.0.0.1','127.0.0.1/32'].includes(identity[0].host)||identity[0].port!==(testPort??55442)||identity[0].readonly!=='on')throw Error('resource identity');
 if((await db.query(PRIVILEGE_SQL,[PURE_FUNCTIONS])).rows.length)throw Error('effective privilege denied');
 validateRelations((await db.query(RELATION_SQL)).rows,(await db.query(CONSTRAINT_SQL)).rows);
 const rows=(await db.query(MARKER_SQL)).rows;
 if(rows.length!==1||rows[0].marker!==RESOURCE)throw Error('resource marker');
}
