# Gheychee Video Downloader Bot ✂️

A lightweight, Modular Telegram bot for downloading video content.

**🤖 Live Bot**: [@gheycheelight_bot](https://t.me/gheycheelight_bot)

---

### ⚠️ Disclaimer (Internal Use)
**This bot is an internal and educational tool.**
It may only be used with content that:
*   You own, or
*   You have explicit permission to use, or
*   Is legally reusable under a valid license.

Ashavid makes no claim that your use of this tool is lawful and assumes no responsibility for violations of copyright, platform terms (Instagram, X, Telegram), or third-party rights.
The tool is experimental and may produce errors, incomplete output, or unexpected results. You are responsible for verifying and using the output appropriately.

See: [Full Terms of Use](TERMS_OF_USE.md) | [No Storage Policy](PRIVACY_POLICY.md)

---

## Features
- **URL Validation**: Handles Instagram and X (Twitter) links.
- **Platform Detection**: Automatically identifies source platform.
- **Link Preview**: Fetches Author, Title, and Thumbnail (Phase 2).
- **Video Extraction**: Downloads high-quality video using `yt-dlp` engine (Phase 3).
- **Graceful Error Handling**: Fallbacks for private/blocked content.

## Tech Stack
- **Runtime**: Node.js 18+ (Bot Logic) & Python 3.10+ (Downloader Engine)
- **Framework**: Telegraf (Telegram API)
- **Server**: Express (Webhook support)
- **Core Library**: `yt-dlp` (via `youtube-dl-exec`)

## Getting Started

1.  **Clone the repo**:
    ```bash
    git clone https://github.com/farjadp/gheychee-lightversion.git
    cd gheychee-lightversion
    ```

2.  **Install Dependencies**:
    Requires Node.js and Python 3.10+
    ```bash
    npm install
    # Ensure you have python3 installed (brew install python)
    ```

3.  **Configure**:
    Rename `.env.example` to `.env` and add your bot token:
    ```bash
    cp .env.example .env
    # Edit BOT_TOKEN=...
    ```

4.  **Run**:
    ```bash
    npm start
    ```

## About Ashavid
**Ashavid** is a digital transformation and startup mentorship firm. We help immigrant founders build defensible businesses in Canada, not just visa applications.

- 🌐 [Website](https://ashavid.ca/)
- 🔗 [LinkedIn](https://www.linkedin.com/company/ashavid/)
- 📺 [YouTube](https://www.youtube.com/@ashavidgroup)
- ✖️ [X (Twitter)](https://x.com/ashavidgroup)

## Deployment
See [DEPLOY.md](DEPLOY.md) for Google Cloud Run instructions.
