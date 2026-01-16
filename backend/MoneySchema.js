const mongoose = require('mongoose');

/**
 * Wallet Schema
 * Tracks user's cash balance with transaction history
 */
const walletSchema = new mongoose.Schema({
  balance: {
    type: Number,
    default: 25000  // Starting balance
  },
  initialBalance: {
    type: Number,
    default: 25000
  },
  totalDeposited: {
    type: Number,
    default: 25000
  },
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  // For backward compatibility
  Money: {
    type: Number,
    default: 25000
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Sync Money field with balance
walletSchema.pre('save', function (next) {
  this.Money = this.balance;
  this.updatedAt = new Date();
  next();
});

const Wallet = mongoose.model('Wallet', walletSchema);
module.exports = Wallet;