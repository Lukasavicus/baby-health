# BabyHealth Deployment Index

Complete index of all deployment files and documentation created for the BabyHealth project.

## Quick Navigation

- **Want to deploy NOW?** Run: `./deploy/deploy.sh`
- **Need quick commands?** See: `DEPLOYMENT_QUICK_REFERENCE.md`
- **Need detailed guide?** See: `deploy/DEPLOYMENT_GUIDE.md`
- **New to the project?** See: `README.md`

## Files Overview

### Configuration Files (Root)

#### Dockerfile
**Purpose**: Multi-stage Docker build for production
**Location**: `/Dockerfile`
**Key Features**:
- Stage 1: Builds React frontend with Node 18
- Stage 2: Python 3.11 FastAPI backend
- Combines both in single container
- Optimized for Cloud Run (PORT=8080)
- Health check included
**Usage**: `docker build -t babyhealth:latest .`

#### docker-compose.yml
**Purpose**: Local development environment
**Location**: `/docker-compose.yml`
**Key Features**:
- Complete stack in Docker
- Auto-restart on failure
- Health checks enabled
- Volume mounts for development
**Usage**: `docker-compose up --build`

#### .dockerignore
**Purpose**: Excludes unnecessary files from Docker build
**Location**: `/.dockerignore`
**Excludes**: node_modules, __pycache__, .git, .env, etc.
**Impact**: Reduces image size by ~50%

#### .env.example
**Purpose**: Environment variable template
**Location**: `/.env.example`
**Variables**:
- PORT (for Cloud Run)
- DEBUG mode
- STORAGE_TYPE
- CORS_ALLOWED_ORIGINS
- GCP settings
**Usage**: Copy and customize for your environment

#### README.md
**Purpose**: Comprehensive project documentation
**Location**: `/README.md`
**Sections**:
- Project overview and features
- Tech stack
- Quick start guide
- Local development setup
- Deployment instructions
- API overview
- Contributing guidelines
- Troubleshooting
**Read this**: First time setup or project overview

#### DEPLOYMENT_QUICK_REFERENCE.md
**Purpose**: Quick lookup for common tasks
**Location**: `/DEPLOYMENT_QUICK_REFERENCE.md`
**Sections**:
- One-line deployment
- Common commands
- Configuration reference
- Troubleshooting quick guide
- Pre/post deployment checklists
**Use when**: You need a quick command or checklist

#### DEPLOYMENT_FILES_SUMMARY.txt
**Purpose**: Text summary of all created files
**Location**: `/DEPLOYMENT_FILES_SUMMARY.txt`
**Content**: Overview of all configuration changes

#### DEPLOYMENT_INDEX.md
**Purpose**: This file - navigation guide
**Location**: `/DEPLOYMENT_INDEX.md`

### Backend Updates

#### backend/main.py (Modified)
**Changes Made**:
1. Added `StaticFiles` import for serving frontend
2. Added `Path` and `os` imports
3. Added static file mounting at `/` route
4. Made API routes take priority
5. Updated port to read from `PORT` environment variable
6. Added SPA routing support with `html=True`

**Code Added**:
```python
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os

# At end of app setup:
static_dir = Path(__file__).parent.parent / "frontend" / "dist"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")

# In main:
port = int(os.getenv("PORT", "8000"))
```

**Why**: Enables serving React frontend and FastAPI backend from single container

### Deployment Scripts & Configuration

#### deploy/deploy.sh
**Purpose**: Automated one-command deployment to Google Cloud Run
**Location**: `/deploy/deploy.sh`
**Usage**: `./deploy/deploy.sh [optional-project-id]`
**Features**:
- Creates GCP project (idempotent)
- Enables required APIs
- Sets up Artifact Registry
- Builds Docker image
- Pushes to registry
- Deploys to Cloud Run
- Outputs service URL
- 5-10 minute execution time
**Executable**: Yes (chmod +x)

#### deploy/cloudbuild.yaml
**Purpose**: Google Cloud Build configuration
**Location**: `/deploy/cloudbuild.yaml`
**Features**:
- Build Docker image
- Push to Artifact Registry
- Deploy to Cloud Run
- Auto-triggered by git commits (optional)
**Usage**: Optional - deploy.sh script handles this

