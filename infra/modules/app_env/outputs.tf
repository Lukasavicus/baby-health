output "cloud_run_url" {
  description = "Public URL of the Cloud Run service"
  value       = google_cloud_run_v2_service.app.uri
}

output "data_bucket" {
  description = "GCS bucket for persistent data"
  value       = google_storage_bucket.data.name
}

output "service_account_email" {
  description = "Cloud Run service account email"
  value       = google_service_account.app.email
}

output "jwt_secret_id" {
  description = "Secret Manager ID for JWT"
  value       = google_secret_manager_secret.jwt.secret_id
}
