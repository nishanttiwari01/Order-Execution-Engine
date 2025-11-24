import { v4 as uuid } from 'uuid';
import { Document } from 'mongodb';
import { getCollection } from '../database/connection';
import { Trade } from '../types/order';

interface TradeDocument extends Document {
  _id: string;
  id: string;
  buyOrderId: string;
  sellOrderId: string;
  symbol: string;
  quantity: number;
  price: number;
  timestamp: Date;
}

const tradesCollection = () => getCollection<TradeDocument>('trades');

export class TradeModel {
  static async create(tradeData: Omit<Trade, 'id' | 'timestamp'>): Promise<Trade> {
    const trade: Trade = {
      id: uuid(),
      buyOrderId: tradeData.buyOrderId,
      sellOrderId: tradeData.sellOrderId,
      symbol: tradeData.symbol,
      quantity: tradeData.quantity,
      price: tradeData.price,
      timestamp: new Date(),
    };

    await tradesCollection().insertOne({ ...trade, _id: trade.id });
    return trade;
  }

  static async findBySymbol(symbol: string, limit: number = 100): Promise<Trade[]> {
    const docs = await tradesCollection()
      .find({ symbol })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => this.mapDocumentToTrade(doc));
  }

  static async findByOrderId(orderId: string): Promise<Trade[]> {
    const docs = await tradesCollection()
      .find({
        $or: [{ buyOrderId: orderId }, { sellOrderId: orderId }],
      })
      .sort({ timestamp: -1 })
      .toArray();

    return docs.map((doc) => this.mapDocumentToTrade(doc));
  }

  static async getRecentTrades(limit: number = 100): Promise<Trade[]> {
    const docs = await tradesCollection()
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return docs.map((doc) => this.mapDocumentToTrade(doc));
  }

  private static mapDocumentToTrade(doc: TradeDocument): Trade {
    return {
      id: doc.id,
      buyOrderId: doc.buyOrderId,
      sellOrderId: doc.sellOrderId,
      symbol: doc.symbol,
      quantity: doc.quantity,
      price: doc.price,
      timestamp: doc.timestamp,
    };
  }
}

