# 🚀 Deployment Guide: Google Cloud Run

This guide explains how to deploy the **Gheychee Lite Bot** to Google Cloud Run. This project is containerized using Docker and supports a Hybrid architecture (Polling for Dev, Webhook for Cloud).

## Prerequisites

1.  **Google Cloud SDK**: Install via `brew install --cask google-cloud-sdk`.
2.  **Login**: Run `gcloud auth login`.
3.  **Project**: Have a Google Cloud Project ready.

## Quick Deploy

Run the following command in your terminal.
Replace `YOUR_PROJECT_ID` with your actual project ID and `YOUR_BOT_TOKEN` with your Telegram Bot Token.

```bash
gcloud run deploy gheychee-lightversion \
  --source . \
  --project=gheychee-lightversion \
  --region=europe-west1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,APP_URL=https://gheychee-lightversion-132929080538.europe-west1.run.app,BOT_TOKEN="7991483348:AAGFqR8shfhYg8lj_hj7Vw0AyJw3zBfHN24"
```

### About the Environment Variables:
-   `BOT_TOKEN`: Your secret Telegram token (Included in command above).
-   `NODE_ENV="production"`: Tells the bot to switch to **Webhook Mode**.
-   `APP_URL`: **Required**. The URL of your Cloud Run service.

## Continuous Deployment (CI/CD)

For automated deployments, connect this repository to **Google Cloud Build**:
1.  Go to Cloud Run Console.
2.  Click "Edit & Deploy New Revision".
3.  Select "Continuously deploy new revisions from a source repository".
4.  Link your GitHub repo: `https://github.com/farjadp/gheychee-lightversion.git`

## About Ashavid
**Ashavid** is a digital transformation and startup mentorship firm. We help immigrant founders build defensible businesses in Canada.

[https://ashavid.ca/](https://ashavid.ca/)
