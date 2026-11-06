# Decision record

Short, dated notes on the choices that shaped this deployment. They exist so a
reviewer can see *why* the stack looks the way it does, not just what it does.

## 2026-11-06 — Deploy to `malaysiawest` instead of `southeastasia`

**Context.** The brief asked for a Southeast Asia deployment and `southeastasia`
was the first choice. The subscription inherits an Azure Policy assignment:

| Field | Value |
| --- | --- |
| Assignment | `sys.regionrestriction` — "Allowed resource deployment regions" |
| Scope | subscription |
| Allowed locations | `malaysiawest`, `uaenorth`, `indonesiacentral`, `koreacentral`, `eastasia` |

A `southeastasia` plan is rejected at validation time, so the deployment cannot
use Singapore without changing subscription governance.

**Decision.** Deploy to `malaysiawest` — the closest allowed Southeast Asia
region — and keep the policy untouched.

**Why not work around it.**

- The restriction is a subscription-level guardrail. Loosening it (editing the
  assignment or adding a broad exemption) to host a demo would weaken the
  control for every workload in the subscription.
- A narrower fix is a resource-group-scoped, time-boxed exemption. It is
  defensible, but it still needs a governance exception, an expiry and a review
  owner — overhead that buys a marginal latency difference for this workload.
- `malaysiawest` provides all required services (Container Apps, PostgreSQL
  Flexible Server, Azure Cache for Redis) and satisfies the "Southeast Asia"
  geography in the brief.

**Consequences.** Docs and the walkthrough name `malaysiawest` explicitly, with
the reason, rather than implying Singapore. Moving to `southeastasia` later is a
one-line change to `location` in `terraform.tfvars` once the policy allows it.

## 2026-11-06 — Passwordless CI/CD with GitHub OIDC

The release workflow authenticates to Azure with a federated credential
(`repo:coderv1304/prism:environment:production`) instead of a stored service
principal secret. The app registration is scoped to the deployment resource
group with `Contributor`, not subscription-wide, and only the `deploy` job gets
`id-token: write`.

## 2026-11-06 — Immutable image tags

Container Apps reference `sha-<commit>` tags, never `latest`. The release
workflow builds, scans and pushes one image per service and updates only the
apps whose paths changed. Rollback is re-pointing at a previous SHA.
