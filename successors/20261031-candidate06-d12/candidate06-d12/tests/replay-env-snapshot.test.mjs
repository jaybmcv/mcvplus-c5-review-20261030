import test from 'node:test';
import assert from 'node:assert/strict';
import {captureReplayEnvironment,createReplayStore} from '../app/qualification/replay.mjs';
test('replay namespace and separate writer credentials are captured before async boundaries; unbound source still rejects',async()=>{
 const input={C5_REPLAY_PROJECT:'synthetic-original-project',C5_REPLAY_DATABASE:'original',C5_REPLAY_CLIENT_EMAIL:'SYNTHETIC-writer',C5_REPLAY_ISSUED_TOKEN:'SYNTHETIC-writer-token',C5_REPLAY_TOKEN_EXPIRES_AT:String(Date.now()+60000),C5_FIREBASE_CLIENT_EMAIL:'SYNTHETIC-reader',C5_FIRESTORE_ISSUED_TOKEN:'SYNTHETIC-reader-token',GOOGLE_APPLICATION_CREDENTIALS:'SYNTHETIC-forbidden-ambient'};
 const captured=captureReplayEnvironment(input);
 const admission=createReplayStore(input);
 input.C5_REPLAY_PROJECT='synthetic-replacement-project';input.C5_REPLAY_DATABASE='replacement';input.C5_REPLAY_ISSUED_TOKEN=input.C5_FIRESTORE_ISSUED_TOKEN;
 await Promise.resolve();
 assert.equal(captured.C5_REPLAY_PROJECT,'synthetic-original-project');assert.equal(captured.C5_REPLAY_DATABASE,'original');assert.equal(captured.C5_REPLAY_ISSUED_TOKEN,'SYNTHETIC-writer-token');assert.notEqual(captured.C5_REPLAY_ISSUED_TOKEN,captured.C5_FIRESTORE_ISSUED_TOKEN);
 assert.equal(Object.hasOwn(captured,'GOOGLE_APPLICATION_CREDENTIALS'),false);assert.ok(Object.isFrozen(captured));assert.throws(()=>captured.C5_REPLAY_PROJECT='replacement');
 await assert.rejects(admission,/immutable replay target unbound or mismatch/);
});
