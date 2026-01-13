# Technical Documentation

## Architecture Overview
The system follows a layered architecture to ensure separation of concerns and scalability.

```
Request -> Bot Handler -> Decision Engine -> Media Provider -> Response
```

### 1. Bot Handler (`src/bot`)
- **Library**: `Telegraf`
- **Role**: Validates user session, rate limiting (future), and routes commands (`/start`, text messages).
- **Files**: `handlers.js` (logic), `index.js` (setup).

### 2. Decision Engine (`src/services/decisionEngine.js`)
- **Role**: The "Brain".
- **Logic**:
  1. Validates URL format (`validator.js`).
  2. Detects Platform (Instagram vs Twitter).
  3. Calls the appropriate Provider.
  4. Handles errors (Exceptions -> User friendly messages).

### 3. Media Provider (`src/services/mediaProvider.js`)
- **Role**: The "Muscle". Extracts data from URLs.
- **Evolution**:
  - **Phase 1**: Returned Mock Data (static video).
  - **Phase 2**: Used `axios` + `cheerio` for Open Graph tags.
  - **Phase 3 (Current)**: Uses `yt-dlp` (Python engine) for decryption and extraction of direct video blobs.

### 4. Server (`src/server.js`)
- **Framework**: Express.js
- **Role**: Exposes HTTP endpoints.
  - `/health`: For monitoring uptime.
  - `/webhook`: (Optional) specifically for Telegram Webhooks in Production.

## External Dependencies
- **yt-dlp**: requires Python 3.10+. This is a binary dependency wrapped by `youtube-dl-exec`.
- **Axios**: HTTP Client (used for fallbacks).

## Future Roadmap (Phase 4)
- **Queue System**: Redis/Bull for handling concurrent large downloads.
- **Database**: PostgreSQL for user history and analytics.
- **Premium Tier**: Gate specific features behind payment.
