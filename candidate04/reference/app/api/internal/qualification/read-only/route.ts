import {handle} from '../../../../../qualification/handler.mjs';
import binding from '../../../../../config/run-binding.json';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=15;
import {resolveBinding} from '../../../../../qualification/gates.mjs';
export async function POST(request:Request){const bound=resolveBinding(request,binding,process.env); if(!bound)return Response.json({code:'disabled'},{status:404});return handle(request,bound,process.env);}
