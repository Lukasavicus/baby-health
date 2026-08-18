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
  description = "JWT signing secret for dev (use a different value than prod)"
  type        = string
  sensitive   = true
}
