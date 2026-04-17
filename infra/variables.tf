variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "jwt_secret" {
  description = "JWT signing secret for the API"
  type        = string
  sensitive   = true
}
