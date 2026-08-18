terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

resource "google_storage_bucket" "data" {
  name                        = "${var.project_id}-${var.gcs_bucket_name_suffix}"
  location                    = var.region
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  force_destroy               = false

  dynamic "versioning" {
    for_each = var.gcs_versioning_enabled ? [1] : []
    content {
      enabled = true
    }
  }

  dynamic "lifecycle_rule" {
    for_each = var.gcs_versioning_enabled ? [1] : []
    content {
      condition {
        num_newer_versions = 3
      }
      action {
        type = "Delete"
      }
    }
  }
}

resource "google_service_account" "app" {
  account_id   = var.service_account_id
  display_name = var.service_account_display_name
}

resource "google_storage_bucket_iam_member" "app_data" {
  bucket = google_storage_bucket.data.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app.email}"
}

resource "google_secret_manager_secret" "jwt" {
  secret_id = var.jwt_secret_id

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt" {
  secret      = google_secret_manager_secret.jwt.id
  secret_data = var.jwt_secret
}

resource "google_secret_manager_secret_iam_member" "jwt_access" {
  secret_id = google_secret_manager_secret.jwt.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app.email}"
}

resource "google_cloud_run_v2_service" "app" {
  name     = var.cloud_run_service_name
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.app.email

    scaling {
      min_instance_count = 0
      max_instance_count = var.max_instance_count
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repository_id}/${var.docker_image_name}:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "STORAGE_TYPE"
        value = "gcs"
      }

      env {
        name  = "GCS_BUCKET"
        value = google_storage_bucket.data.name
      }

      env {
        name  = "BABYHEALTH_USE_UI_SEED"
        value = var.babyhealth_use_ui_seed
      }

      env {
        name  = "DEBUG"
        value = var.debug
      }

      env {
        name = "JWT_SECRET"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.jwt.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          memory = "512Mi"
          cpu    = "1"
        }
      }
    }
  }

  depends_on = [
    google_secret_manager_secret_version.jwt,
  ]
}

resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
