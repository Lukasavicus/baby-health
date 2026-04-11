resource "google_cloud_run_v2_service" "app" {
  name     = "babyhealth"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.app.email

    scaling {
      min_instance_count = 0
      max_instance_count = 2
    }

    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.babyhealth.repository_id}/babyhealth:latest"

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
        value = "1"
      }

      env {
        name  = "DEBUG"
        value = "false"
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
    google_project_service.apis,
    google_secret_manager_secret_version.jwt,
  ]
}
