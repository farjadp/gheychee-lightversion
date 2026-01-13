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

        // 3. Launch Bot (Polling mode for Phase 1)
        // For production/Phase 2, you might switch to Webhooks
        bot.launch(() => {
            console.log('[Bot] Polling started');
        });

        // 4. Start Server
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
