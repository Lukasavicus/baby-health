output "cloud_run_url" {
  description = "Public URL of the Cloud Run service (dev)"
  value       = module.app.cloud_run_url
}

output "data_bucket" {
  description = "GCS bucket for persistent data (dev)"
  value       = module.app.data_bucket
}

output "artifact_registry_url_prefix" {
  description = "Docker registry path prefix from shared stack"
  value       = data.terraform_remote_state.shared.outputs.artifact_registry_url_prefix
}

output "service_account_email" {
  value = module.app.service_account_email
}
