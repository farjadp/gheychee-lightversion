// ============================================================================
// Hardware Source: src/bot/index.js
// Version: 1.0.0
// Why: Initialize Telegraf instance and register middleware/handlers
// Env / Identity: Bot setup
// ============================================================================

const { Telegraf } = require('telegraf');
const config = require('../config/env');
const handlers = require('./handlers');

/**
 * Sets up and returns the bot instance
 * @returns {Telegraf}
 */
const setupBot = () => {
    if (!config.BOT_TOKEN) {
        throw new Error('BOT_TOKEN is not defined!');
    }

    const bot = new Telegraf(config.BOT_TOKEN);

    // Middleware (Logging)
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`[Bot] Response time: ${ms}ms`);
    });

    // Register Handlers
    bot.start(handlers.handleStart);
    bot.on('text', handlers.handleMessage);

    // Error handling
    bot.catch((err, ctx) => {
        console.error(`[Bot] Error for ${ctx.updateType}`, err);
    });

    console.log('[Bot] Instance initialized...');
    return bot;
};

module.exports = {
    setupBot
};
