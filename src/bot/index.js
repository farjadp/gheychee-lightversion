// ============================================================================
// Hardware Source: src/bot/index.js
// Version: 1.0.0
// Why: Initialize Telegraf instance and register middleware/handlers
// Env / Identity: Bot setup
// ============================================================================

const { Telegraf } = require('telegraf');
const config = require('../config/env');
const handlers = require('./handlers');
const userStore = require('../services/userStore');

/**
 * Sets up and returns the bot instance
 * @returns {Telegraf}
 */
const setupBot = () => {
    if (!config.BOT_TOKEN) {
        throw new Error('BOT_TOKEN is not defined!');
    }

    const bot = new Telegraf(config.BOT_TOKEN);

    // Middleware 1: Logging (Performance)
    bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`[Bot] Response time: ${ms}ms`);
    });

    // Middleware 2: User Persistence (Firestore)
    bot.use(async (ctx, next) => {
        // Fire and forget - don't block the bot response
        userStore.saveUser(ctx).catch(err => console.error('[Middleware] User Save Failed:', err.message));
        await next();
    });

    // Register Handlers
    bot.start(handlers.handleStart);
    bot.command('broadcast', handlers.handleBroadcast);
    bot.command('stats', handlers.handleStats);
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
