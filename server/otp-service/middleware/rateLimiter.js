const rateLimit = require('express-rate-limit');

const otpRateLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: {
        success: false,
        message: 'Too many OTP requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { otpRateLimiter };
