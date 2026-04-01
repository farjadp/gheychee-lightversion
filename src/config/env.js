// ============================================================================
// Hardware Source: src/config/env.js
// Version: 1.1.0
// Why: Centralize environment variables and configuration constants
// Changelog: Added INSTAGRAM_COOKIES_FILE for yt-dlp auth support
// Env / Identity: uses process.env
// ============================================================================

require('dotenv').config();

const config = {
  // Bot Token from Telegram Father
  BOT_TOKEN: process.env.BOT_TOKEN,

  // Port for the Express server (Webhook/Health checks)
  PORT: process.env.PORT || 3000,

  // App URL for Webhook setting (Required in Production)
  // Example: https://gheychee-lightversion-xyz.run.app
  APP_URL: process.env.APP_URL,

  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Supported Platforms Enum
  PLATFORMS: {
    INSTAGRAM: 'INSTAGRAM',
    TWITTER: 'TWITTER', // X
    UNKNOWN: 'UNKNOWN'
  },

  // Monitoring
  // SENTRY_DSN Removed (Native Logging only)
  ADMIN_CHAT_ID: process.env.ADMIN_CHAT_ID,

  // Instagram Cookie File Path (Optional)
  // Export cookies from browser using a Netscape-format cookies.txt extension.
  // Required for downloading private or rate-limited Instagram content via yt-dlp.
  // Example: /app/cookies/instagram.txt
  INSTAGRAM_COOKIES_FILE: process.env.INSTAGRAM_COOKIES_FILE || null
};

// Validate critical config
if (!config.BOT_TOKEN && config.NODE_ENV !== 'test') {
  console.warn('⚠️  WARNING: BOT_TOKEN is missing in .env file');
}

module.exports = config;
