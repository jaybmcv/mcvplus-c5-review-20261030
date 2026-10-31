export type ReplayClaim = { claimed: boolean; code?: string };
export type ReplayStore = { claim(key: {runId: string; slot: number}): Promise<ReplayClaim>; close?(): Promise<void> };
export type AdmissionOptions = {
 run?: (job: unknown, env: NodeJS.ProcessEnv, signal?: AbortSignal) => Promise<Record<string, unknown>>;
 replay?: ReplayStore;
 anomaly?: (event: {event: string; runId: string; slot: number}) => Promise<unknown>;
 deadline?: number;
 admissionMs?: number;
};
export function handle(request: Request, binding: Record<string, any>, env: NodeJS.ProcessEnv, options?: AdmissionOptions): Promise<Response>;
export function bounded<T>(start: () => Promise<T>, deadline: number, signal?: AbortSignal): Promise<T>;
export function processIdentity(): {id: string; initializedAt: string; sequence: number};
