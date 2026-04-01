// ============================================================================
// Hardware Source: src/services/logger.js
// Version: 2.0.0
// Why: Native Monitoring System (Zero-Dependency)
// Env / Identity: Singleton Service
// ============================================================================

const config = require('../config/env');

// In-Memory Stats Counter
const stats = {
    totalRequests: 0,
    successfulDownloads: 0,
    failedDownloads: 0,
    platformInstagram: 0,
    platformTwitter: 0,
    startTime: new Date()
};

// Reference to Telegram Bot
let telegramBot = null;

const init = (botInstance) => {
    telegramBot = botInstance;
    console.log('[Logger] Native Monitoring Initialized 🛡️');
};

// ----------------------------------------------------------------------------
// Stats Tracking Methods
// ----------------------------------------------------------------------------

const trackRequest = (platform) => {
    stats.totalRequests++;
    if (platform === 'INSTAGRAM') stats.platformInstagram++;
    if (platform === 'TWITTER') stats.platformTwitter++;
};

const trackSuccess = () => {
    stats.successfulDownloads++;
};

/**
 * Tracks an error and sends alerts if critical keywords are found
 * @param {Error} error 
 * @param {string} context 
 * @param {string} url 
 */
const trackError = async (error, context, url = 'N/A') => {
    stats.failedDownloads++;

    // Always log to Standard Output (Cloud Logging)
    console.error(`[ERROR] [${context}]`, error);

    // Critical Keywords Check
    const message = error.message || '';
    const criticalKeywords = ['Login required', '429', 'blocked', 'ETIMEDOUT', 'ECONNREFUSED'];

    const isCritical = criticalKeywords.some(keyword => message.includes(keyword));

    if (isCritical) {
        await notifyAdmin(context, error, url);
    }
};

/**
 * Sends a formatted critical alert to the Admin
 */
const notifyAdmin = async (context, error, url) => {
    if (!telegramBot || !config.ADMIN_CHAT_ID) return;

    const alertMsg = `
🚨 *CRITICAL ERROR*
**Context:** ${context}
**URL:** \`${url}\`
**Error:** \`${error.message}\`
    `;

    try {
        await telegramBot.telegram.sendMessage(config.ADMIN_CHAT_ID, alertMsg, { parse_mode: 'Markdown' });
    } catch (err) {
        console.error('[Logger] Failed to send alert:', err.message);
    }
};

// ----------------------------------------------------------------------------
// Reporting Helper
// ----------------------------------------------------------------------------

/**
 * Returns the daily report string and optionally resets counters
 * @param {boolean} shouldReset - Whether to reset counters after generating report
 * @returns {string} The report text
 */
const getStats = (shouldReset = true) => {
    const uptimeHours = Math.floor((new Date() - stats.startTime) / (1000 * 60 * 60));

    const report = `
📊 **Statistics Report** ${shouldReset ? '(Daily)' : '(Manual Peek)'}
_(Uptime: ${uptimeHours}h)_

🔹 **Total:** ${stats.totalRequests}
✅ **Success:** ${stats.successfulDownloads}
❌ **Failed:** ${stats.failedDownloads}
📸 **IG:** ${stats.platformInstagram} | 🐦 **X:** ${stats.platformTwitter}
    `;

    if (shouldReset) {
        // Reset counters (but keep startTime)
        stats.totalRequests = 0;
        stats.successfulDownloads = 0;
        stats.failedDownloads = 0;
        stats.platformInstagram = 0;
        stats.platformTwitter = 0;
    }

    return report;
};

module.exports = {
    init,
    trackRequest,
    trackSuccess,
    trackError,
    getStats,
    getAndResetStats: () => getStats(true)
};
