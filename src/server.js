// ============================================================================
// Hardware Source: src/server.js
// Version: 1.0.0
// Why: Express server to expose health check and potential webhooks
// Env / Identity: Web server layer
// ============================================================================

const express = require('express');
const config = require('./config/env');

/**
 * Creates and configures the Express app
 * @param {import('telegraf').Telegraf} bot 
 */
const createServer = (bot) => {
    const app = express();

    app.use(express.json());

    // Health check route
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'ok', uptime: process.uptime() });
    });

    // Basic root route
    app.get('/', (req, res) => {
        res.send('Telegram Bot Decision Engine is Running.');
    });

    // Cloud Scheduler Endpoint (Daily Report)
    app.post('/cron/daily-report', async (req, res) => {
        const logger = require('./services/logger');
        const report = logger.getAndResetStats();

        if (config.ADMIN_CHAT_ID) {
            try {
                await bot.telegram.sendMessage(config.ADMIN_CHAT_ID, report, { parse_mode: 'Markdown' });
                console.log('[Cron] Daily report sent via Webhook');
                res.status(200).send('Report Sent');
            } catch (e) {
                console.error('[Cron] Failed to send report:', e.message);
                res.status(500).send('Failed to send report');
            }
        } else {
            res.status(200).send('No Admin Chat ID configured');
        }
    });

    // In Phase 2, we would add the webhook route here:
    // app.use(bot.webhookCallback('/secret-path'));

    return app;
};

module.exports = {
    createServer
};
