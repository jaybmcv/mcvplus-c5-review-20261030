import {asBudget,budget} from './budget.mjs';
import http from 'node:http';
import https from 'node:https';
// Native transport owns all its sockets. No global fetch/agent, redirects or retries.
export function nativeHttp({deadline,headers={},origin,allowLoopback=false}) {
  const whole=asBudget(deadline),transport=budget(Math.min(5000,whole.remaining()));
  const agents={https:new https.Agent({keepAlive:false,maxSockets:1}),http:new http.Agent({keepAlive:false,maxSockets:1})};
  const sockets=new Set(),requests=new Set();
  async function send(url,init) {
    const target=new URL(url);
    whole.check();transport.check();
    if(init.method!=='GET'||init.body!==undefined||target.origin!==origin||
       !(target.protocol==='https:'||(allowLoopback&&target.protocol==='http:'&&target.hostname==='127.0.0.1')))throw Error('denied');
    return await new Promise((resolve,reject)=>{
      const client=target.protocol==='https:'?https:http;
      const options={method:'GET',headers:{...Object.fromEntries(new Headers(init.headers)),...headers},
        agent:target.protocol==='https:'?agents.https:agents.http,signal:init.signal};
      // No asynchronous or user-controlled preparation after this final clock check.
      whole.check();transport.check();
      const req=client.request(target,options,res=>{
        let done=false;
        const stream=new ReadableStream({start(controller){res.on('data',b=>{if(!done)controller.enqueue(new Uint8Array(b));});
          res.once('end',()=>{if(!done){done=true;controller.close();}});res.once('error',()=>{if(!done){done=true;controller.error(Error('native unavailable'));}});},
          cancel(){done=true;res.destroy();req.destroy();}});
        resolve(new Response(stream,{status:res.statusCode,headers:res.headers}));
      });
      requests.add(req);req.once('close',()=>requests.delete(req));
      req.on('socket',s=>{sockets.add(s);s.once('close',()=>sockets.delete(s));});
      req.setTimeout(Math.max(1,Math.min(5000,whole.remaining(),transport.remaining())),()=>req.destroy(Error('deadline')));
      req.once('error',()=>reject(Error('native unavailable')));
      try{whole.check();transport.check();req.end();}catch{req.destroy();reject(Error('deadline'));}
    });
  }
  return Object.freeze({send,close(){for(const req of requests)req.destroy();for(const s of sockets)s.destroy();agents.http.destroy();agents.https.destroy();},counts:()=>({sockets:sockets.size,requests:requests.size})});
}
