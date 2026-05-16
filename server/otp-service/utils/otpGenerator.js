const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP
 * @returns {string} 6-digit numeric string
 */
const generateOTP = () => {
    return crypto.randomInt(100000, 999999).toString();
};

module.exports = { generateOTP };
