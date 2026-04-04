# BabyHealth Deployment Guide

Complete guide for deploying BabyHealth to Google Cloud Run.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Deploy](#quick-deploy)
3. [Manual Deployment](#manual-deployment)
4. [Monitoring and Management](#monitoring-and-management)
5. [Troubleshooting](#troubleshooting)
6. [Cost Optimization](#cost-optimization)

## Prerequisites

### Required Tools
1. **Google Cloud Account**
   - Sign up at https://cloud.google.com
   - Enable billing (Cloud Run has a free tier but requires billing setup)

2. **Google Cloud SDK (gcloud CLI)**
   ```bash
   # Install from https://cloud.google.com/sdk/docs/install
   # Verify installation
   gcloud --version
   ```

3. **Docker**
   ```bash
   # Install from https://www.docker.com/products/docker-desktop
   # Verify installation
   docker --version
   ```

4. **Git**
   - For cloning and version control

### Setup gcloud
```bash
# Authenticate with Google Cloud
gcloud auth login

# Set default project (optional but recommended)
gcloud config set project baby-health-app
```

## Quick Deploy

The easiest way to deploy BabyHealth is using the automated deployment script:

```bash
# From project root directory
./deploy/deploy.sh

# Or with a custom project ID
./deploy/deploy.sh my-custom-project-id
```

The script will:
1. Create/verify a GCP project
2. Enable required APIs
3. Set up Artifact Registry
4. Build and push the Docker image
5. Deploy to Cloud Run
6. Output the public URL

**Typical execution time**: 5-10 minutes

### Post-Deployment

Once deployment completes, you'll receive a URL like:
```
https://babyhealth-us-central1-[project-id].a.run.app
```

Test your deployment:
```bash
# Health check
curl https://babyhealth-us-central1-[project-id].a.run.app/health

# View API docs
# Visit: https://babyhealth-us-central1-[project-id].a.run.app/docs
```

## Manual Deployment

If you prefer to deploy step-by-step:

### Step 1: Create GCP Project
```bash
# Create project
gcloud projects create baby-health-app \
  --name="BabyHealth App" \
  --enable-cloud-apis

# Set as active project
gcloud config set project baby-health-app
```

### Step 2: Enable Required APIs
```bash
# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Enable Cloud Build API
gcloud services enable cloudbuild.googleapis.com

# Enable Artifact Registry API
gcloud services enable artifactregistry.googleapis.com
```

### Step 3: Set Up Artifact Registry
```bash
# Create Docker repository
gcloud artifacts repositories create babyhealth \
  --repository-format=docker \
  --location=us-central1 \
  --description="BabyHealth Docker images"

# Configure Docker authentication
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### Step 4: Build Docker Image
```bash
# From project root
docker build -t us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest .

# Verify the build
docker run -p 8080:8080 us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest
```

### Step 5: Push to Artifact Registry
```bash
docker push us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest
```

### Step 6: Deploy to Cloud Run
```bash
gcloud run deploy babyhealth \
  --image=us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=100 \
  --min-instances=0 \
  --port=8080
```

### Step 7: Get Service URL
```bash
gcloud run services describe babyhealth \
  --region=us-central1 \
  --format='value(status.url)'
```

## Monitoring and Management

### View Logs
```bash
# Last 50 log entries
gcloud run logs read babyhealth --region=us-central1 --limit=50

# Real-time logs
gcloud run logs read babyhealth --region=us-central1 --follow

# Filter by severity
gcloud run logs read babyhealth --region=us-central1 --limit=50 --level=ERROR
```

### Monitor Metrics
```bash
# View service details
gcloud run services describe babyhealth --region=us-central1

# View revisions
gcloud run revisions list --service=babyhealth --region=us-central1
```

Access the GCP Console for more detailed metrics:
- https://console.cloud.google.com/run

### Update Deployment
```bash
# Rebuild and push image
docker build -t us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest .
docker push us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest

# Redeploy (will automatically use latest image)
gcloud run deploy babyhealth \
  --image=us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest \
  --region=us-central1 \
  --quiet
```

### Scale Configuration
```bash
# Set minimum instances (0 for free tier)
gcloud run deploy babyhealth \
  --min-instances=0 \
  --region=us-central1

# Set maximum instances (for high traffic)
gcloud run deploy babyhealth \
  --max-instances=50 \
  --region=us-central1

# Set memory allocation
gcloud run deploy babyhealth \
  --memory=512Mi \
  --region=us-central1
```

### Custom Domain
```bash
# Map custom domain
gcloud run domain-mappings create \
  --service=babyhealth \
  --domain=babyhealth.yourdomain.com \
  --region=us-central1
```

### Delete Service
```bash
# Delete the Cloud Run service
gcloud run services delete babyhealth --region=us-central1

# Delete Artifact Registry repository (optional)
gcloud artifacts repositories delete babyhealth --location=us-central1

# Delete GCP project (if needed)
gcloud projects delete baby-health-app
```

## Troubleshooting

### Build Fails: "Docker daemon is not running"
```bash
# Start Docker daemon
# macOS/Windows: Open Docker Desktop
# Linux: sudo systemctl start docker
docker ps  # Verify connection
```

### Build Fails: "permission denied while trying to connect to Docker daemon"
```bash
# Linux: Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Deployment Fails: "permission denied"
```bash
# Re-authenticate with gcloud
gcloud auth login

# Ensure proper permissions on project
gcloud projects get-iam-policy baby-health-app
```

### Service crashes on startup
```bash
# Check logs for errors
gcloud run logs read babyhealth --region=us-central1 --limit=20

# Verify environment variables
gcloud run services describe babyhealth --region=us-central1

# Test image locally
docker run -p 8080:8080 -e PORT=8080 us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest
```

### High latency or slow responses
```bash
# Increase memory allocation
gcloud run deploy babyhealth --memory=1Gi --region=us-central1

# Increase CPU
gcloud run deploy babyhealth --cpu=2 --region=us-central1

# Check metrics in GCP Console
```

### Frontend not loading (404 errors)
```bash
# Verify frontend files are included in Docker image
docker run --rm us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest \
  ls -la /app/frontend/dist/

# Ensure Dockerfile includes COPY --from=frontend-builder
```

## Cost Optimization

### Minimize Costs with Free Tier

**Cloud Run Free Tier (Monthly)**
- 2,000,000 requests
- 400,000 GB-seconds
- 1,000,000 GB-seconds memory

**Configuration for free tier:**
```bash
gcloud run deploy babyhealth \
  --min-instances=0 \
  --memory=512Mi \
  --region=us-central1
```

**Cost-saving tips:**
1. **Set min-instances to 0** - Only pay when in use
2. **Use smaller memory** - 256Mi-512Mi usually sufficient
3. **Monitor request volume** - Free tier handles ~66k requests/day
4. **Use Cloud Build caching** - Speeds up deployments
5. **Clean up old revisions** - Delete unused revisions to save space

### Estimated Monthly Costs

| Scenario | Requests/Month | Estimate Cost |
|----------|---|---|
| Small family (1-2 babies) | 50,000 | $0 (free tier) |
| Medium family (2-4 babies) | 150,000 | $0 (free tier) |
| Large family/multiple families | 500,000 | $0.20 |
| Enterprise deployment | 2,000,000+ | $0.80+ |

### Billing Alerts

Set up alerts in GCP Console:
1. Go to https://console.cloud.google.com/billing
2. Select your project
3. Create a budget alert at $10/month

## Advanced Configuration

### Custom Domain with SSL
```bash
# Add domain mapping
gcloud run domain-mappings create \
  --service=babyhealth \
  --domain=api.babyhealth.com \
  --region=us-central1

# SSL certificate is automatic via Google-managed certificates
```

### VPC Connector (for private networking)
```bash
# Create VPC connector (for backend database access)
gcloud compute networks vpc-connectors create babyhealth-connector \
  --region=us-central1 \
  --range=10.8.0.0/28

# Deploy with VPC connector
gcloud run deploy babyhealth \
  --vpc-connector=babyhealth-connector \
  --region=us-central1
```

### Environment Variables Management
```bash
# Update environment variables
gcloud run deploy babyhealth \
  --set-env-vars=DEBUG=false,CORS_ALLOWED_ORIGINS=["https://yourdomain.com"] \
  --region=us-central1
```

### Cloud Build CI/CD
```bash
# Push to Cloud Build
gcloud builds submit \
  --config=deploy/cloudbuild.yaml \
  --region=us-central1
```

## Maintenance

### Regular Checks
- Monitor logs weekly: `gcloud run logs read babyhealth --region=us-central1 --limit=100`
- Review metrics monthly in GCP Console
- Update dependencies quarterly
- Test backups and recovery processes

### Backup Strategy
- Frontend: Always in Git repository
- Backend: Data in Cloud Datastore or Cloud SQL (if added)
- Database: Regular automated backups via GCP services

## Support and Resources

- **GCP Documentation**: https://cloud.google.com/run/docs
- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **Docker Documentation**: https://docs.docker.com/
- **GitHub Issues**: Report bugs and feature requests
- **BabyHealth Docs**: See README.md and docs/ directory

---

**Version**: 1.0
**Last Updated**: April 2024
