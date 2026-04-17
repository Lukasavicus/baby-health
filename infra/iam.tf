resource "google_service_account" "app" {
  account_id   = "babyhealth-run"
  display_name = "BabyHealth Cloud Run"

  depends_on = [google_project_service.apis]
}

# Allow the Cloud Run SA to read/write data bucket
resource "google_storage_bucket_iam_member" "app_data" {
  bucket = google_storage_bucket.data.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_service_account.app.email}"
}

# JWT secret
resource "google_secret_manager_secret" "jwt" {
  secret_id = "babyhealth-jwt-secret"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "jwt" {
  secret      = google_secret_manager_secret.jwt.id
  secret_data = var.jwt_secret
}

# Allow Cloud Run SA to read the JWT secret
resource "google_secret_manager_secret_iam_member" "jwt_access" {
  secret_id = google_secret_manager_secret.jwt.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.app.email}"
}

# Allow public access to Cloud Run
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.app.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}
