import type {ReplayStore} from './handler.mjs';
export function createReplayStore(env: NodeJS.ProcessEnv): Promise<ReplayStore & {close(): Promise<void>}>;
export function closeReplay(store: ReplayStore | undefined, onFailure?: (event: {type: 'replay_cleanup_unverified'}) => void, milliseconds?: number): Promise<void>;
