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

    // In Phase 2, we would add the webhook route here:
    // app.use(bot.webhookCallback('/secret-path'));

    return app;
};

module.exports = {
    createServer
};