#### deploy/DEPLOYMENT_GUIDE.md
**Purpose**: Step-by-step deployment guide
**Location**: `/deploy/DEPLOYMENT_GUIDE.md`
**Sections**:
- Prerequisites and setup
- Quick deploy (5 min)
- Manual step-by-step (30 min)
- Monitoring and management
- Troubleshooting guide
- Cost optimization
- Advanced configuration
**Use when**: Need detailed instructions or manual control

### GitHub Actions CI/CD

#### .github/workflows/deploy-to-cloud-run.yml
**Purpose**: Automatic deployment from GitHub
**Location**: `/.github/workflows/deploy-to-cloud-run.yml`
**Features**:
- Triggered on push to main/master
- Manual trigger via workflow_dispatch
- Builds Docker image
- Pushes to Artifact Registry
- Deploys to Cloud Run
- Health check verification
**Setup Required**: See GITHUB_ACTIONS_SETUP.md

#### .github/GITHUB_ACTIONS_SETUP.md
**Purpose**: Setup guide for GitHub Actions CI/CD
**Location**: `/.github/GITHUB_ACTIONS_SETUP.md`
**Sections**:
- Create GCP service account
- Configure Workload Identity Federation
- Add GitHub secrets
- Test deployment
- Monitoring deployments
- Troubleshooting
- Advanced configuration
**Read when**: Want automatic deployments from GitHub

## Decision Tree

### What do I want to do?

```
Deploy to Cloud Run?
├─ Deploy quickly
│  └─ Run: ./deploy/deploy.sh
│
├─ Deploy step-by-step
│  └─ Read: deploy/DEPLOYMENT_GUIDE.md
│
├─ Set up automatic deployments
│  └─ Read: .github/GITHUB_ACTIONS_SETUP.md
│
├─ Test locally first
│  └─ Run: docker-compose up --build
│
└─ Learn about the project
   └─ Read: README.md

Need a command?
├─ View logs
│  └─ gcloud run logs read babyhealth --follow
│
├─ Redeploy
│  └─ ./deploy/deploy.sh
│
├─ Update service
│  └─ gcloud run deploy babyhealth --image=...
│
└─ Delete service
   └─ gcloud run services delete babyhealth

Troubleshooting?
├─ Quick help
│  └─ See: DEPLOYMENT_QUICK_REFERENCE.md
│
├─ Detailed guide
│  └─ See: deploy/DEPLOYMENT_GUIDE.md
│
└─ Docker issues
   └─ docker build . && docker run -p 8080:8080 ...
```

## File Locations Quick Reference

