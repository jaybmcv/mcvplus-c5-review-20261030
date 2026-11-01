import {NextResponse,type NextRequest} from 'next/server';
export function middleware(request:NextRequest){
 if(request.nextUrl.pathname!=='/api/internal/qualification/read-only')return NextResponse.json({code:'not_found'},{status:404});
 if(request.method!=='POST')return NextResponse.json({code:'method_denied'},{status:405,headers:{Allow:'POST'}});
 return NextResponse.next();
}
export const config={matcher:['/:path*']};
