require('dotenv').config();
const express = require('express');
const otpRoutes = require('./routes/otpRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());

// Routes
app.use('/api/otp', otpRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'AURA_OTP_SERVICE_OK', timestamp: new Date() });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`
🚀 AURA OTP SERVICE RUNNING
---------------------------
Port:    ${PORT}
Mode:    Development
Redis:   ${process.env.REDIS_HOST || '127.0.0.1'}
    `);
});