| Purpose | File | Location |
|---------|------|----------|
| Build & deploy to Cloud Run | deploy.sh | `/deploy/deploy.sh` |
| Docker build | Dockerfile | `/Dockerfile` |
| Local Docker testing | docker-compose.yml | `/docker-compose.yml` |
| Backend + frontend serving | main.py | `/backend/main.py` (modified) |
| Environment variables | .env.example | `/.env.example` |
| Project documentation | README.md | `/README.md` |
| Quick commands | DEPLOYMENT_QUICK_REFERENCE.md | `/DEPLOYMENT_QUICK_REFERENCE.md` |
| Detailed guide | DEPLOYMENT_GUIDE.md | `/deploy/DEPLOYMENT_GUIDE.md` |
| GitHub Actions workflow | deploy-to-cloud-run.yml | `/.github/workflows/deploy-to-cloud-run.yml` |
| GitHub Actions setup | GITHUB_ACTIONS_SETUP.md | `/.github/GITHUB_ACTIONS_SETUP.md` |
| Build exclusions | .dockerignore | `/.dockerignore` |
| Cloud Build config | cloudbuild.yaml | `/deploy/cloudbuild.yaml` |

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│      Google Cloud Run (Free Tier)           │
│                                              │
│  ┌────────────────────────────────────┐    │
│  │   Docker Container (512Mi, CPU=1)  │    │
│  │                                    │    │
│  │  ┌──────────────────────────────┐ │    │
│  │  │  FastAPI Backend             │ │    │
│  │  │  - /api/* routes             │ │    │
│  │  │  - /health endpoint          │ │    │
│  │  │  - /docs (API docs)          │ │    │
│  │  └──────────────────────────────┘ │    │
│  │                                    │    │
│  │  ┌──────────────────────────────┐ │    │
│  │  │  React Frontend (Static)     │ │    │
│  │  │  - /* routes                 │ │    │
│  │  │  - SPA routing               │ │    │
│  │  └──────────────────────────────┘ │    │
│  │                                    │    │
│  └────────────────────────────────────┘    │
│                                              │
└─────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────┐
│  Google Artifact Registry (Dockerimg)       │
└──────────────────────────────────────────────┘
         ↑
┌──────────────────────────────────────────────┐
│  Local: docker build . && docker push       │
│  OR                                         │
│  GitHub: Automatic on push (if configured)  │
└──────────────────────────────────────────────┘
```

## Prerequisites Checklist

Before deployment:
- [ ] Google Cloud account created
- [ ] Billing enabled on GCP project
- [ ] gcloud CLI installed
- [ ] Docker installed and running
- [ ] git repository cloned locally
- [ ] Node 18+ installed (for local frontend development)
- [ ] Python 3.11+ installed (for local backend development)

## Deployment Path

1. **Prepare** (5 min)
   - Ensure prerequisites met
   - Backend main.py updated (already done)
   - Frontend dist/ built (done by Docker)

2. **Deploy** (5-10 min)
   - Run: `./deploy/deploy.sh`
   - Script handles everything
   - Receive service URL

3. **Verify** (2 min)
   - Health check: `curl $URL/health`
   - Frontend: Visit $URL
   - API docs: Visit $URL/docs

4. **Monitor** (ongoing)
   - View logs: `gcloud run logs read babyhealth`
   - Check metrics: GCP Console

## Cost Summary

| Metric | Free Tier | Typical Usage | Estimated Cost |
|--------|-----------|---------------|-----------------|
| Requests/month | 2M | 50k | $0 |
| GB-seconds | 400k | 1.2k | $0 |
| Memory GB-seconds | 1M | 3.6k | $0 |
| **Monthly Cost** | - | - | **$0** |

Free tier covers typical family usage (1-4 babies). Scales up as needed.

## Getting Help

### For Quick Answers
- See: `DEPLOYMENT_QUICK_REFERENCE.md`
- See: Troubleshooting section in `DEPLOYMENT_GUIDE.md`

### For Detailed Information
- See: `README.md` - Project overview
- See: `deploy/DEPLOYMENT_GUIDE.md` - Complete guide
- See: `.github/GITHUB_ACTIONS_SETUP.md` - GitHub Actions setup

### For Issues
- Check GCP Console for deployment details
- View logs: `gcloud run logs read babyhealth`
- Test locally: `docker-compose up --build`
- Verify image: `docker build .`

## Next Steps

### For First-Time Deployment
1. Read: `README.md` (project overview)
2. Read: `DEPLOYMENT_QUICK_REFERENCE.md` (commands)
3. Run: `./deploy/deploy.sh`
4. Visit: Your service URL

### For Regular Deployments
1. Make code changes
2. Commit: `git commit -m "..."`
3. Push: `git push origin main`
4. Deploy: `./deploy/deploy.sh` (manual) or wait for GitHub Actions (auto)
5. Monitor: `gcloud run logs read babyhealth --follow`

### For Advanced Setup
1. Read: `deploy/DEPLOYMENT_GUIDE.md` (detailed guide)
2. Read: `.github/GITHUB_ACTIONS_SETUP.md` (GitHub Actions)
3. Follow: Specific instructions for your use case
4. Customize: Configuration as needed

---

## Summary

All deployment files have been created and the project is ready to deploy to Google Cloud Run's free tier.

**Start here**: Run `./deploy/deploy.sh`

**Questions?** See the relevant documentation file above.

**Version**: 1.0
**Created**: April 2024
**Status**: Ready for Production
