variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "artifact_repository_id" {
  description = "Artifact Registry repository ID (Docker)"
  type        = string
}

variable "docker_image_name" {
  description = "Docker image name inside the repository (e.g. babyhealth or babyhealth-dev)"
  type        = string
}

variable "cloud_run_service_name" {
  description = "Cloud Run service name"
  type        = string
}

variable "service_account_id" {
  description = "Service account account_id (no @)"
  type        = string
}

variable "service_account_display_name" {
  description = "Human-readable SA name"
  type        = string
}

variable "jwt_secret_id" {
  description = "Secret Manager secret ID for JWT"
  type        = string
}

variable "jwt_secret" {
  description = "JWT signing secret value"
  type        = string
  sensitive   = true
}

variable "gcs_bucket_name_suffix" {
  description = "Bucket name will be project_id + '-' + suffix (e.g. data or data-dev)"
  type        = string
}

variable "gcs_versioning_enabled" {
  description = "Enable GCS object versioning (recommended for prod)"
  type        = bool
}

variable "max_instance_count" {
  description = "Cloud Run max instances"
  type        = number
}

variable "debug" {
  description = "DEBUG env for the API"
  type        = string
}

variable "babyhealth_use_ui_seed" {
  description = "BABYHEALTH_USE_UI_SEED env"
  type        = string
}
