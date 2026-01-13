// ============================================================================
// Hardware Source: src/index.js
// Version: 1.0.0
// Why: Main Entry Point. Starts Bot and Server.
// Env / Identity: Application root
// ============================================================================

const { setupBot } = require('./bot');
const { createServer } = require('./server');
const config = require('./config/env');

const start = async () => {
    try {
        // 1. Initialize Bot
        const bot = setupBot();

        // 2. Initialize Server
        const app = createServer(bot);

        // 3. Determine Mode (Polling vs Webhook)
        if (config.NODE_ENV === 'production') {
            // --- Production: Webhooks ---
            console.log('[Bot] Starting in PRODUCTION (Webhook) mode...');

            if (!config.APP_URL) {
                throw new Error('APP_URL is required for Production Webhooks!');
            }

            // Set the webhook with Telegram
            const webhookUrl = `${config.APP_URL}/webhook`;
            await bot.telegram.setWebhook(webhookUrl);
            console.log(`[Bot] Webhook set to: ${webhookUrl}`);

            // Attach webhook handler to Express
            // This grabs updates from POST /webhook
            app.use(bot.webhookCallback('/webhook'));

        } else {
            // --- Development: Polling ---
            console.log('[Bot] Starting in DEVELOPMENT (Polling) mode...');

            // Clear any previous webhooks so polling works
            await bot.telegram.deleteWebhook();

            bot.launch(() => {
                console.log('[Bot] Polling started');
            });
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
