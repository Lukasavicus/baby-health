# Infrastructure (Terraform)

GCP layout for **BabyHealth**: shared APIs + Artifact Registry once; **prod** and **dev** stacks use separate Terraform state prefixes and duplicated app resources (Cloud Run, GCS, JWT secret, SA) where isolation is needed.

## Layout

| Path | State prefix (`babyhealth-tfstate`) | Contents |
|------|-------------------------------------|----------|
| [`shared/`](shared/) | `terraform/state/shared` | Project APIs + Artifact Registry (`babyhealth`) |
| [`env/prod/`](env/prod/) | `terraform/state/prod` | Prod: Cloud Run `babyhealth`, bucket `<project>-data`, JWT `babyhealth-jwt-secret`, max instances **5** |
| [`env/dev/`](env/dev/) | `terraform/state/dev` | Dev: Cloud Run `babyhealth-dev`, bucket `<project>-data-dev`, JWT `babyhealth-jwt-secret-dev`, max instances **2** |
| [`modules/app_env/`](modules/app_env/) | _(module)_ | Reusable env: bucket, SA, secret, Cloud Run, IAM |

Apply order: **`shared` → `prod` → `dev`**. `prod` and `dev` read shared outputs via `terraform_remote_state` (repository ID).

## Prerequisites

- Terraform >= 1.5
- GCS bucket `babyhealth-tfstate` exists and your principal can write state (bootstrap once outside this repo if missing).
- GCP APIs enabled implicitly by Terraform in `shared` before env applies.

## Variables

Copy `terraform.tfvars.example` to `terraform.tfvars` in each stack (files are gitignored). At minimum:

- **`shared`**: `project_id`, `region`
- **`env/prod`**: `project_id`, `region`, `jwt_secret` (prod JWT)
- **`env/dev`**: `project_id`, `region`, `jwt_secret` (dev JWT — **different** from prod)

Sensitive values:

```bash
export TF_VAR_jwt_secret='...'
cd infra/env/prod && terraform plan
```

## Commands

```bash
cd infra/shared && terraform init && terraform apply
cd ../env/prod && terraform init && terraform apply
cd ../dev && terraform init && terraform apply
```

## GitHub Actions (deploy) and IAM

Workflows:

- **Production**: [`.github/workflows/deploy-cloud-run-prod.yml`](../.github/workflows/deploy-cloud-run-prod.yml) — push to **`main`** → image `babyhealth` → service `babyhealth`, `--max-instances=5`
- **Development**: [`.github/workflows/deploy-cloud-run-dev.yml`](../.github/workflows/deploy-cloud-run-dev.yml) — push to **`development`** → `pytest` → image `babyhealth-dev` → service `babyhealth-dev`, `--max-instances=2`

The Workload Identity Federation deployer service account (see [`.github/GITHUB_ACTIONS_SETUP.md`](../.github/GITHUB_ACTIONS_SETUP.md)) needs permission to push images and update **both** Cloud Run services (project-level roles such as **Artifact Registry Writer** + **Cloud Run Admin** / **Developer** are typical). Same GitHub secrets as before:

| Secret | Purpose |
|--------|---------|
| `GCP_PROJECT_ID` | Project ID for `gcloud` / image URL |
| `WIF_PROVIDER` | Workload Identity Provider resource name |
| `WIF_SERVICE_ACCOUNT` | Deployer service account email |

If auth fails with “must specify workload_identity_provider or credentials_json”, secrets are missing or the workflow ran from a fork (secrets are not injected).

## Migration from the old single-root `infra/`

Previously, everything lived under one backend prefix (`terraform/state`). This repo now uses **`shared`**, **`prod`**, and **`dev`** prefixes.

**Option A — Fresh apply (acceptable for greenfield / disposable dev):**

1. Optionally destroy or rename old resources managed by the legacy state (or leave them and import — advanced).
2. Apply `shared`, then `prod`, then `dev`.

**Option B — Keep existing prod resources:**

Use `terraform state mv` / `terraform import` from the old state into `terraform/state/prod` and split shared resources into `terraform/state/shared`, following Terraform docs for resource addresses (module paths changed). Consider professional change windows; wrong moves can recreate resources.

When in doubt, snapshot the old state (`gsutil cp`) before changes.

## Optional: Cloud Build trigger

If you connect the repo to Cloud Build via the GCP console, you can add a `google_cloudbuild_trigger` later (previously commented in the removed flat `infra/`). Not required for GitHub Actions deploys.
