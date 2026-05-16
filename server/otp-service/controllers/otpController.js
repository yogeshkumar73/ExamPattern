const bcrypt = require('bcrypt');
const redis = require('../config/redis');
const { generateOTP } = require('../utils/otpGenerator');

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS) || 120;
const RETRY_LIMIT = parseInt(process.env.OTP_RETRY_LIMIT) || 3;

/**
 * Send OTP Controller
 */
exports.sendOTP = async (req, res) => {
    try {
        const { identifier } = req.body; // Can be email or phone

        // 1. Generate Secure OTP
        const otp = generateOTP();

        // 2. Hash the OTP
        const salt = await bcrypt.genSalt(10);
        const hashedOTP = await bcrypt.hash(otp, salt);

        // 3. Store in Redis with Expiry (TTL)
        // Key: otp:{identifier}, Value: {hashedOTP, retries: 0}
        const redisKey = `otp:${identifier}`;
        await redis.set(redisKey, JSON.stringify({ hashedOTP, retries: 0 }), 'EX', OTP_EXPIRY);

        // 4. In production, send this via SMS/Email
        // For development, we return it in response (REMOVE THIS IN PRODUCTION)
        console.log(`[DEBUG] OTP for ${identifier}: ${otp}`);

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully. Valid for 2 minutes.',
            // otp: otp // DO NOT return OTP in production
        });
    } catch (error) {
        console.error('Send OTP Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

/**
 * Verify OTP Controller
 */
exports.verifyOTP = async (req, res) => {
    try {
        const { identifier, otp } = req.body;
        const redisKey = `otp:${identifier}`;

        // 1. Fetch OTP data from Redis
        const storedData = await redis.get(redisKey);
        if (!storedData) {
            return res.status(400).json({ success: false, message: 'OTP expired or not found' });
        }

        const { hashedOTP, retries } = JSON.parse(storedData);

        // 2. Brute-force protection: Check retry limit
        if (retries >= RETRY_LIMIT) {
            await redis.del(redisKey); // Clear on excessive retries
            return res.status(429).json({ success: false, message: 'Too many failed attempts. Request a new OTP.' });
        }

        // 3. Compare hashed OTP
        const isMatch = await bcrypt.compare(otp, hashedOTP);

        if (!isMatch) {
            // Increment retry count
            await redis.set(redisKey, JSON.stringify({ hashedOTP, retries: retries + 1 }), 'KEEPTTL');
            return res.status(401).json({ success: false, message: 'Invalid OTP' });
        }

        // 4. Success: Clear OTP from Redis
        await redis.del(redisKey);

        return res.status(200).json({
            success: true,
            message: 'OTP verified successfully!'
        });
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
