# GitHub Actions CI/CD Setup for BabyHealth

This guide explains how to set up automatic deployment from GitHub to Google Cloud Run using GitHub Actions and Workload Identity Federation.

## Overview

The GitHub Actions workflow automatically:
1. Builds Docker image on push to main/master
2. Pushes to Google Artifact Registry
3. Deploys to Cloud Run
4. Verifies deployment with health check

## Setup Steps

### Step 1: Create GCP Service Account

```bash
# Set variables
PROJECT_ID="baby-health-app"
SERVICE_ACCOUNT="github-actions-babyhealth"

# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT \
  --display-name="GitHub Actions - BabyHealth"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"
```

### Step 2: Configure Workload Identity Federation

```bash
# Enable required APIs
gcloud services enable iamcredentials.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
gcloud services enable sts.googleapis.com
gcloud services enable serviceusage.googleapis.com

# Create Workload Identity Pool
WORKLOAD_IDENTITY_POOL="github-pool"
WORKLOAD_IDENTITY_PROVIDER="github-provider"

gcloud iam workload-identity-pools create $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location=global \
  --display-name="GitHub Actions"

# Get the Workload Identity Pool resource name
WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe $WORKLOAD_IDENTITY_POOL \
  --project=$PROJECT_ID \
  --location=global \
  --format='value(name)')

# Create Workload Identity Provider
gcloud iam workload-identity-pools providers create-oidc $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,assertion.aud=assertion.aud,assertion.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-condition="assertion.repository == 'YOUR-GITHUB-ORG/babyhealth'"
```

Replace `YOUR-GITHUB-ORG` with your actual GitHub organization or username.

### Step 3: Create Service Account Impersonation Binding

```bash
# Get Workload Identity Provider resource name
WIP_RESOURCE_NAME=$(gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --format='value(name)')

# Bind GitHub to service account
gcloud iam service-accounts add-iam-policy-binding \
  ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com \
  --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/$WIP_RESOURCE_NAME/attribute.repository/YOUR-GITHUB-ORG/babyhealth"
```

### Step 4: Extract WIF Provider String

```bash
# Get the Workload Identity Federation provider string
WIF_PROVIDER=$(gcloud iam workload-identity-pools providers describe $WORKLOAD_IDENTITY_PROVIDER \
  --project=$PROJECT_ID \
  --location=global \
  --workload-identity-pool=$WORKLOAD_IDENTITY_POOL \
  --format='value(name)')

echo "WIF_PROVIDER=$WIF_PROVIDER"
echo "SERVICE_ACCOUNT=${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com"
```

### Step 5: Add GitHub Secrets

Go to your GitHub repository settings:

1. Navigate to: `Settings > Secrets and variables > Actions`
2. Create new repository secrets:

   | Secret Name | Value |
   |-------------|-------|
   | `GCP_PROJECT_ID` | `baby-health-app` (or your project ID) |
   | `WIF_PROVIDER` | Output from Step 4 (full path) |
   | `WIF_SERVICE_ACCOUNT` | Output from Step 4 (service account email) |

### Step 6: Test Deployment

Push a change to main/master branch:
```bash
git add .
git commit -m "Test GitHub Actions deployment"
git push origin main
```

Monitor deployment:
1. Go to `Actions` tab in GitHub
2. Click the running workflow
3. Check logs for success

## Workflow File

The workflow is defined in `.github/workflows/deploy-to-cloud-run.yml`:

- Triggers on push to main/master branches
- Can also be triggered manually via `workflow_dispatch`
- Builds Docker image with GitHub SHA tag
- Pushes image to Artifact Registry
- Deploys to Cloud Run
- Verifies deployment with health check

## Monitoring Deployments

### View workflow runs:
- GitHub: `Actions` tab in your repository
- GCP: Cloud Run service details page

### Check deployment logs:
```bash
# Recent deployments
gcloud run deployments list --service=babyhealth --region=us-central1

# Service logs
gcloud run logs read babyhealth --region=us-central1 --follow
```

## Troubleshooting

### Workflow fails with authentication error
- Verify all secrets are correctly set in GitHub
- Check that service account has required IAM roles
- Verify WIF provider configuration is correct

### Deployment fails
- Check Cloud Run logs: `gcloud run logs read babyhealth`
- Verify image builds locally first: `docker build .`
- Check that APIs are enabled in GCP

### Service doesn't start after deployment
- Check recent logs for startup errors
- Verify environment variables are set correctly
- Test image locally: `docker run -p 8080:8080 image:latest`

## Advanced Configuration

### Environment Variables in Deployment

Add environment variables to the deploy step:
```yaml
- name: Deploy to Cloud Run
  run: |
    gcloud run deploy ${{ env.SERVICE_NAME }} \
      ...
      --set-env-vars=DEBUG=false,LOG_LEVEL=INFO \
      ...
```

### Custom Domain

After initial deployment:
```bash
gcloud run domain-mappings create \
  --service=babyhealth \
  --domain=api.yourdomain.com \
  --region=us-central1
```

### Manual Trigger

Run workflow manually via GitHub UI:
1. Go to `Actions` tab
2. Select `Deploy to Cloud Run` workflow
3. Click `Run workflow`
4. Select branch and run

## Security Best Practices

1. **Use Workload Identity**: Don't use service account keys (as configured)
2. **Limit permissions**: Service account only has Cloud Run and Artifact Registry access
3. **Review deployments**: Keep audit logs of all deployments
4. **Rotate secrets**: Regenerate credentials periodically
5. **Test changes**: Test locally before pushing to main

## Cleanup

To disable automatic deployments:

```bash
# Remove secrets from GitHub (via UI)
# Or keep workflow but don't push to main branch

# To delete GCP resources:
gcloud iam service-accounts delete ${SERVICE_ACCOUNT}@${PROJECT_ID}.iam.gserviceaccount.com
gcloud iam workload-identity-pools delete $WORKLOAD_IDENTITY_POOL --location=global
```

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [Cloud Run Deployment](https://cloud.google.com/run/docs/deploying-source-code)
- [Artifact Registry](https://cloud.google.com/artifact-registry)

---

**Status**: Ready for use after following setup steps
**Frequency**: Automatic on push to main/master
**Cost Impact**: Uses GCP free tier quotas for building and deploying
