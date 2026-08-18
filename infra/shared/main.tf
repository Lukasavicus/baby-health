terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "babyhealth-tfstate"
    prefix = "terraform/state/shared"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
  ])

  service            = each.value
  disable_on_destroy = false
}

resource "google_artifact_registry_repository" "babyhealth" {
  location      = var.region
  repository_id = "babyhealth"
  format        = "DOCKER"
  description   = "Docker images for BabyHealth app"

  depends_on = [google_project_service.apis]
}
