output "artifact_registry_repository_id" {
  description = "Artifact Registry Docker repository ID"
  value       = google_artifact_registry_repository.babyhealth.repository_id
}

output "artifact_registry_url_prefix" {
  description = "Registry hostname path without image name"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babyhealth.repository_id}"
}

output "project_id" {
  value = var.project_id
}

output "region" {
  value = var.region
}
