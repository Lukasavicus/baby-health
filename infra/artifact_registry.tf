resource "google_artifact_registry_repository" "babyhealth" {
  location      = var.region
  repository_id = "babyhealth"
  format        = "DOCKER"
  description   = "Docker images for BabyHealth app"

  depends_on = [google_project_service.apis]
}
