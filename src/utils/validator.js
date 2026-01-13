// ============================================================================
// Hardware Source: src/utils/validator.js
// Version: 1.0.0
// Why: Handle URL validation and platform detection logic
// Env / Identity: Pure utility functions
// ============================================================================

const { PLATFORMS } = require('../config/env');

/**
 * Validates if the string is a properly formatted URL.
 * @param {string} text 
 * @returns {boolean}
 */
const isValidUrl = (text) => {
    try {
        const url = new URL(text);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        return false;
    }
};

/**
 * Detects the platform from the URL hostname.
 * @param {string} urlString 
 * @returns {string} One of PLATFORMS enum
 */
const detectPlatform = (urlString) => {
    try {
        const url = new URL(urlString);
        const hostname = url.hostname.toLowerCase();

        if (hostname.includes('instagram.com')) {
            return PLATFORMS.INSTAGRAM;
        }

        if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
            return PLATFORMS.TWITTER;
        }

        return PLATFORMS.UNKNOWN;
    } catch (error) {
        return PLATFORMS.UNKNOWN;
    }
};

module.exports = {
    isValidUrl,
    detectPlatform
};
