# Azure deployment

This stack provisions:

- Azure Container Apps environment (consumption plan)
- three Container Apps: public **web**, internal **API**, internal **worker**
- PostgreSQL 16 Flexible Server + database
- Azure Cache for Redis (TLS only, `noeviction`)
- Log Analytics workspace for container logs

The images are published to GitHub Container Registry (GHCR) by
`.github/workflows/release.yml`. The Terraform configuration only needs the
registry prefix and immutable image tag.

## Cost note

`B_Standard_B1ms` PostgreSQL, a Basic 1 GB Redis cache, one small web/API/worker
replica and 30-day logs are deliberately the cheapest sensible combination.
Azure Cache for Redis is still the largest fixed cost in this demo. Run
`terraform destroy` when you are finished reviewing the deployment.

## 1. Bootstrap the remote state (once)

```bash
az group create --name prism-tfstate --location eastus
az storage account create \
  --name prismtfstate$RANDOM \
  --resource-group prism-tfstate \
  --sku Standard_LRS \
  --encryption-services blob
az storage container create \
  --name tfstate \
  --account-name <storage-account-name>

terraform init \
  -backend-config="resource_group_name=prism-tfstate" \
  -backend-config="storage_account_name=<storage-account-name>" \
  -backend-config="container_name=tfstate" \
  -backend-config="key=prism.tfstate"
```

## 2. Publish the images

Push to `main`. The release workflow runs lint, typecheck, tests and the
production build before it builds and pushes three SHA-tagged images to GHCR.
It only deploys when all of those jobs pass. Make each GHCR package public, or
configure a registry pull secret as described below.

Alternatively, build and push locally:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u <github-user> --password-stdin
docker build -f apps/api/Dockerfile -t ghcr.io/<owner>/prism-api:latest .
docker build -f apps/worker/Dockerfile -t ghcr.io/<owner>/prism-worker:latest .
docker build -f apps/web/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://<your-web-fqdn> \
  -t ghcr.io/<owner>/prism-web:latest .
docker push ghcr.io/<owner>/prism-api:latest
docker push ghcr.io/<owner>/prism-worker:latest
docker push ghcr.io/<owner>/prism-web:latest
```

## 3. Apply the infrastructure

```bash
cp terraform.tfvars.example terraform.tfvars
# set container_image_prefix, location, image_tag and tags
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Useful outputs:

```bash
terraform output web_url
terraform output container_app_names
terraform output current_images
```

## 4. Wire GitHub Actions

Create a Microsoft Entra app registration for GitHub OIDC and federate it to
this repository/environment. Grant it **Contributor** on the target resource
group and, if the workflow creates a resource group, the subscription.

Repository **secrets**:

| Secret                  | Value                                |
| ----------------------- | ------------------------------------ |
| `AZURE_CLIENT_ID`       | federated app registration client ID |
| `AZURE_TENANT_ID`       | Entra tenant ID                      |
| `AZURE_SUBSCRIPTION_ID` | target subscription ID               |

Repository **variables**:

| Variable               | Value                                                |
| ---------------------- | ---------------------------------------------------- |
| `DEPLOY_ENABLED`       | `true` to enable the deploy job                      |
| `PUBLIC_BASE_URL`      | `https://<web-fqdn>` from `terraform output web_url` |
| `AZURE_RESOURCE_GROUP` | resource group from Terraform                        |
| `AZURE_API_APP`        | API Container App name                               |
| `AZURE_WORKER_APP`     | worker Container App name                            |
| `AZURE_WEB_APP`        | web Container App name                               |

The `production` GitHub Environment should require a reviewer for the first
deployment. With `DEPLOY_ENABLED` unset or `false`, builds still run and publish
images, but deployment is skipped.

### Private GHCR packages

If the packages are private, give the Container Apps a pull credential:

```bash
az containerapp registry set \
  --name <api-app> --resource-group <rg> \
  --server ghcr.io --username <github-user> --password <pat-with-read-packages>
# repeat for worker and web
```

Prefer a fine-grained token with only `read:packages`, stored as a Container App
secret rather than in Terraform state.

## 5. Migrations

The API image can run Prisma migrations:

```bash
az containerapp job create \
  --name prism-migrate \
  --resource-group <rg> \
  --environment <container-app-environment> \
  --trigger-type Manual \
  --image ghcr.io/<owner>/prism-api:<sha> \
  --command "./node_modules/.bin/prisma" \
  --args "migrate,deploy,--schema,apps/api/prisma/schema.prisma" \
  --env-vars DATABASE_URL=secretref:database-url
```

For the first deployment, run the job before scaling the API revision. The
GitHub Actions workflow does not run migrations automatically: schema changes
should be reviewed and applied as a deliberate step. Document any migration in
the pull request.

Alternative without a Container Apps job: run the migration from a trusted
network with the managed database connection string:

```bash
DATABASE_URL='postgresql://...' npm run db:deploy
```

## Rollback

Container Apps keeps immutable revisions. The deploy workflow writes the active
revisions to the job summary. To roll back:

```bash
# Route all traffic to a previous revision
az containerapp ingress traffic set \
  --name <app> --resource-group <rg> \
  --revision-weight <previous-revision>=100
```

Or redeploy the previous image tag:

```bash
az containerapp update \
  --name <app> --resource-group <rg> \
  --image ghcr.io/<owner>/prism-api:sha-<previous-sha>
```

A database migration is the one thing a traffic rollback cannot undo. Keep
migrations backward-compatible (expand/contract) for at least one release.

## Hardening for real production

- Move PostgreSQL and Redis to private endpoints / VNet integration; remove the
  `0.0.0.0` firewall rule.
- Replace public GHCR pulls with a managed identity + ACR, or a scoped PAT.
- Put Azure Front Door/WAF in front of the web ingress.
- Add alerts on API 5xx rate, worker queue depth, Redis memory and Postgres
  connections.
- Set a budget and log retention policy.
