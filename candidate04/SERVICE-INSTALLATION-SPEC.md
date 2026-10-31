# Conventional service installation specification — NOT an installer
Status: local planning deliverable only. No installation, staging, probing or service changes authorized/performed.
Supersedes custom checker/supervisor proposals only; does not qualify Candidate03.

## Fixed target / collision policy
Retain original proposed roots: C:\Program Files\MCVQ5-20261029 and C:\ProgramData\MCVQ5-20261029.
Retain proposed names MCVQ5Postgres1029, MCVQ5Provider1029, MCVQ5Tunnel1029 and dedicated ports 55442 PostgreSQL / 55443 provider on loopback only. These are proposed, NOT freshly verified available.
Never adopt collided files/services/accounts/ports/databases. Later authorized Setup checks exact occupancy and aborts on any collision.
No shared ancestor ACL rewrites, old cluster use, source/evidence overwrite or Alpha/other services changes.

## Service boundary
| Service | Identity / executable | Writable state | Readable protected inputs |
|---|---|---|---|
| PostgreSQL | NT SERVICE\MCVQ5Postgres1029; pinned PostgreSQL supported pg_ctl runservice | own cluster/data/log directories only | pinned executable/config; own DB service inputs |
| Provider | NT SERVICE\MCVQ5Provider1029; existing pinned NSSM only if Node needs wrapper | provider data/log/replay only | code; incoming bearer/perimeter verifier; local readonly DB login |
| Tunnel | NT SERVICE\MCVQ5Tunnel1029; existing pinned NSSM/cloudflared | dedicated connector logs/state only | pinned ingress config and own connector credential |
| Operator (not a service) | separately controlled administrator/operator | campaign SQLite journal + sidecars and protected evidence | invocation/perimeter caller inputs and signing key; targeted direct-probe credentials |
No identity may manage another service or rewrite service registry/config/code. Nonadmin runtime identities have no SCM management or administrator membership.
Admin/SYSTEM own code/config/secret/control and operator journal parents; runtime RX code, R only its own secrets, Modify only its own isolated mutable directories. Runtime-readable secrets are not confidential from that runtime.
No privilege-generalizing ACL checker, privilege broker or supervisor is added.

## Files / execution / PostgreSQL
Protected code includes wrapper, Node/PG/cloudflared executable trees and dependencies. Protected configs outside mutable state, including wrapper environment/cwd, provider configuration and PG postgresql.conf/pg_hba.conf.
Mutable PG cluster is NOT equivalent to readonly SQL confinement: PostgreSQL OS service can modify cluster files and may discover configuration/loading routes. Explicitly review cluster postgresql.auto.conf, extensions/shared_preload_libraries/local_preload_libraries/session_preload_libraries, dynamic_library_path, external paths, tablespaces, archive/restore commands, log destinations, service working directory and DLL search path.
Do not claim exact-filename confinement or storage bounds from rotation. No code/config/DLL/privileged load from provider/tunnel mutable data; no control records/attempt counters there. No privileged consumer trusts service-created paths or links/reparse points. Shared-parent replacement/deletion must be excluded. Existing enforceable storage controls must be demonstrated, or storage exhaustion remains a documented risk and execution blocker if a hard bound is required.
SQL runtime role: nonowner/nonsuperuser, no inherited write/admin/grant roles or write-capable privileged routines. Readonly defaults supplement actual privileges. Migration/admin credentials absent from every runtime. Database/IAM mutation-denial acceptance separate from OS service confinement.
No broad revocation/grant changes in existing clusters.

## Disabled Setup end state (future separately authorized work)
All three new services Stopped/Disabled, PID0 and no owned descendants/listeners/connectors. No SCM/NSSM auto restart. Existing roots kept, no recovery monitor. App candidate activation fence false; no usable permit/private key generated here. Purchases OFF; recovery DISARMED; approval pin UNSET.
Setup must explicitly cover partial-Setup containment for exact new identities, and bounded metadata/catalog checks. Never include HTTP, runtime-login, canary, SDK or qualification smoke in Setup.
PostgreSQL may only be provisioned transiently if that later Setup authorization explicitly allows it; provider/tunnel remain stopped. No installation commands are supplied or executed here.

## Operator journal and recovery
Candidate uses Node 24 built-in SQLite, retained rollback journal PERSIST + synchronous FULL, atomic commit before dispatch. Logical active owner persists through dispatch/evidence; concurrent attempts reject, not queue. Crash after commit, even before transport, conservatively consumes the slot. Corrupt/unavailable journal fails closed. The .sqlite file, -journal and parent need protected local stable storage and no rollback/restore/reset.
SQLite Windows VFS supplies supported fsync/FlushFileBuffers durability, conditional on filesystem/drive honoring flushes. Current synthetic process-kill tests are NOT a power-loss test. Review actual Node/SQLite/VFS and storage behavior before operational use; network/cloud-synced/removable journal storage not accepted.
Active/uncertain/HALTED is terminal in candidate. recoveryReport only inspects and returns resumeAllowed:false. No clear/reset/refund/reissue API. Resolution requires separate operator evidence of exact remote cessation and separately reviewed continuation that retains consumed history; no automated recovery is introduced.
Candidate filename/run guards accept SYNTHETIC only. Removing those guards and selecting/protecting the actual ledger is separately reviewed integration, not authorized operational staging now.

## Journal schema compatibility
Only current-schema synthetic journals are accepted for these fixtures. Prior round-one synthetic journals are retained as evidence and are NOT migrated/reset/reused. Missing authorization columns cause insertion failure before transport. No actual campaign ledger was created or upgraded. Any future real-ledger schema migration requires a separately reviewed, history-preserving specification.
## Response envelope
The disabled candidate route reserves at most14s for initialization/admission/worker collection, <=100ms for cleanup, and >=900ms nominal response margin within maxDuration15. Event-loop/platform termination behavior still needs later hosted acceptance; no hard scheduling guarantee is inferred from timers.
