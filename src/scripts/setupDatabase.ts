/**
 * MongoDB Setup Script
 * Ensures the required collections and indexes exist.
 * Run with: npm run setup:db
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { closeDatabase, connectToDatabase } from '../database/connection';

const envPath = path.join(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  console.error('\n❌ ERROR: .env file not found!');
  console.error('\nPlease create a .env file with your MongoDB connection details.');
  console.error('You can copy from env.example (if available) or create one manually.\n');
  process.exit(1);
}

dotenv.config();

const dbName = process.env.DB_NAME || 'order_engine';

async function setupDatabase() {
  try {
    logger.info('Starting MongoDB setup...');
    const db = await connectToDatabase();
    logger.info(`Database "${db.databaseName}" is ready`);

    const ordersIndexes = await db.collection('orders').indexes();
    const tradesIndexes = await db.collection('trades').indexes();

    logger.info('Current orders indexes:');
    ordersIndexes.forEach((index) => logger.info(`  - ${index.name}`));

    logger.info('Current trades indexes:');
    tradesIndexes.forEach((index) => logger.info(`  - ${index.name}`));

    logger.info('✅ MongoDB setup completed successfully!');
    logger.info(`You can now start the application with: npm start (DB: ${dbName})`);
  } catch (error: any) {
    logger.error('❌ MongoDB setup failed:', error);
    if (error.message?.includes('ECONNREFUSED')) {
      logger.error('Unable to reach MongoDB. Make sure the server is running and MONGODB_URI/.env values are correct.');
    }
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

setupDatabase().catch((error) => {
  logger.error('Unhandled error during setup:', error);
  process.exit(1);
});

