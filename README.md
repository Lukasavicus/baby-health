# BabyHealth

A Samsung Health-inspired baby health tracking application that helps parents and caregivers monitor their baby's daily activities, health metrics, and development milestones.

## Overview

BabyHealth is a comprehensive baby tracking system designed to:
- Track daily activities (feeding, diaper changes, sleep patterns)
- Monitor health metrics and vital signs
- Record developmental milestones
- Manage multiple babies and caregivers
- Provide health insights through interactive dashboards
- Ensure data consistency across the family

## Features

### Core Functionality
- **Baby Profiles**: Create and manage profiles for multiple babies with detailed information
- **Event Tracking**: Log various events including feeding, diaper changes, sleep, temperature, and medications
- **Caregiver Management**: Add multiple caregivers with different access levels
- **Dashboard Analytics**: View health trends, feeding patterns, and development insights with interactive charts
- **Health Insights**: Get smart recommendations and alerts based on tracked data
- **Data Export**: Generate reports and export health data for medical consultations

### Technical Features
- RESTful API with comprehensive endpoints
- Real-time data synchronization
- Responsive web interface
- Cross-browser compatible
- Mobile-optimized design

## Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Interactive charting library
- **Lucide React** - Icon library

### Backend
- **Python 3.11** - Runtime language
- **FastAPI** - Modern async web framework
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation and serialization

### Deployment
- **Docker** - Containerization
- **Google Cloud Run** - Serverless container hosting
- **Google Artifact Registry** - Docker image storage
- **Google Cloud Build** - CI/CD pipeline

## Project Structure

```
BabyHealth/
├── frontend/                 # React frontend application
│   ├── src/                 # React components and utilities
│   ├── public/              # Static assets
│   ├── dist/                # Built frontend (generated)
│   ├── index.html           # HTML entry point
│   ├── vite.config.js       # Vite configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   └── package.json         # Frontend dependencies
│
├── backend/                  # FastAPI backend application
│   ├── main.py              # Application entry point
│   ├── config.py            # Configuration management
│   ├── requirements.txt      # Python dependencies
│   ├── models/              # Pydantic data models
│   ├── routers/             # API route handlers
│   ├── repositories/        # Data access layer
│   ├── services/            # Business logic
│   ├── tests/               # Unit and integration tests
│   ├── data/                # Local data storage
│   └── API_REFERENCE.md     # Complete API documentation
│
├── deploy/                   # Deployment configuration
│   ├── deploy.sh            # Deployment automation script
│   └── cloudbuild.yaml      # Google Cloud Build configuration
│
├── docs/                     # Project documentation
├── Dockerfile               # Docker build configuration
├── docker-compose.yml       # Local development setup
└── .dockerignore            # Docker build exclusions
```

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker and Docker Compose (for containerized development)
- Google Cloud account (for GCP deployment)

### Local Development

#### Option 1: Direct Development (Recommended for development)

**Backend Setup:**
```bash
cd backend
python -m venv venv

# On macOS/Linux
source venv/bin/activate
# On Windows
venv\Scripts\activate

pip install -r requirements.txt
python main.py
```

Backend will be available at `http://localhost:8080`

