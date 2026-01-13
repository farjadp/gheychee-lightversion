// ============================================================================
// Hardware Source: src/bot/handlers.js
// Version: 1.0.0
// Why: Define Telegraf command and message handlers
// Env / Identity: Bot controller layer
// ============================================================================

const decisionEngine = require('../services/decisionEngine');
const { RESULT_TYPES } = require('../services/decisionEngine');

/**
 * Handle /start command
 * @param {import('telegraf').Context} ctx 
 */
const handleStart = async (ctx) => {
    const welcomeMessage = `
👋 *Welcome to the Educational Video Bot!*

I can demonstrate how to process links from:
• Instagram
• X (Twitter)

*How to use:*
Simply send me a link, and I'll process it for you.

_Note: This is a Phase 1 Demo. No real content is downloaded._
  `;
    await ctx.replyWithMarkdown(welcomeMessage);
};

/**
 * Handle text messages
 * @param {import('telegraf').Context} ctx 
 */
const handleMessage = async (ctx) => {
    const text = ctx.message.text;

    // Process the request through the decision engine
    const result = await decisionEngine.processRequest(text);

    switch (result.status) {
        case RESULT_TYPES.SUCCESS:
            // In a real app, you might want to send a placeholder while uploading
            if (result.data.type === 'video') {
                await ctx.replyWithVideo(result.data.url, {
                    caption: result.data.description,
                    parse_mode: 'Markdown'
                });
            } else {
                await ctx.replyWithPhoto(result.data.url, {
                    caption: result.data.description,
                    parse_mode: 'Markdown'
                });
            }
            break;

        case RESULT_TYPES.INVALID_URL:
            // Optional: Only reply if it looks like they tried to send a link
            if (text.startsWith('http')) {
                await ctx.reply('❌ That doesn\'t look like a valid URL.');
            }
            // Else: ignore random chatter
            break;

        case RESULT_TYPES.UNSUPPORTED_PLATFORM:
            await ctx.reply(`⚠️ ${result.message}`);
            break;

        case RESULT_TYPES.ERROR:
            await ctx.reply(`🚫 Error: ${result.data}`);
            break;

        default:
            await ctx.reply('❓ Unknown result.');
    }
};

module.exports = {
    handleStart,
    handleMessage
};
