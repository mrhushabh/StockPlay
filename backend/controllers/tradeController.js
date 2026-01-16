/**
 * Trade Controller
 * Handles buy/sell/portfolio operations with P/L calculation
 */
const mongoose = require('mongoose');
const Trade = require('../tradeschema');
const Wallet = require('../MoneySchema');

const INITIAL_BALANCE = 25000;

/**
 * Get wallet balance
 */
const getBalance = async (req, res) => {
    let wallet = await Wallet.findOne();

    if (!wallet) {
        wallet = new Wallet({ balance: INITIAL_BALANCE, Money: INITIAL_BALANCE });
        await wallet.save();
    }

    res.json({
        Money: wallet.balance,
        balance: wallet.balance,
        initialBalance: wallet.initialBalance || INITIAL_BALANCE
    });
};

/**
 * Get all portfolio holdings with P/L
 */
const getPortfolio = async (req, res) => {
    const trades = await Trade.find({ quantity: { $gt: 0 } });

    // Calculate totals
    let totalInvested = 0;
    let totalMarketValue = 0;
    let totalUnrealizedPL = 0;
    let totalRealizedPL = 0;

    const holdings = trades.map(trade => {
        totalInvested += trade.totalCost || 0;
        totalMarketValue += trade.marketValue || 0;
        totalUnrealizedPL += trade.unrealizedPL || 0;
        totalRealizedPL += trade.realizedPL || 0;

        return {
            stockName: trade.stockName,
            symbol: trade.symbol,
            quantity: trade.quantity,
            averageCost: trade.averageCost,
            totalCost: trade.totalCost,
            currentPrice: trade.currentPrice,
            marketValue: trade.marketValue,
            unrealizedPL: trade.unrealizedPL,
            unrealizedPLPercent: trade.unrealizedPLPercent,
            realizedPL: trade.realizedPL,
            // Legacy fields for backward compatibility
            Average: trade.averageCost,
            Total: trade.totalCost,
            price: trade.currentPrice,
            MarketV: trade.marketValue,
            change: trade.unrealizedPL
        };
    });

    res.json({
        holdings,
        summary: {
            totalInvested,
            totalMarketValue,
            totalUnrealizedPL,
            totalUnrealizedPLPercent: totalInvested > 0 ? (totalUnrealizedPL / totalInvested) * 100 : 0,
            totalRealizedPL
        },
        // Legacy format for backward compatibility
        ...holdings
    });
};

/**
 * Get specific stock holding
 */
const getStockHolding = async (req, res) => {
    const stockName = req.body?.stockName || req.params?.stockName;
    const trades = await Trade.find({ stockName });
    res.json(trades);
};

/**
 * Buy stock - ATOMIC TRANSACTION with P/L tracking
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
            wallet = new Wallet({ balance: INITIAL_BALANCE, Money: INITIAL_BALANCE });
        }

        // Check sufficient funds
        if (wallet.balance < totalCost) {
            await session.abortTransaction();
            return res.status(400).json({ error: 'Insufficient funds' });
        }

        // Deduct from wallet
        wallet.balance -= totalCost;
        wallet.Money = wallet.balance;
        await wallet.save({ session });

        // Find or create trade record
        let trade = await Trade.findOne({ stockName }).session(session);

        if (trade) {
            // Update existing position - recalculate average cost
            const newTotalCost = trade.totalCost + totalCost;
            const newQuantity = trade.quantity + quantity;

            trade.quantity = newQuantity;
            trade.totalCost = newTotalCost;
            trade.averageCost = newTotalCost / newQuantity;
            trade.currentPrice = price;
        } else {
            // Create new position
            trade = new Trade({
                stockName,
                quantity,
                totalCost,
                averageCost: price,
                currentPrice: price
            });
        }

        await trade.save({ session });
        await session.commitTransaction();

        console.log(`BUY: ${quantity} shares of ${stockName} at $${price}`);
        res.json({
            ...trade.toObject(),
            // Legacy fields
            Average: trade.averageCost,
            Total: trade.totalCost,
            price: trade.currentPrice,
            MarketV: trade.marketValue
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Buy transaction failed:', error);
        res.status(500).json({ error: 'Transaction failed' });
    } finally {
        session.endSession();
    }
};

/**
 * Sell stock - ATOMIC TRANSACTION with realized P/L
 */
const sellStock = async (req, res) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const { quantity, price, stockName } = req.validatedData;
        const saleValue = quantity * price;

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

        // Calculate realized P/L for this sale
        const costBasisForSale = quantity * trade.averageCost;
        const realizedPLForSale = saleValue - costBasisForSale;

        // Add to wallet
        let wallet = await Wallet.findOne().session(session);
        if (!wallet) {
            wallet = new Wallet({ balance: 0, Money: 0 });
        }
        wallet.balance += saleValue;
        wallet.Money = wallet.balance;
        await wallet.save({ session });

        // Update trade record
        trade.quantity -= quantity;
        trade.totalCost -= costBasisForSale;
        trade.currentPrice = price;
        trade.realizedPL = (trade.realizedPL || 0) + realizedPLForSale;

        if (trade.quantity === 0) {
            // Keep record for realized P/L history, but mark as closed
            trade.totalCost = 0;
            trade.averageCost = 0;
        }

        await trade.save({ session });
        await session.commitTransaction();

        console.log(`SELL: ${quantity} shares of ${stockName} at $${price} (P/L: $${realizedPLForSale.toFixed(2)})`);
        res.json({
            success: true,
            quantity,
            price,
            stockName,
            realizedPL: realizedPLForSale
        });

    } catch (error) {
        await session.abortTransaction();
        console.error('Sell transaction failed:', error);
        res.status(500).json({ error: 'Transaction failed' });
    } finally {
        session.endSession();
    }
};

/**
 * Reset portfolio and wallet - FOR TESTING
 */
const resetPortfolio = async (req, res) => {
    try {
        // Delete all trades
        await Trade.deleteMany({});

        // Reset wallet
        await Wallet.deleteMany({});
        const wallet = new Wallet({
            balance: INITIAL_BALANCE,
            Money: INITIAL_BALANCE,
            initialBalance: INITIAL_BALANCE
        });
        await wallet.save();

        console.log('Portfolio and wallet reset');
        res.json({
            success: true,
            message: 'Portfolio reset successfully',
            balance: INITIAL_BALANCE
        });
    } catch (error) {
        console.error('Reset failed:', error);
        res.status(500).json({ error: 'Reset failed' });
    }
};

module.exports = {
    getBalance,
    getPortfolio,
    getStockHolding,
    buyStock,
    sellStock,
    resetPortfolio
};
