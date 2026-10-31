import {performance} from 'node:perf_hooks';
export function budget(milliseconds,now=()=>performance.now()){
 const end=now()+Math.max(0,milliseconds);
 return Object.freeze({remaining:()=>Math.max(0,end-now()),check:()=>{if(now()>=end)throw Error('deadline');}});
}
export const asBudget=value=>typeof value==='number'?budget(value-Date.now()):value;
