const mongoose = require('mongoose');

/**
 * Trade Schema
 * Tracks stock holdings with full profit/loss calculation support
 */
const tradeSchema = new mongoose.Schema({
  // Stock identification
  stockName: { type: String, required: true, unique: true },
  symbol: { type: String },

  // Current holdings
  quantity: { type: Number, required: true, default: 0 },

  // Cost basis tracking for P/L calculation
  totalCost: { type: Number, default: 0 },        // Total amount spent (sum of all purchases)
  averageCost: { type: Number, default: 0 },      // Average cost per share

  // Current market data (updated on each transaction)
  currentPrice: { type: Number, default: 0 },     // Latest known price
  marketValue: { type: Number, default: 0 },      // quantity * currentPrice

  // Profit/Loss (calculated fields)
  unrealizedPL: { type: Number, default: 0 },     // marketValue - totalCost
  unrealizedPLPercent: { type: Number, default: 0 },

  // Realized P/L from sells
  realizedPL: { type: Number, default: 0 },       // Profit/loss from completed sales

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware to calculate P/L
tradeSchema.pre('save', function (next) {
  // Update market value
  this.marketValue = this.quantity * this.currentPrice;

  // Calculate unrealized P/L
  if (this.quantity > 0) {
    this.unrealizedPL = this.marketValue - this.totalCost;
    this.unrealizedPLPercent = this.totalCost > 0
      ? ((this.unrealizedPL / this.totalCost) * 100)
      : 0;
  } else {
    this.unrealizedPL = 0;
    this.unrealizedPLPercent = 0;
  }

  // Update timestamp
  this.updatedAt = new Date();

  next();
});

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
