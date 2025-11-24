import { v4 as uuid } from 'uuid';
import { Document } from 'mongodb';
import { getCollection } from '../database/connection';
import { Order, OrderStatus, OrderType, OrderSide } from '../types/order';

interface OrderDocument extends Document {
  _id: string;
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number;
  stopPrice?: number;
  filledQuantity: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
}

const ordersCollection = () => getCollection<OrderDocument>('orders');

export class OrderModel {
  static async create(
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'filledQuantity' | 'status'>
  ): Promise<Order> {
    const now = new Date();
    const order: Order = {
      id: uuid(),
      userId: orderData.userId,
      symbol: orderData.symbol,
      side: orderData.side,
      type: orderData.type,
      quantity: orderData.quantity,
      price: orderData.price,
      stopPrice: orderData.stopPrice,
      filledQuantity: 0,
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
      timeInForce: orderData.timeInForce,
    };

    await ordersCollection().insertOne({ ...order, _id: order.id });
    return order;
  }

  static async findById(id: string): Promise<Order | null> {
    const doc = await ordersCollection().findOne({ _id: id });
    return doc ? this.mapDocumentToOrder(doc) : null;
  }

  static async findByUserId(userId: string): Promise<Order[]> {
    const docs = await ordersCollection()
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((doc) => this.mapDocumentToOrder(doc));
  }

  static async findBySymbol(symbol: string): Promise<Order[]> {
    const docs = await ordersCollection()
      .find({
        symbol,
        status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] },
      })
      .toArray();

    return docs
      .map((doc) => this.mapDocumentToOrder(doc))
      .sort(this.priceTimeComparator);
  }

  static async updateStatus(
    id: string,
    status: OrderStatus,
    filledQuantity?: number
  ): Promise<Order | null> {
    const updates: Partial<OrderDocument> = {
      status,
      updatedAt: new Date(),
    };

    if (filledQuantity !== undefined) {
      updates.filledQuantity = filledQuantity;
    }

    const result = await ordersCollection().findOneAndUpdate(
      { _id: id },
      { $set: updates },
      { returnDocument: 'after', includeResultMetadata: true }
    );

    return result.value ? this.mapDocumentToOrder(result.value) : null;
  }

  static async cancelOrder(id: string): Promise<Order | null> {
    return this.updateStatus(id, OrderStatus.CANCELLED);
  }

  static async getPendingOrders(symbol?: string): Promise<Order[]> {
    const query: Record<string, any> = {
      status: { $in: [OrderStatus.PENDING, OrderStatus.PARTIALLY_FILLED] },
    };

    if (symbol) {
      query.symbol = symbol;
    }

    const docs = await ordersCollection()
      .find(query)
      .sort({ createdAt: 1 })
      .toArray();

    return docs.map((doc) => this.mapDocumentToOrder(doc));
  }

  private static mapDocumentToOrder(doc: OrderDocument): Order {
    return {
      id: doc.id,
      userId: doc.userId,
      symbol: doc.symbol,
      side: doc.side,
      type: doc.type,
      quantity: doc.quantity,
      price: doc.price,
      stopPrice: doc.stopPrice,
      filledQuantity: doc.filledQuantity,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      timeInForce: doc.timeInForce,
    };
  }

  private static priceTimeComparator(a: Order, b: Order): number {
    if (a.side === OrderSide.BUY && b.side === OrderSide.SELL) return -1;
    if (a.side === OrderSide.SELL && b.side === OrderSide.BUY) return 1;

    const aCreated = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
    const bCreated = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();

    if (a.side === OrderSide.BUY && b.side === OrderSide.BUY) {
      const priceDiff = (b.price || 0) - (a.price || 0);
      if (priceDiff !== 0) return priceDiff;
      return aCreated - bCreated;
    }

    if (a.side === OrderSide.SELL && b.side === OrderSide.SELL) {
      const priceDiff = (a.price || 0) - (b.price || 0);
      if (priceDiff !== 0) return priceDiff;
      return aCreated - bCreated;
    }

    return aCreated - bCreated;
  }
}

