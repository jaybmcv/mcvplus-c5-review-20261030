// TYPE ONLY: erased; no purchase application implementation.
export type ReservationTransport = (request: Readonly<{method:"GET"|"POST";path:string;body?:unknown;beforeSend?:()=>Promise<()=>void>}>)=>Promise<{status:number;body:unknown}>;
