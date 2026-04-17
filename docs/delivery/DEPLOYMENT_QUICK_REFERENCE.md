# BabyHealth Deployment Quick Reference

Quick commands and checklists for deploying and managing BabyHealth.

## One-Line Deployment

```bash
./deploy/deploy.sh
```

That's it! The script handles everything automatically.

## Manual Quick Commands

### Build & Test Locally
```bash
docker build -t babyhealth:test .
docker run -p 8080:8080 babyhealth:test
# Visit http://localhost:8080
```

### Deploy to Cloud Run
```bash
./deploy/deploy.sh baby-health-app
```

### View Logs
```bash
gcloud run logs read babyhealth --region=us-central1 --limit=50 --follow
```

### Redeploy Latest
```bash
# Build, push, and deploy
docker build -t us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest .
docker push us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest
gcloud run deploy babyhealth --image=us-central1-docker.pkg.dev/baby-health-app/babyhealth/babyhealth:latest --region=us-central1 --quiet
```

### Get Service URL
```bash
gcloud run services describe babyhealth --region=us-central1 --format='value(status.url)'
```

## Configuration Reference

### Environment Variables
```
PORT=8080                    (Required for Cloud Run)
DEBUG=false                  (Enable/disable debug mode)
STORAGE_TYPE=json           (Data storage type)
CORS_ALLOWED_ORIGINS=[]     (Comma-separated allowed origins)
```

### Resource Limits
- **Memory**: 512Mi (for free tier)
- **CPU**: 1 (for free tier)
- **Max Instances**: 100
- **Min Instances**: 0 (free tier, no baseline costs)

## Cost Indicators

**Free Tier Limits (Monthly)**
- 2,000,000 requests
- 400,000 GB-seconds compute
- 1,000,000 GB-seconds memory

**Estimated per 100k requests**
- Memory usage: ~1 GB-seconds (512Mi container)
- Cost impact: $0 (within free tier)

## Monitoring Checklist

- [ ] Service is running: `gcloud run services list`
- [ ] Health check passes: `curl $SERVICE_URL/health`
- [ ] Frontend loads: Visit `$SERVICE_URL` in browser
- [ ] API docs available: Visit `$SERVICE_URL/docs`
- [ ] No errors in logs: `gcloud run logs read babyhealth --limit=20`
- [ ] Response time acceptable: Check GCP Console metrics

## Troubleshooting Quick Guide

| Problem | Solution |
|---------|----------|
| **Build fails** | `docker build .` locally first to identify errors |
| **Docker won't connect** | Start Docker daemon (Docker Desktop on Mac/Windows) |
| **Image push fails** | Run `gcloud auth configure-docker us-central1-docker.pkg.dev` |
| **Deploy fails** | Check `gcloud run logs read babyhealth` for error details |
| **Service won't start** | Verify PORT env var and that app listens on 8080 |
| **Frontend returns 404** | Ensure `frontend/dist` built and included in Docker image |
| **API requests timeout** | Increase memory: `gcloud run deploy babyhealth --memory=1Gi` |
| **High costs** | Set `--min-instances=0` to use free tier properly |

## Directory Structure Reference

```
.
├── Dockerfile              ← Multi-stage build
├── docker-compose.yml      ← Local dev stack
├── .dockerignore          ← Docker build exclusions
├── .env.example           ← Environment template
├── README.md              ← Full documentation
├── DEPLOYMENT_QUICK_REFERENCE.md ← This file
│
├── backend/
│   ├── main.py            ← ✓ Updated: static file serving
│   ├── requirements.txt    ← Python dependencies
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── dist/              ← Built assets (generated)
│   └── package.json
│
└── deploy/
    ├── deploy.sh          ← ✓ Main deployment script
    ├── cloudbuild.yaml    ← GCP Cloud Build config
    └── DEPLOYMENT_GUIDE.md ← Detailed guide
```

## Pre-Deployment Checklist

- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Backend tests pass: `cd backend && pytest tests/` (if applicable)
- [ ] Docker builds locally: `docker build -t test .`
- [ ] Environment variables configured
- [ ] GCP project created with billing enabled
- [ ] `gcloud` CLI installed and authenticated
- [ ] Docker daemon running

## Post-Deployment Checklist

- [ ] Service URL accessible
- [ ] Health check returns 200
- [ ] Frontend loads without console errors
- [ ] API documentation available at `/docs`
- [ ] Sample API call works
- [ ] Logs contain no errors
- [ ] Monitoring alerts configured

## Key Files Changed/Created

**Modified Files:**
- `backend/main.py` - Added static file serving and PORT env variable support

**New Files:**
- `Dockerfile` - Multi-stage build for frontend + backend
- `.dockerignore` - Docker build exclusions
- `docker-compose.yml` - Local development with Docker
- `.env.example` - Environment configuration template
- `README.md` - Comprehensive project documentation
- `deploy/deploy.sh` - Automated deployment script
- `deploy/cloudbuild.yaml` - Google Cloud Build config
- `deploy/DEPLOYMENT_GUIDE.md` - Detailed deployment guide
- `DEPLOYMENT_QUICK_REFERENCE.md` - This file

## Common Tasks

### Update Application
```bash
# Make code changes
git add .
git commit -m "Feature: description"

# Rebuild and deploy
./deploy/deploy.sh baby-health-app
```

### Monitor Performance
```bash
# Real-time logs
gcloud run logs read babyhealth --region=us-central1 --follow

# View dashboard metrics
# https://console.cloud.google.com/run/detail/us-central1/babyhealth
```

### Scale Configuration
```bash
# Save costs (no baseline instances)
gcloud run deploy babyhealth --min-instances=0 --region=us-central1

# Handle peak traffic
gcloud run deploy babyhealth --max-instances=50 --region=us-central1

# Allocate more memory
gcloud run deploy babyhealth --memory=1Gi --region=us-central1
```

### Delete Service
```bash
gcloud run services delete babyhealth --region=us-central1
```

## GCP Console Links

- **Cloud Run Dashboard**: https://console.cloud.google.com/run
- **Artifact Registry**: https://console.cloud.google.com/artifacts
- **Cloud Build History**: https://console.cloud.google.com/cloud-build/builds
- **Billing Overview**: https://console.cloud.google.com/billing
- **Logs Viewer**: https://console.cloud.google.com/logs

## Support Resources

- **GCP Cloud Run Docs**: https://cloud.google.com/run/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Docker Docs**: https://docs.docker.com/
- **Full Deployment Guide**: See `deploy/DEPLOYMENT_GUIDE.md`
- **Project README**: See `README.md`

---

**Quick Start**: Run `./deploy/deploy.sh` and wait for the deployment to complete!
