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
    prefix = "terraform/state/prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

data "terraform_remote_state" "shared" {
  backend = "gcs"

  config = {
    bucket = "babyhealth-tfstate"
    prefix = "terraform/state/shared"
  }
}

module "app" {
  source = "../../modules/app_env"

  project_id             = var.project_id
  region                 = var.region
  artifact_repository_id = data.terraform_remote_state.shared.outputs.artifact_registry_repository_id

  docker_image_name            = "babyhealth"
  cloud_run_service_name       = "babyhealth"
  service_account_id           = "babyhealth-run"
  service_account_display_name = "BabyHealth Cloud Run (prod)"
  jwt_secret_id                = "babyhealth-jwt-secret"

  jwt_secret = var.jwt_secret

  gcs_bucket_name_suffix = "data"
  gcs_versioning_enabled = true
  max_instance_count     = 5
  debug                  = "false"
  babyhealth_use_ui_seed = "1"
}
