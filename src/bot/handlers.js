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
👋 *Welcome to Gheychee Lite*

⚠️ *Disclaimer*
This bot is an internal and educational tool.
It may only be used with content that:
• You own, or
• You have explicit permission to use, or
• Is legally reusable under a valid license.

Ashavid makes no claim that your use of this tool is lawful and assumes no responsibility for violations of copyright, platform terms (Instagram, X, Telegram), or third-party rights.

The tool is experimental and may produce errors, incomplete output, or unexpected results.
You are responsible for verifying and using the output appropriately.

*How to use:*
Simply send me an Instagram or X (Twitter) link.

[Terms of Use](https://github.com/farjadp/gheychee-lightversion/blob/main/TERMS_OF_USE.md) | [Privacy Policy](https://github.com/farjadp/gheychee-lightversion/blob/main/PRIVACY_POLICY.md)
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
