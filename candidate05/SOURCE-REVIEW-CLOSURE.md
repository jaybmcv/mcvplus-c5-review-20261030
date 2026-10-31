# Round-one source dispositions for independent verification

The parent-owned INDEPENDENT-SOURCE-REVIEW-ROUND1.md remains unchanged. These are builder dispositions against its frozen snapshot, not an independent acceptance verdict. Final app identity and tests are in BUILD-RESULT.md.

| Finding | Source disposition | Local verification |
| --- | --- | --- |
| 1. Pinned auth interface | Static getUniverseDomain() added, with no ADC or refresh. | Real pinned v1 initialize/GAX createStub executes against an inert protobuf constructor; a real GAX UNAVAILABLE path has no data retry. |
| 2. Raw vs semantic denial | D2/D3 and D5/D6 preserve incoming503; only correlated provider401/approved edge status derives semantic denial. Generic503 and correlation mismatch HALT. | Integrated named fixtures persist raw503 plus semantic401/ACCESS_DENIED and reject unsupported evidence. |
| 3. Lost response identity | Bounded allowlist retains actual correlation, parent/init/sequence, worker/SDK and deployment/run/slot identity; arbitrary body/header data is discarded. | Sanitization fixture plus actual parent comparison; positive warm booleans cannot override changed response identity. |
| 4. Mutable replay target | Sealed frozen replay-binding.json is disabled/UNBOUND; environment must match its immutable project/database/run before client creation. | App integration refuses both proposed and replacement environment namespaces without any data request. |
| 5. Config excluded from build | All immutable run/provider/replay configuration is hashed; only run/provider self buildId fields are normalized out. | Three mutation checks, source digest recomputation, exact source/copy hashes and Next BUILD_ID equality. |
| 6. Lazy/late SDK send | One absolute budget covers factory/initialize/auth/RPC; initialization precedes final send check. Timeout closes pending clients and late initialization is closed again. Native invocation transformer and finite RPC deadline reject late dispatch. | Delayed initialize and factory/session fixtures make zero late getDocument calls. |
| 7. Contradictory fanout | Reserved-remote, acknowledged-local and independently observed execution are distinct. Known sends, required success branches, denial prefixes and statuses must agree. Actual inventory is durable in the completion transaction. | Contradictory all-false/missing-branch failures, valid zero-dispatch suffix, and result-storage trigger failure retaining active unknown. |
| 8. D12 function allowlist | Exact pg_backend_pid() signature is included. SETUP-SOURCE-DELTA.md supplies the parent-owned grant/inventory follow-up. | Exact signature fixture; no SQL grant or operational PostgreSQL test was run. |

Additional direct checks cover D12 marker mismatch closing the untrusted Client and a nonsettling pg close destroying only its owned stream within a bound. No mock, initializer stub, emulator or local socket closure is presented as effective IAM/revocation/remote-cessation acceptance. Optional Windows process-tree stress remains environment-blocked with retained failure receipts.
