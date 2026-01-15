/**
 * Database Configuration
 * Centralized database connection setup
 */
const mongoose = require('mongoose');

const connectDB = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
        console.error('FATAL ERROR: MONGO_URI is not defined');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        console.info('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
