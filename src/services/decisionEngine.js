// ============================================================================
// Hardware Source: src/services/decisionEngine.js
// Version: 1.0.0
// Why: Central business logic to process user input and direct flow
// Env / Identity: Service layer
// ============================================================================

const { isValidUrl, detectPlatform } = require('../utils/validator');
const { PLATFORMS } = require('../config/env');
const mediaProvider = require('./mediaProvider');

/**
 * Result types for the decision engine
 */
const RESULT_TYPES = {
    SUCCESS: 'SUCCESS',
    INVALID_URL: 'INVALID_URL',
    UNSUPPORTED_PLATFORM: 'UNSUPPORTED_PLATFORM',
    ERROR: 'ERROR'
};

/**
 * Outcome object structure
 * {
 *   status: RESULT_TYPES,
 *   data: Object | null,
 *   message: string | null
 * }
 */

/**
 * Main processor Function.
 * 
 * @param {string} text - User message content
 * @returns {Promise<Object>} - Outcome object
 */
const processRequest = async (text) => {
    // 1. Validate URL
    if (!isValidUrl(text)) {
        return {
            status: RESULT_TYPES.INVALID_URL,
            message: 'The message does not contain a valid URL.'
        };
    }

    // 2. Detect Platform
    const platform = detectPlatform(text);

    // 3. Reject Unsupported
    if (platform === PLATFORMS.UNKNOWN) {
        return {
            status: RESULT_TYPES.UNSUPPORTED_PLATFORM,
            message: 'This platform is not supported. Please send an Instagram or X (Twitter) link.'
        };
    }

    // 4. Fetch Media (Mocked)
    try {
        const media = await mediaProvider.getMedia(text, platform);
        return {
            status: RESULT_TYPES.SUCCESS,
            data: media
        };
    } catch (error) {
        console.error('[DecisionEngine] Error processing request:', error);
        return {
            status: RESULT_TYPES.ERROR,
            message: error.message || 'An internal error occurred while processing your request.',
            data: error.message // Pass error to data so handlers.js can display it
        };
    }
};

module.exports = {
    processRequest,
    RESULT_TYPES
};