**Frontend Setup (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

Frontend dev server will be available at `http://localhost:5173`

#### Option 2: Docker Compose (Recommended for testing production setup)

```bash
docker-compose up --build
```

Then visit `http://localhost:8080`

### API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:8080/docs`
- ReDoc: `http://localhost:8080/redoc`
- API Reference: `backend/API_REFERENCE.md`

## Deployment

### Deploy to Google Cloud Run

The easiest and most cost-effective deployment option for BabyHealth is Google Cloud Run, which offers:
- **Free tier**: 2 million requests per month
- **Auto-scaling**: Handles traffic automatically
- **No server management**: Fully managed service
- **Pay-as-you-go**: Only pay for what you use

#### Prerequisites
- Google Cloud account with billing enabled
- `gcloud` CLI installed: https://cloud.google.com/sdk/docs/install
- Docker installed locally (for building the container)

#### Deployment Steps

1. **Run the deployment script:**
   ```bash
   ./deploy/deploy.sh [optional-project-id]
   ```

   If no project ID is provided, it defaults to `baby-health-app`.

   The script will:
   - Create a new GCP project (if it doesn't exist)
   - Enable required APIs (Cloud Run, Cloud Build, Artifact Registry)
   - Set up Artifact Registry for Docker images
   - Build and push the Docker image
   - Deploy to Cloud Run
   - Output the public URL

2. **Access your deployment:**
   ```
   https://babyhealth-[region]-[project-id].a.run.app
   ```

3. **Monitor your service:**
   ```bash
   # View logs
   gcloud run logs read babyhealth --region=us-central1

   # View metrics and details
   gcloud run services describe babyhealth --region=us-central1
   ```

### Cost Estimation

**Cloud Run Free Tier (Monthly)**
- 2 million requests included (no charges)
- 400,000 GB-seconds of compute (free)
- 1 million GB-seconds of memory (free)

**Typical Usage** (small-to-medium family)
- ~50,000 requests/month (tracking ~5 events/day per baby)
- Estimated monthly cost: **$0** (within free tier)

For enterprise or high-volume usage, costs are:
- $0.40 per 1 million requests (after free tier)
- $0.00002500 per GB-second

## Building for Production

### Create Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build Docker image locally
docker build -t babyhealth:latest .

# Test locally
docker run -p 8080:8080 babyhealth:latest
```

### Environment Variables

Configure these environment variables in your Cloud Run service:

```
PORT=8080                    # Required for Cloud Run
DEBUG=false                  # Disable debug mode in production
STORAGE_TYPE=json           # Type of storage (json or sqlite)
CORS_ALLOWED_ORIGINS=["https://yourdomain.com"]  # CORS origins
```

## API Overview

The backend provides the following main API endpoints:

### Babies Management
- `GET /api/babies` - List all babies
- `POST /api/babies` - Create new baby
- `GET /api/babies/{baby_id}` - Get baby details
- `PUT /api/babies/{baby_id}` - Update baby
- `DELETE /api/babies/{baby_id}` - Delete baby

### Events Tracking
- `GET /api/events` - List events
- `POST /api/events` - Create new event
- `GET /api/events/{event_id}` - Get event details
- `PUT /api/events/{event_id}` - Update event
- `DELETE /api/events/{event_id}` - Delete event

### Dashboard & Analytics
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/trends` - Get health trends
- `GET /api/dashboard/insights` - Get AI insights and recommendations

### Caregivers
- `GET /api/caregivers` - List caregivers
- `POST /api/caregivers` - Add caregiver
- `DELETE /api/caregivers/{caregiver_id}` - Remove caregiver

See `backend/API_REFERENCE.md` for detailed documentation.

## Development Workflow

### Running Tests

```bash
cd backend
pytest tests/ -v

# With coverage
pytest tests/ --cov=. --cov-report=html
```

### Code Quality

```bash
# Lint frontend
cd frontend
npm run lint

# Format Python code
black backend/
```

### Building Frontend Assets

```bash
cd frontend
npm run build

# Output will be in frontend/dist/
```

## Troubleshooting

### Frontend not loading in production

Ensure the backend's `main.py` has the static files mount. Check logs:
```bash
gcloud run logs read babyhealth --region=us-central1 --limit=50
```

### API requests failing in production

Check CORS settings in backend configuration and ensure the frontend origin is whitelisted.

### Cloud Run deployment fails

1. Verify Docker is properly built: `docker build -t test . && docker run test`
2. Check gcloud authentication: `gcloud auth list`
3. Ensure APIs are enabled: `gcloud services list --enabled`
4. Check Cloud Build logs in GCP Console

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork and clone** the repository
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and test thoroughly
4. **Commit with clear messages**: `git commit -m "Add feature description"`
5. **Push to your fork**: `git push origin feature/your-feature`
6. **Create a Pull Request** with description of changes

### Code Style
- **Python**: Follow PEP 8 (use `black` for formatting)
- **JavaScript**: Follow ESLint configuration
- **Commits**: Use conventional commit messages

## Performance Optimization

### Frontend Optimization
- Code splitting for lazy-loaded routes
- Image optimization with responsive images
- CSS minification via Tailwind
- JavaScript bundling with Vite

### Backend Optimization
- Async request handling with FastAPI
- Efficient data queries in repositories
- Caching strategies for dashboard data
- Database indexing for frequently queried fields

### Deployment Optimization
- Multi-stage Docker build reduces image size
- Alpine base image for minimal footprint
- Health checks for graceful updates
- Auto-scaling configuration for Cloud Run

## Security Considerations

- API keys and secrets stored in environment variables
- CORS configured to allow only trusted origins
- Input validation with Pydantic models
- SQL injection prevention through ORM
- HTTPS enforced in production
- Regular security updates for dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions:
1. Check the documentation files in the `docs/` directory
2. Review API documentation at `/docs` endpoint
3. Open an issue on GitHub
4. Contact the development team

## Changelog

### v0.1.0 (Initial Release)
- Core baby profile management
- Event tracking system
- Caregiver management
- Dashboard with analytics
- Cloud Run deployment support

---

**Last Updated**: April 2024
**Version**: 0.1.0
**Status**: Active Development
