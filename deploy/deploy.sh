#!/bin/bash

#
# BabyHealth Deployment Script for Google Cloud Run
# This script deploys the application to Google Cloud Run (free tier)
# Usage: ./deploy/deploy.sh [project-id]
#

set -e

# Configuration
PROJECT_ID="${1:-baby-health-app}"
REGION="us-central1"
SERVICE_NAME="babyhealth"
ARTIFACT_REPO="babyhealth"
IMAGE_NAME="${REGION}-docker.pkg.dev/${PROJECT_ID}/${ARTIFACT_REPO}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    log_error "gcloud CLI is not installed. Please install it from https://cloud.google.com/sdk/docs/install"
    exit 1
fi

log_info "Starting BabyHealth deployment to Google Cloud Run"
log_info "Project ID: ${PROJECT_ID}"
log_info "Region: ${REGION}"
log_info "Service: ${SERVICE_NAME}"

# Step 1: Create GCP project (if it doesn't exist)
log_info "Step 1: Checking GCP project..."
if gcloud projects describe "${PROJECT_ID}" &> /dev/null; then
    log_success "Project '${PROJECT_ID}' already exists"
else
    log_warn "Project '${PROJECT_ID}' does not exist. Creating..."
    gcloud projects create "${PROJECT_ID}" \
        --name="BabyHealth App" \
        --enable-cloud-apis
    log_success "Project '${PROJECT_ID}' created"
fi

# Set the current project
gcloud config set project "${PROJECT_ID}"

# Step 2: Enable required APIs
log_info "Step 2: Enabling required Google Cloud APIs..."

apis=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "containerregistry.googleapis.com"
)

for api in "${apis[@]}"; do
    log_info "Enabling ${api}..."
    gcloud services enable "${api}" --quiet || log_warn "Could not enable ${api} (may already be enabled)"
done

log_success "APIs enabled"

# Step 3: Create Artifact Registry repository
log_info "Step 3: Setting up Artifact Registry repository..."

if gcloud artifacts repositories describe "${ARTIFACT_REPO}" \
    --location="${REGION}" &> /dev/null; then
    log_success "Repository '${ARTIFACT_REPO}' already exists"
else
    log_warn "Creating Artifact Registry repository '${ARTIFACT_REPO}'..."
    gcloud artifacts repositories create "${ARTIFACT_REPO}" \
        --repository-format=docker \
        --location="${REGION}" \
        --description="BabyHealth Docker repository"
    log_success "Repository created"
fi

# Step 4: Configure Docker authentication
log_info "Step 4: Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet
log_success "Docker authentication configured"

# Step 5: Build and push Docker image
log_info "Step 5: Building and pushing Docker image..."

# Get the root directory of the project
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}"

log_info "Building Docker image: ${IMAGE_NAME}:latest"
docker build -t "${IMAGE_NAME}:latest" .

log_success "Docker image built successfully"

log_info "Pushing Docker image to Artifact Registry..."
docker push "${IMAGE_NAME}:latest"
log_success "Docker image pushed successfully"

# Step 6: Deploy to Cloud Run
log_info "Step 6: Deploying to Google Cloud Run..."

# Check if service already exists
if gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" &> /dev/null 2>&1; then
    log_info "Service '${SERVICE_NAME}' already exists. Updating..."

    gcloud run deploy "${SERVICE_NAME}" \
        --image="${IMAGE_NAME}:latest" \
        --region="${REGION}" \
        --platform=managed \
        --allow-unauthenticated \
        --memory=512Mi \
        --cpu=1 \
        --max-instances=100 \
        --min-instances=0 \
        --port=8080 \
        --quiet
else
    log_info "Creating new Cloud Run service '${SERVICE_NAME}'..."

    gcloud run deploy "${SERVICE_NAME}" \
        --image="${IMAGE_NAME}:latest" \
        --region="${REGION}" \
        --platform=managed \
        --allow-unauthenticated \
        --memory=512Mi \
        --cpu=1 \
        --max-instances=100 \
        --min-instances=0 \
        --port=8080
fi

log_success "Deployment completed successfully"

# Step 7: Get the service URL
log_info "Step 7: Retrieving service URL..."

SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --region="${REGION}" \
    --format='value(status.url)')

log_success "Deployment Complete!"
echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}BabyHealth is now live!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo -e "Service URL: ${BLUE}${SERVICE_URL}${NC}"
echo -e "API Docs: ${BLUE}${SERVICE_URL}/docs${NC}"
echo -e "Health Check: ${BLUE}${SERVICE_URL}/health${NC}"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Visit the service URL to access your BabyHealth app"
echo "2. View API documentation at /docs endpoint"
echo "3. Monitor logs: gcloud run logs read ${SERVICE_NAME} --region=${REGION}"
echo "4. View metrics: https://console.cloud.google.com/run/detail/${REGION}/${SERVICE_NAME}"
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  # View logs"
echo "  gcloud run logs read ${SERVICE_NAME} --region=${REGION} --limit 50"
echo ""
echo "  # Scale down (save costs)"
echo "  gcloud run deploy ${SERVICE_NAME} --min-instances=0 --region=${REGION}"
echo ""
echo "  # Delete service"
echo "  gcloud run services delete ${SERVICE_NAME} --region=${REGION}"
echo ""
