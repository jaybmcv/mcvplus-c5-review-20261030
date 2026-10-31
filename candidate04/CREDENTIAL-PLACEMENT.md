# Credential placement and fanout inventory
No real credential was read, loaded, changed or tested.
| Holder | Required credential / authority | Explicitly absent |
|---|---|---|
| Operator | invocation+perimeter caller secrets; permit signing private key (future only); deployment protection caller input if required | no credential forwarded wholesale to services |
| Hosted route parent | invocation+perimeter verifiers, permit PUBLIC key; replay-writer identity/key | signing private key; PG admin; purchase/Alpha credentials |
| Hosted worker | provider bearer+perimeter, Cloudflare Access client ID/secret; qualification Firestore reader identity/key | replay identity/key, invocation caller secrets, signing key, ADC, admin/deployment authority |
| Provider | incoming bearer+perimeter verifiers; local readonly SQL credential | Cloudflare hosted-caller token; Firebase keys; operator invocation/signing inputs; Vercel/admin credentials |
| PostgreSQL | dedicated OS-service rights; own cluster files | operator ledger and admin/migration credential files |
| Tunnel | own connector credential | Cloudflare Access caller token or zone-wide admin key |
| Direct SDK probe | explicitly issued nonrefreshing qualification token/client | replay writer, refresh path, ADC |
| Direct DB probe | exact existing nonreconnecting readonly Client or one fresh denied-login attempt | pool/reconnect loop, migration/admin login |

## Replay write separation (new Setup prerequisite, not provisioned)
Use existing firebase-admin@14.2.0 v1.FirestoreClient createDocument with retry:null, deterministic SHA256(runId,slot) document key. Claim before worker creation; ALREADY_EXISTS ->409, uncertain/store failure ->503. No worker in either case; never delete or release claim, including child failure. Key excludes deployment/build so same run cannot reset by redeploying.
New environment NAMES only: C5_REPLAY_PROJECT, C5_REPLAY_DATABASE, C5_REPLAY_CLIENT_EMAIL, C5_REPLAY_PRIVATE_KEY. Distinct principal/key AND database from qualification readonly project/database. Explicit credentials only, no ADC; never copied to child allowlist.
The code rejects same qualification database, missing explicit identities, same email/key. Those comparisons are NOT IAM proof: later Setup must show writer's effective inherited grants are limited to create on replay database, cannot update/delete/read qualification data or mutate IAM, and qualification reader cannot create replay records. Firestore IAM is NOT falsely described as collection-scoped.
An existing isolated separate replay database on supported no-additional-paid capacity must be identified and approved. Availability/price/DB-scoped IAM remain unverified. If no supported existing capacity can supply this, hosted execution stays blocked; do not add paid storage or another broker. No database/account/role/key created here.
Firestore SDK may perform bounded auth-token acquisition; it is metadata/control fanout, not a hidden qualification read. Library retry:null controls data RPC only, not a proof of zero auth transport retries. Actual library/client options must be reviewed before activation.

## Expected named-dispatch fanout
48 is authorized campaign dispatch budget:42 primary +6 reserved (V1=43,V2=44,V3=45,V4a=46,V4b=47,V5=48). Named HTTP, direct SDK or DB dispatch consumes one slot before sending, even denial/failure/retry. Primary retries displace coverage; fixed V slot cannot be retried without a separately approved allocation revision within48. No automatic retry/refund.
- Hosted HTTP: one operator POST; ingress/auth denial may end immediately; accepted route adds one replay create; if newly claimed, one child with provider HTTPS GET + local SQL validation/member read and Firebase canary GetDocument (plus library auth/TLS/DNS activity).
- Direct HTTP: one named request to exact approved target, no redirect/resend; no worker fanout unless that route normally creates it.
- Direct SDK: one getDocument with retry:null and bounded timeout; retained issued-token auth must not refresh. No replay write credential.
- Direct DB: one named workload statement (or one fresh login); B7 negatives retain individually counted BEGIN/statement/ROLLBACK protocol from campaign specification, not a hidden seven-statement batch. Transaction setup/rollback/validation fanout must be enumerated in the actual case adapter before later execution. Current injected DB adapter calls exactly one query; it does NOT implement those campaign-specific transactional probes.
- Cessation/control-plane evidence: bounded named administrative metadata only under separate approved scope. Never disguise business reads/credential probes as evidence.
Unexpected/replayed/unsolicited traffic remains visible in independently controlled platform/ingress records, not charged away or asserted impossible. Anomaly sink is structured platform logging; operator must correlate before every attended dispatch and invoke persistent halt on unplanned traffic. No claim of global instantaneous halt or universal network-request ceiling. Provider logs alone are not independent evidence. Missing log correlation/evidence blocks dispatch.

## Review clarifications
Replay uniqueness prevents repeat(run,slot), NOT different-slot parallelism by someone bypassing the trusted operator. Hosted campaign-wide single-flight is not asserted. Operator active fencing serializes authorized calls; unslotted/unexpected traffic must halt attended operation after independent evidence.
The replay target database identity is part of the immutable campaign control record: do not switch database/project on redeployment or after uncertainty. No rollback/TTL/delete/replacement ledger. Setup must bind and protect this identity before test activation.
Gate/binding denials do not reach the replay anomaly sink; platform/ingress records must retain those denials as well as newly claimed unsolicited traffic. Source logger alone is insufficient.
