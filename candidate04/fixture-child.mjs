import {Campaign} from './operator.mjs';
const [file,run,mode]=process.argv.slice(2);
const c=new Campaign(file,run);
const observe=async({dispatchId})=>({dispatchId,ceased:true,receipt:'SYNTHETIC-independent-cessation'});
if(mode==='crash') {
 await c.dispatch({caseId:'A1',kind:'http',expected:['200'],authorization:'SYNTHETIC-child'}, {http:async()=>{process.send?.('entered');process.exit(23);}},observe);
}else {
 try {
  await c.dispatch({caseId:'A2',kind:'http',expected:['200'],authorization:'SYNTHETIC-child'},{http:async()=>{await new Promise(r=>setTimeout(r,40));return {status:'200'};}},observe);
  process.send?.('sent');
 }catch {process.send?.('blocked');}
 c.close();
}
