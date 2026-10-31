# Candidate04 bounded local implementation

Authorized 2026-10-31 by Biggunn: 48 authorized attempts (42 primary +6 reserved), counted before each named HTTP/SDK/DB dispatch, failures/denials/retries consumed; uncertainty halts. Not a universal request ceiling.

Separate candidate overlay; historical source/candidates/evidence never edited. No PG-R1, real slots, secrets, permits, installation, staging, deployment, hosted requests, paid resources, reboot or deletion. Purchases OFF; recovery DISARMED; pin UNSET; Alpha/canonical unchanged (not live-verified).

Implementation uses Node built-in SQLite durable local journal and existing firebase-admin v1 createDocument for replay. No new service/broker/supervisor/checker. Only offline fake transports and synthetic journals can run now. Production entrypoint is explicitly disabled; candidate is not installation-ready. Review output belongs in INDEPENDENT-REVIEW.md. Tests may retain synthetic files; no cleanup/deletion.
