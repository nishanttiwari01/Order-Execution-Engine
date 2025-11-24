import { Collection, Db, Document, MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();

const DEFAULT_URI = (process.env.DB_HOST || process.env.DB_PORT)
  ? `mongodb://${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '27017'}`
  : 'mongodb://localhost:27017';

const mongoUri = process.env.MONGODB_URI || DEFAULT_URI;
const dbName = process.env.DB_NAME || 'order_engine';

let client: MongoClient | null = null;
let database: Db | null = null;

const ensureIndexes = async (db: Db) => {
  const orders = db.collection('orders');
  await orders.createIndex({ id: 1 }, { unique: true, name: 'orders_id_unique' });
  await orders.createIndex({ symbol: 1, side: 1, status: 1 }, { name: 'orders_symbol_side_status_idx' });
  await orders.createIndex({ userId: 1, createdAt: -1 }, { name: 'orders_user_created_idx' });

  const trades = db.collection('trades');
  await trades.createIndex({ id: 1 }, { unique: true, name: 'trades_id_unique' });
  await trades.createIndex({ symbol: 1, timestamp: -1 }, { name: 'trades_symbol_time_idx' });
  await trades.createIndex({ buyOrderId: 1 }, { name: 'trades_buy_order_idx' });
  await trades.createIndex({ sellOrderId: 1 }, { name: 'trades_sell_order_idx' });
};

export const connectToDatabase = async (): Promise<Db> => {
  if (database) {
    return database;
  }

  logger.info(`Connecting to MongoDB at ${mongoUri}...`);
  client = new MongoClient(mongoUri);
  await client.connect();
  database = client.db(dbName);
  logger.info(`Connected to MongoDB database "${dbName}"`);

  await ensureIndexes(database);
  logger.info('MongoDB indexes ensured');

  return database;
};

export const getDb = (): Db => {
  if (!database) {
    throw new Error('Database not initialized. Call connectToDatabase() first.');
  }
  return database;
};

export const getCollection = <T extends Document = Document>(name: string): Collection<T> => {
  return getDb().collection<T>(name);
};

export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    database = null;
    logger.info('MongoDB connection closed');
  }
};

