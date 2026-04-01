// ============================================================================
// Hardware Source: src/index.js
// Version: 1.1.0
// Why: Main Entry Point. Starts Bot and Server.
// Changelog: Auto-decode INSTAGRAM_COOKIES_BASE64 into /tmp at startup
// Env / Identity: Application root
// ============================================================================

const fs = require('fs');
const path = require('path');
const { setupBot } = require('./bot');
const { createServer } = require('./server');
const config = require('./config/env');
const logger = require('./services/logger');
const userStore = require('./services/userStore');

// ---------------------------------------------------------------------------
// Instagram Cookie Bootstrap
// If INSTAGRAM_COOKIES_BASE64 is set (Cloud Run / production),
// decode it and write to /tmp so yt-dlp can use it as a cookies file.
// ---------------------------------------------------------------------------
const bootstrapInstagramCookies = () => {
    const b64 = process.env.INSTAGRAM_COOKIES_BASE64;
    if (!b64) return;

    const tmpPath = '/tmp/instagram_cookies.txt';
    try {
        const decoded = Buffer.from(b64, 'base64').toString('utf-8');
        fs.writeFileSync(tmpPath, decoded, 'utf-8');
        process.env.INSTAGRAM_COOKIES_FILE = tmpPath;
        console.log('[Bootstrap] Instagram cookies written to', tmpPath);
    } catch (err) {
        console.error('[Bootstrap] Failed to write Instagram cookies:', err.message);
    }
};

bootstrapInstagramCookies();

const start = async () => {
    try {
        // 1. Initialize Bot
        const bot = setupBot();

        // 2. Initialize Monitoring Services
        logger.init(bot);
        userStore.init();

        // 3. Initialize Server
        const app = createServer(bot);

        // 3. Determine Mode (Polling vs Webhook)
        if (config.NODE_ENV === 'production') {
            // --- Production: Webhooks ---
            console.log('[Bot] Starting in PRODUCTION (Webhook) mode...');

            if (!config.APP_URL) {
                throw new Error('APP_URL is required for Production Webhooks!');
            }

            // Set the webhook with Telegram (Async - don't block server start)
            const webhookUrl = `${config.APP_URL}/webhook`;
            console.log(`[Bot] Setting webhook to: ${webhookUrl}`);

            // Promise-based - allows the server (app.listen) to start immediately
            bot.telegram.setWebhook(webhookUrl)
                .then(() => console.log(`[Bot] Webhook successfully set!`))
                .catch(err => console.error(`[Bot] Failed to set webhook:`, err));

            // Attach webhook handler to Express
            // This grabs updates from POST /webhook
            app.use(bot.webhookCallback('/webhook'));

        } else {
            // --- Development: Polling ---
            console.log('[Bot] Starting in DEVELOPMENT (Polling) mode...');

            // Async delete webhook
            bot.telegram.deleteWebhook()
                .then(() => {
                    bot.launch(() => console.log('[Bot] Polling started'));
                })
                .catch(console.error);
        }

        // 4. Start Server
        // In Cloud Run, we MUST listen on PORT (usually 8080 or 3000)
        app.listen(config.PORT, () => {
            console.log(`[Server] Listening on port ${config.PORT}`);
        });

        // Graceful Stop
        process.once('SIGINT', () => {
            bot.stop('SIGINT');
            process.exit(0);
        });
        process.once('SIGTERM', () => {
            bot.stop('SIGTERM');
            process.exit(0);
        });

    } catch (error) {
        console.error('Failed to start application:', error);
        process.exit(1);
    }
};

start();
