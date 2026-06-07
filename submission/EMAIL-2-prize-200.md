To: devrel@terminal3.io
Subject: T3N Documentation Bug Report — 13 verified issues — Uvin Vindula

Hi Terminal 3 team,

Separate from my MediPass submission — this is for the documentation prize.

While building a full agent integration I hit 13 reproducible documentation /
dev-kit issues. Full report (with reproductions) is in BUGS.md in the repo:

  GitHub:  <REPO_URL>  (see BUGS.md)

Headline finding (B1): the dev-kit instructions describe a REST API
(base staging.terminal3.io, X-API-Token header, did:key, /v1/user/create,
/v1/did/register, /v1/vc/issuer/store, /v1/vc/issuer/credentials/proof) that does
not match the live ADK. Every REST call returns 401. The live ADK is a WASM SDK
(@terminal3/t3n-sdk) with SIWE auth; the test "API key" is actually an Ethereum
private key, and the DID method is did:t3n, not did:key. Anyone following the
documented spec gets 401 on every call. Corrected, verified-live steps are in the
report.

B1a: the hosted VC SDK docs (api-reference/vc-sdk issuer/verifier) are missing
from llms.txt and 404 on the obvious paths; intro/components/vc.md has no
copy-pasteable VC-issue + selective-disclosure example — the single most
important flow for an identity agent.

The remaining issues (B2–B12) cover SDK version drift, dependency pinning, and
sample-code/tsconfig conflicts — all in BUGS.md.

Thanks,
Uvin Vindula (IAMUVIN)
uvin95dev@gmail.com · https://iamuvin.com
