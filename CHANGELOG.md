# Changelog

All notable changes to the **Gheychee Lite Bot** will be documented in this file.

## [1.0.0] - 2026-01-13 (Production Stable)
### 🚀 Released
- **Stable Deployment**: Fully operational on Google Cloud Run (Europe-West1).
- **Core Engine**: Python 3.11 + Node.js 18 Hybrid Runtime for `yt-dlp` support.
- **Bot Identity**: Live as `@gheycheelight_bot`.

### ✨ Features
- **Video Download**: Extracts high-quality MP4s from Instagram & X (Twitter).
- **Hybrid Architecture**:
  - *Dev Mode*: Polling (Locally).
  - *Prod Mode*: Async Webhooks (Cloud Run).
- **Error Handling**: Granular error messages exposed to user for debugging (fixed "undefined" bug).
- **Branding**: Ashavid footer and social links included in every caption.

### 🐛 Fixed
- **Cloud Timeout**: Made Webhook setup asynchronous to prevent Cloud Run health check failures.
- **Python Runtime**: Updated Dockerfile to explicitly install `python3` alongside Node.js, resolving "No such file or directory" errors.
- **Token Config**: Added production environment variables setup guide.

---
**Maintained by [Ashavid](https://ashavid.ca/)**
*Helping immigrant founders build defensible businesses in Canada.*
