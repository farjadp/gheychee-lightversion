// ============================================================================
// Hardware Source: src/config/env.js
// Version: 1.0.0
// Why: Centralize environment variables and configuration constants
// Env / Identity: uses process.env
// ============================================================================

require('dotenv').config();

const config = {
  // Bot Token from Telegram Father
  BOT_TOKEN: process.env.BOT_TOKEN,
  
  // Port for the Express server (Webhook/Health checks)
  PORT: process.env.PORT || 3000,
  
  // App URL for Webhook setting (Phase 2 mostly)
  APP_URL: process.env.APP_URL,
  
  // Node Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Supported Platforms Enum
  PLATFORMS: {
    INSTAGRAM: 'INSTAGRAM',
    TWITTER: 'TWITTER', // X
    UNKNOWN: 'UNKNOWN'
  }
};

// Validate critical config
if (!config.BOT_TOKEN && config.NODE_ENV !== 'test') {
  console.warn('⚠️  WARNING: BOT_TOKEN is missing in .env file');
}

module.exports = config;
