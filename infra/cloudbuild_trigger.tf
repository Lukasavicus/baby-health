# Automatic deploy on push to main (requires GitHub app connection).
# If the Cloud Build GitHub app is not yet connected to the repo,
# this resource will fail — connect it first at:
# https://console.cloud.google.com/cloud-build/triggers/connect?project=baby-health-492304

# resource "google_cloudbuild_trigger" "deploy" {
#   name     = "babyhealth-deploy"
#   location = var.region
#   filename = "deploy/cloudbuild.yaml"
#
#   github {
#     owner = "Lukasavicus"
#     name  = "baby-health"
#     push {
#       branch = "^main$"
#     }
#   }
#
#   depends_on = [google_project_service.apis]
# }

# NOTE: Uncomment the block above after connecting the GitHub repo
# to Cloud Build via the GCP console. Until then, deploy manually
# with: gcloud run deploy --source=. (or via deploy/cloudbuild.yaml)
