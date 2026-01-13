# Changelog

All notable changes to the **Gheychee Lite Bot** will be documented in this file.

## [1.0.0] - 2026-01-13
### Added
- **Core Bot**: Telegraf + Express architecture.
- **Platform Detection**: Smart regex for Instagram and Twitter (X).
- **yt-dlp Engine**: Integrated `youtube-dl-exec` for reliable, high-quality video extraction (bypassing blob encryption).
- **Hybrid Mode**: Automatic switching between Polling (Dev) and Webhooks (Production) based on `NODE_ENV`.
- **Customization**: Added Persian footer with Ashavid branding to all video downloads.
- **Documentation**: Comprehensive README, TECHNICAL, and DEPLOY guides.

### Fixed
- **X/Twitter Scrape**: Replaced failing OpenGraph scraping with OEmbed fallback and correctly switched to `yt-dlp` for video files.
- **Docker**: Created multi-stage Dockerfile supporting both Node.js and Python 3.10+ runtimes.

---
**Maintained by [Ashavid](https://ashavid.ca/)**
*Helping immigrant founders build defensible businesses in Canada.*
