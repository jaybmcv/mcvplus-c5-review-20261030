// Separate candidate; no installed provider/createServices initialization.
import fs from 'node:fs';
import {createProvider} from './server.mjs';
async function main(){
 const binding=JSON.parse(fs.readFileSync(new URL('../config/provider-binding.json',import.meta.url),'utf8').replace(/^\uFEFF/,''));
 if(binding.enabled!==true||process.env.C5_PROVIDER_ENABLED!=='true'||typeof process.env.C5_READONLY_DB_PASSWORD!=='string'||process.env.C5_READONLY_DB_PASSWORD.length<24)throw Error('disabled');
 const {Client}=await import('pg');
 const db=new Client({host:'127.0.0.1',port:55442,database:'mcvplus_c5_roq_20261029',user:'c5_qualification_readonly',ssl:false,
  password:process.env.C5_READONLY_DB_PASSWORD,application_name:'c5-readonly-candidate',connectionTimeoutMillis:1500,
  statement_timeout:2000,query_timeout:2500,idle_in_transaction_session_timeout:2000,options:'-c default_transaction_read_only=on -c search_path=pg_catalog'});
 let server,stopping=false;
 const shutdown=async()=>{if(stopping)return;stopping=true;server?.closeAllConnections();if(server)await new Promise(r=>server.close(r));try{await db.end();}catch{};};
 db.on('error',()=>{void shutdown().finally(()=>{process.exitCode=78;});});
 try{
  await db.connect();
  server=await createProvider({db,binding,bearer:process.env.C5_READONLY_PROVIDER_BEARER,perimeter:process.env.C5_PROVIDER_PERIMETER_SECRET,
   slotsDirectory:binding.slotsDirectory,logDirectory:binding.logDirectory});
  server.on('error',()=>{void shutdown().finally(()=>{process.exitCode=78;});});server.listen(55443,'127.0.0.1');
  process.once('SIGTERM',()=>void shutdown());process.once('SIGINT',()=>void shutdown());
 }catch{await shutdown();throw Error('startup denied');}
}
main().catch(()=>{process.stderr.write('{"code":"provider_startup_denied"}\n');process.exitCode=78;});
