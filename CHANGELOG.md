# Changelog

All notable changes to the **Gheychee Lite Bot** will be documented in this file.

## [1.2.0] - 2026-01-14 (Reliability Update)
### 🔄 Cloud Native Scheduling
- **Replaced Node-Cron**: Removed internal cron to prevent data loss during scale-to-zero.
- **New Endpoint**: POST `/cron/daily-report` for external triggering (Cloud Scheduler).
- **Manual Stats**: Added `/stats` command for Admin to peek at metrics without resetting the daily counter.
- **Refactored Logger**: Split `getAndResetStats` logic to support non-destructive reading.

### 📢 Broadcast System
- **Firestore Database**: Integrated `firebase-admin` to persist user data (ID, Name) securely.
- **Broadcast Command**: Added `/broadcast [Message]` for Admin-to-All announcements.
- **Middleware**: Automatic user registration on every interaction.

### 🛡️ Native Monitoring (Zero-Dependency)
- **Removed Sentry**: Replaced external dependency with a lightweight, internal logger.
- **Smart Alerts**: Critical errors (e.g., Login Required, 429) trigger instant Telegram Admin alerts.
- **Privacy Update**: Updated policy to reflect minimal data storage (User IDs) for notifications.

## [1.1.0] - 2026-01-13 (Phase 5 Update)
### 🛡️ Monitoring & Alerting
- **Sentry Integration**: Added global error tracking (captured in `logger.js`) - *Deprecated in v1.2.0*.
- **Telegram Alerts**: Critical errors (e.g., `yt-dlp` failures) are now sent directly to Admin Chat.
- **Daily Reports**: Implemented `stats.js` with `node-cron` to send usage metrics (Total/Success/Fail) every day at 08:00 AM.
- **Logger Service**: Centralized logging system acting as a filter between Console, Sentry, and Telegram.

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
