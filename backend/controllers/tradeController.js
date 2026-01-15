/**
 * Trade Controller
 * Handles buy/sell/portfolio operations with atomic transactions
 */
const mongoose = require('mongoose');
const Trade = require('../tradeschema');
const Wallet = require('../MoneySchema');

/**
 * Get wallet balance
 */
const getBalance = async (req, res) => {
    let wallet = await Wallet.findOne();

    if (!wallet) {
        wallet = new Wallet({ Money: 250000 });
        await wallet.save();
    }

    res.json({ Money: wallet.Money });
};

/**
 * Get all portfolio holdings
 */
const getPortfolio = async (req, res) => {
    const trades = await Trade.find();
    res.json(trades);
};

/**
 * Get specific stock holding
 */
const getStockHolding = async (req, res) => {
    const { stockName } = req.body;
    const trades = await Trade.find({ stockName });
    res.json(trades);
};

/**
 * Buy stock - ATOMIC TRANSACTION
 * Uses MongoDB transactions to ensure consistency
 */
const buyStock = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { quantity, price, stockName } = req.validatedData;
        const totalCost = quantity * price;

        // Get or create wallet
        let wallet = await Wallet.findOne().session(session);
        if (!wallet) {
            wallet = new Wallet({ Money: 250000 });
        }

        // Check sufficient funds
        if (wallet.Money < totalCost) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Deduct from wallet
        wallet.Money -= totalCost;
        await wallet.save({ session });

        // Find or create trade record
        let trade = await Trade.findOne({ stockName }).session(session);

        if (trade) {
            // Update existing position
            const newTotal = trade.Total + totalCost;
            const newQuantity = trade.quantity + quantity;

            trade.quantity = newQuantity;
            trade.Total = newTotal;
            trade.Average = newTotal / newQuantity;
            trade.MarketV = newQuantity * price;
            trade.price = price;
        } else {
            // Create new position
            trade = new Trade({
                quantity,
                price,
                stockName,
                Total: totalCost,
                Average: price,
                MarketV: totalCost
            });
        }

        await trade.save({ session });
        await session.commitTransaction();

        console.log(`BUY: ${quantity} shares of ${stockName} at $${price}`);
        res.json(trade);

    } catch (error) {
        await session.abortTransaction();
        console.error('Buy transaction failed:', error);
        res.status(500).json({ error: 'Transaction failed' });
    } finally {
        session.endSession();
    }
};

/**
 * Sell stock - ATOMIC TRANSACTION
 */
const sellStock = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { quantity, price, stockName } = req.validatedData;
        const totalValue = quantity * price;

        // Find existing position
        const trade = await Trade.findOne({ stockName }).session(session);

        if (!trade) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Stock not found in portfolio' });
        }

        if (trade.quantity < quantity) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Insufficient shares' });
        }

        // Add to wallet
        let wallet = await Wallet.findOne().session(session);
        if (!wallet) {
            wallet = new Wallet({ Money: 0 });
        }
        wallet.Money += totalValue;
        await wallet.save({ session });

        // Update or delete trade record
        trade.quantity -= quantity;
        trade.Total = trade.quantity * trade.Average;
        trade.MarketV = trade.quantity * price;

        if (trade.quantity === 0) {
            await Trade.deleteOne({ _id: trade._id }).session(session);
        } else {
            await trade.save({ session });
        }

        await session.commitTransaction();

        console.log(`SELL: ${quantity} shares of ${stockName} at $${price}`);
        res.json({ success: true, quantity, price, stockName });

    } catch (error) {
        await session.abortTransaction();
        console.error('Sell transaction failed:', error);
        res.status(500).json({ error: 'Transaction failed' });
    } finally {
        session.endSession();
    }
};

module.exports = {
    getBalance,
    getPortfolio,
    getStockHolding,
    buyStock,
    sellStock
};
