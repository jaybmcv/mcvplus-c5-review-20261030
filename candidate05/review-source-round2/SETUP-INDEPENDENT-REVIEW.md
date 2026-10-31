**Verdict: revise the documents for one Medium gap and one Low evidence overstatement.** The local Setup proposal is otherwise bounded and explicitly nonexecutable. The replay dependency correctly remains **BLOCKED**. This verdict covers these documents only and provides no operational acceptance.

Reviewed: `TASK.md`, `SETUP-PACKET.md`, `REPLAY-DEPENDENCY.md`, `evidence/REPLAY-METADATA.json`, `evidence/OTHER-PROJECT-INVENTORY.txt`, the three retained official documentation files, and their source index. App/driver implementation was excluded. No writes, delegation, credential access, network/cloud requests, service actions, installation, or tests were performed.

1. **Medium — documented IAM propagation delay is missing from the future revocation acceptance criteria.**

   Locations: [SETUP-PACKET.md:42](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/SETUP-PACKET.md:42), [SETUP-PACKET.md:46](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/SETUP-PACKET.md:46), and [REPLAY-DEPENDENCY.md:9](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/REPLAY-DEPENDENCY.md:9).

   The packet requires future revocation evidence and specifies cessation observations ending at +30 seconds. The retained official IAM documentation states that Firestore caches permissions and that a role change can take up to five minutes to become effective: [OFFICIAL-IAM.md:1019](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/evidence/OFFICIAL-IAM.md:1019).

   The documents do not expressly promise immediate revocation. The gap is that they leave the relationship between these two windows undefined. A revocation acknowledgement or quiet +30-second observation cannot establish that an already-issued token has lost Firestore authorization.

   **Concrete fix:** add the five-minute caveat to the dependency report and require a separately reviewed, cache-aware revocation schedule and expected outcomes before T. State explicitly that cessation observations and effective authorization revocation are separate evidence. Preserve the existing snapshot and 48-attempt limits; authorize no extra authentication probes as “inspection.” If the required result cannot be established within authorized bounds, leave T BLOCKED.

2. **Low — the summary compresses unavailable inventories into a stronger project-state description.**

   Locations: [SETUP-PACKET.md:39](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/SETUP-PACKET.md:39) and [REPLAY-DEPENDENCY.md:5](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/REPLAY-DEPENDENCY.md:5).

   The retained inventory contains three failed database-list commands with `SERVICE_DISABLED`, at [OTHER-PROJECT-INVENTORY.txt:13](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/evidence/OTHER-PROJECT-INVENTORY.txt:13), [line 29](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/evidence/OTHER-PROJECT-INVENTORY.txt:29), and [line 45](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/evidence/OTHER-PROJECT-INVENTORY.txt:45). These establish failed inventory access due to the Firestore API state; they do not establish database absence. The retained file also does not contain the successful project-list response supporting the description “ACTIVE.”

   The dependency report already disclaims an account-wide or organization-wide absence proof, which substantially limits the overstatement.

   **Concrete fix:** use: “Database inventories for three additional project IDs were unavailable: each list request returned `SERVICE_DISABLED` for the Firestore API. Database existence and capacity remain unknown.” Remove “ACTIVE” unless its existing sanitized project-list evidence is retained. Keep the conclusion “no eligible existing replay database identified,” rather than claiming none exists.

The remaining document boundaries are sound:

- **Proposal only; no installer execution.** [SETUP-PACKET.md:2](D:/OpenClaw-workspace/artifacts/mcvplus-integrated-candidate05-20261031/SETUP-PACKET.md:2) separates S, V, and T. Historical installation scripts are expressly excluded as approved inputs at line 4. Final hashes, target-absence evidence, identities, and storage specifications remain prerequisites.
- **Concrete partial-Setup containment.** The packet requires resource receipts, exact ownership attribution, stopping/disabling only newly owned services and provisioning processes, listener/descendant verification, retained partial state, and BLOCKED status when containment cannot be verified. It forbids deletion, broad process sweeps, automatic retries, and ledger rollback. This is adequate containment direction for a proposal; it is not evidence that containment works.
- **Disabled state and phase separation.** Provider/tunnel remain stopped; only expressly authorized transient PG provisioning is contemplated. No permits, activation pins, cloud provisioning, Vercel deployment, or campaign probes are authorized by local S. Effective confinement and durability remain unproven blockers.
- **Capacity and IAM conclusions are appropriately conditional.** The successful qualification-project metadata response records only `(default)` and no next-page token. Billing and project IAM are unavailable, so neither billing status, quota headroom, nor effective least privilege is established. The create-only/database-condition design is supported in principle by the retained documentation, while broader grants and inherited authority remain unresolved.
- **No paid or replacement replay storage is proposed.** The retained pricing documentation supports the one-free-database limitation and usage charging for additional databases. The report correctly rejects a second database as a free workaround and does not propose another storage service.

**Actual48 accounting:** this review consumed zero actual campaign attempts. `TASK.md:4` states that all48 remain unspent; I did not inspect the operational ledger, so that historical count remains a stated invariant rather than an independently verified result.

After the two document corrections, these materials can stand as a disabled, proposal-only Setup packet and a blocked replay feasibility finding. S, V, and T remain BLOCKED; app/driver correctness and operational acceptance remain outside this review.