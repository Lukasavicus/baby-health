# BabyHealth - START HERE FOR DEPLOYMENT

Your BabyHealth project is fully configured for Google Cloud Run. This is your starting point.

## 3 Simple Steps to Deploy

### Step 1: Install Prerequisites (5 minutes)

You need three things:

1. **Google Cloud Account** (free tier available)
   - Go to: https://cloud.google.com
   - Create account
   - Enable billing

2. **gcloud CLI** (Google Cloud command-line tool)
   - Install from: https://cloud.google.com/sdk/docs/install
   - Verify: `gcloud --version`

3. **Docker** (containerization)
   - Install from: https://www.docker.com/products/docker-desktop
   - Verify: `docker --version`

**Then authenticate:**
```bash
gcloud auth login
```

### Step 2: Deploy (10 minutes)

From the project directory, run:

```bash
./deploy/deploy.sh
```

That's it! The script handles everything:
- Creates a GCP project (if needed)
- Enables required APIs
- Builds your Docker image
- Pushes to Google Artifact Registry
- Deploys to Google Cloud Run
- Outputs your service URL

### Step 3: Verify (2 minutes)

The script will output something like:
```
Service URL: https://babyhealth-us-central1-baby-health-app.a.run.app
API Docs: https://babyhealth-us-central1-baby-health-app.a.run.app/docs
```

Test it:
```bash
# Health check
curl https://babyhealth-us-central1-baby-health-app.a.run.app/health

# Or visit in browser
https://babyhealth-us-central1-baby-health-app.a.run.app
https://babyhealth-us-central1-baby-health-app.a.run.app/docs
```

Done! Your app is now live.

## What Just Happened?

Your BabyHealth application is now running on Google Cloud Run with:
- React frontend served from the same container
- FastAPI backend for API calls
- Auto-scaling from 0 to 100 instances
- Zero baseline costs (pays only per request)
- Free tier covers ~2 million requests per month

## Cost

**Monthly cost: $0** (within free tier for typical family usage)

Google Cloud Run free tier includes:
- 2,000,000 requests/month
- 400,000 GB-seconds of compute
- 1,000,000 GB-seconds of memory

Typical family usage: 50k-150k requests/month = $0 cost

## Next Steps

### Monitor Your App
```bash
# View live logs
gcloud run logs read babyhealth --region=us-central1 --follow

# View service details
gcloud run services describe babyhealth --region=us-central1

# View metrics
# Visit: https://console.cloud.google.com/run
```

### Update Your App
1. Make code changes
2. Commit and push to git
3. Run deployment again: `./deploy/deploy.sh`
4. New version deployed in 5-10 minutes

### Set Up GitHub Actions (Optional)
For automatic deployment on every git push to main:
- See: `.github/GITHUB_ACTIONS_SETUP.md`

### Local Testing
To test locally before deploying:
```bash
docker-compose up --build
# Visit: http://localhost:8080
```

## Documentation

Need help? Read these files:

| File | Purpose |
|------|---------|
| `README.md` | Full project documentation |
| `DEPLOYMENT_QUICK_REFERENCE.md` | Common commands and troubleshooting |
| `deploy/DEPLOYMENT_GUIDE.md` | Detailed step-by-step guide |
| `DEPLOYMENT_INDEX.md` | Complete navigation guide |
| `.github/GITHUB_ACTIONS_SETUP.md` | GitHub Actions setup |

## Troubleshooting

### "gcloud command not found"
- Install gcloud CLI: https://cloud.google.com/sdk/docs/install
- Then run: `gcloud auth login`

### "Docker daemon is not running"
- Start Docker (Docker Desktop on Mac/Windows)
- On Linux: `sudo systemctl start docker`

### "Permission denied"
- Run: `gcloud auth login` again
- Ensure your Google account has billing enabled

### "Deployment failed"
- Check logs: `gcloud run logs read babyhealth`
- Test locally: `docker-compose up --build`
- See: `deploy/DEPLOYMENT_GUIDE.md` for troubleshooting

### "Service won't start"
- Check logs for errors
- Verify PORT=8080 is set
- Test image: `docker build . && docker run -p 8080:8080 babyhealth:latest`

## What Gets Deployed

Your deployment includes:
- React frontend (static files served at /)
- FastAPI backend (API routes at /api/*)
- Health checks (/health endpoint)
- API documentation (/docs endpoint)
- Both running in a single Docker container

## Architecture

```
You
  ↓
./deploy/deploy.sh (script)
  ↓
Google Cloud Platform
  ├─ Creates project (if needed)
  ├─ Enables APIs
  ├─ Sets up Artifact Registry
  └─ Deploys to Cloud Run
      ↓
  Your live app at: https://babyhealth-...run.app
```

## Support

**Quick help:** See `DEPLOYMENT_QUICK_REFERENCE.md`

**Detailed guide:** See `deploy/DEPLOYMENT_GUIDE.md`

**Navigation:** See `DEPLOYMENT_INDEX.md`

**GitHub Actions:** See `.github/GITHUB_ACTIONS_SETUP.md`

## Summary

You now have:
- Docker configuration for production
- One-command deployment to Google Cloud Run
- Free tier eligible ($0/month for typical usage)
- Comprehensive documentation
- Local testing with Docker Compose
- Optional GitHub Actions for auto-deploy

**Ready to deploy?**

```bash
./deploy/deploy.sh
```

Then visit your service URL.

---

**Deployment Time:** 5-10 minutes
**Cost:** $0/month (free tier)
**Status:** Ready to go!
