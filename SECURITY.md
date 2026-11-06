# Security notes

This document records the security posture of the Prism assessment build, the
known dependency advisories at the time of writing, and what would change
before running it as a real multi-tenant service.

## Supported scope

Prism is a **demo deployment**. There is no authentication, no authorization,
no tenant isolation and no user data model. Treat every job payload and result
as public. Do not run it with customer data, credentials or personal
information until the gaps below are closed.

## Implemented controls

| Area          | Control                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Input         | `ValidationPipe` with `whitelist`, `forbidNonWhitelisted` and payload size limits on job bodies                          |
| HTTP headers  | Helmet, `X-Content-Type-Options`, frame denial, referrer policy, HSTS at the ingress                                     |
| Rate limiting | NestJS throttler, 120 requests/minute per IP by default                                                                  |
| Logging       | Pino structured logs with redaction of `authorization`, `cookie` and password fields                                     |
| Containers    | Multi-stage builds, non-root users, read-only root filesystems for API/worker, `no-new-privileges`, dropped capabilities |
| Secrets       | Never baked into images; `.env` is git-ignored; Container Apps secrets and GitHub OIDC replace long-lived credentials    |
| Supply chain  | Images tagged by commit SHA, Trivy critical scan before deploy, Dependabot for npm/Actions/Docker/Terraform              |
| Database      | Postgres not published publicly in Azure; SSL required to Flexible Server; least-privilege app database                  |
| Redis         | Private Azure Cache for Redis with TLS; no public endpoint                                                               |
| CI/CD         | Deploy job depends on lint, typecheck, tests, build and scan; a failure cannot publish a new revision                    |

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full failure and trust model.

## Dependency advisories (November 2026)

`npm audit --omit=dev` reports **3 high** findings, all one transitive chain:

```text
prisma@6.19.3 → @prisma/config@6.19.3 → deepmerge-ts@7.1.5
GHSA-ggr8-5vv4-36mx · stack exhaustion when merging recursive object graphs
```

Why it is accepted for this build:

- `deepmerge-ts` is only reachable from the **Prisma CLI**, which runs during
  `prisma generate`, `migrate deploy` and local seeding. It is not imported by
  the API or worker request path.
- The merge input is the developer-owned `prisma.config.ts`, not user input. An
  attacker cannot supply a recursive object graph.
- The fix requires Prisma 7, a major upgrade with a new config format and client
  output changes. It is tracked as post-assessment work rather than rushed into
  the submission.

Resolved during the build:

- **multer 2.4.0 → 2.5.0** via an npm override. NestJS's Express adapter pulls
  multer in, but Prism exposes no upload endpoints. Pinning the patched version
  keeps the dependency tree clean for any future upload support.
- **postcss 8.4.31 → 8.5.32** via an npm override. Next.js pins an old
  transitive copy; 8.5.x is API-compatible and the production build, tests and
  Compose smoke test were re-run against it.

Verify the current state with:

```bash
npm audit --omit=dev
npm audit            # includes dev-only tooling
```

The release workflow fails on **critical** findings. High findings are visible
in the job log and reviewed manually, because a blanket failure would block the
pipeline on this accepted Prisma chain.

## Secrets

- Local: copy `.env.example` to `.env`; `.env*` is ignored except the example.
- CI: `GITHUB_TOKEN` is provided by Actions. Azure access uses OIDC federation
  (`AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`) with no stored
  client secret.
- Azure: Terraform writes the database URL and Redis connection string into
  Container App secrets. The Postgres administrator password is marked
  sensitive and can be supplied through `TF_VAR_postgres_admin_password`.
- Rotation: rotate the Postgres password and Redis keys in Azure, update the
  Container App secret, and restart the revision. Rotate the OIDC subject if a
  repository or environment is renamed.

Never commit `.env`, Terraform state, kubeconfigs or registry credentials. The
repository `.gitignore` covers all four.

## Reporting

This is a personal assessment project, not a supported product. If you find an
issue in the demo, open a private security advisory on the repository rather
than a public issue.

## Hardening backlog

1. Upgrade Prisma 6 → 7 and remove the remaining audit chain.
2. Add authentication (OIDC or session cookies) and per-tenant job ownership.
3. Add signed webhooks or SSE for result delivery instead of open polling.
4. Add per-key quotas and a max concurrent job limit per tenant.
5. Run containers with a read-only root filesystem everywhere, including web.
6. Add SAST (CodeQL) and SBOM attestation to the release workflow.
7. Restrict egress from the API and worker with Azure NAT/NSG rules.
