const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const otpController = require('../controllers/otpController');
const { otpRateLimiter } = require('../middleware/rateLimiter');

// Validation Middleware
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
};

/**
 * @route   POST /api/otp/send
 * @desc    Generate and Send OTP
 */
router.post(
    '/send',
    otpRateLimiter,
    [
        body('identifier').notEmpty().withMessage('Identifier (Email/Phone) is required').trim(),
    ],
    validate,
    otpController.sendOTP
);

/**
 * @route   POST /api/otp/verify
 * @desc    Verify OTP
 */
router.post(
    '/verify',
    [
        body('identifier').notEmpty().withMessage('Identifier is required').trim(),
        body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
    ],
    validate,
    otpController.verifyOTP
);

module.exports = router;
