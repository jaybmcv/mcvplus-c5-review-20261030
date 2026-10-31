// No credential loading, no imports with network side effects. Inject reviewed clients.
// These adapters make exactly ONE named method call, never retry. A malicious or
// reconnecting injected client is outside this source-level guarantee; Setup must
// verify the actual transport/client options and issued-token no-refresh behavior.
export function adapters({http,sdk,db,request,document,statement}) {
 return {
  async http(context){if(typeof http!=='function')throw Error('HTTP adapter missing');return http(request,context);},
  async sdk(context){
   if(!sdk||typeof sdk.getDocument!=='function')throw Error('SDK adapter missing');
   const [value]=await sdk.getDocument(document,{retry:null,timeout:5000});
   return {status:'200',value,context};
  },
  async db(context){
   if(!db||typeof db.query!=='function')throw Error('DB adapter missing');
   try {const value=await db.query(statement);return {status:'OK',value,context};}
   catch(e){if(typeof e.code==='string'&&/^[0-9A-Z]{5}$/.test(e.code))return {status:e.code,context};throw Error('DB acknowledgement unknown');}
  }
 };
}
// Concrete native HTTPS once-only adapter. No redirects, redirects are outcomes.
// Optional expected denials are still counted by Campaign before this is entered.
export async function httpsOnce(request,{dispatchId}) {
 if(!request||new URL(request.url).protocol!=='https:')throw Error('HTTPS only');
 const {request:send}=await import('node:https');
 return new Promise((resolve,reject)=>{
  let timer;
  const done=value=>{clearTimeout(timer);resolve(value);};
  const fail=error=>{clearTimeout(timer);reject(error);};
  const r=send(request.url,{method:request.method??'POST',headers:request.headers,agent:false},res=>{
   let size=0;
   res.on('data',b=>{size+=b.length;if(size>65536)res.destroy(Error('response bound'));});
   res.once('error',fail);
   res.once('end',()=>done({status:String(res.statusCode),dispatchId}));
  });
  timer=setTimeout(()=>r.destroy(Error('uncertain elapsed deadline')),15000);
  r.once('error',fail);r.end();
 });
}
