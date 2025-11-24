# Setup Guide

## Quick Start

### Option 1: Using Docker (Recommended)

1. **Start the services:**
```bash
docker-compose up -d
```

2. **Wait for MongoDB to be ready** (about 10 seconds)

3. **The application will automatically:**
   - Ensure MongoDB collections and indexes exist
   - Start the API server on port 3000

4. **Test the API:**
```bash
curl http://localhost:3000/health
```

### Option 2: Manual Setup

1. **Install MongoDB:**
   - macOS: `brew install mongodb-community`
   - Linux: follow https://www.mongodb.com/docs/manual/installation/
   - Windows: Download from https://www.mongodb.com/try/download/community

2. **Set up the database:**
```bash
# Easiest way - run the setup script
npm run setup:db

# Or use the shell script
./setup-db.sh

# Or manually check the database
mongosh "${MONGODB_URI:-mongodb://localhost:27017}" --eval "db.getSiblingDB('${DB_NAME:-order_engine}').stats()"
```

3. **Install Node.js dependencies:**
```bash
npm install
```

4. **Set up environment variables:**
```bash
cp env.example .env
# Edit .env with your MongoDB credentials
```

5. **Build the project:**
```bash
npm run build
```

6. **Start the server:**
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## Verify Installation

1. **Check health endpoint:**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "service": "order-execution-engine"
}
```

2. **Create a test order:**
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "symbol": "BTC/USD",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 1,
    "price": 50000
  }'
```

## Seed Sample Data (Optional)

To populate the database with sample orders:

```bash
npx ts-node src/scripts/seedData.ts
```

## Troubleshooting

### Database Connection Issues

1. **Check MongoDB is running:**
```bash
# macOS/Linux (Homebrew)
brew services list | grep mongo

# Systemd-based Linux
sudo systemctl status mongod
```

2. **Ping the database:**
```bash
mongosh "${MONGODB_URI:-mongodb://localhost:27017}" --quiet --eval "db.runCommand({ ping: 1 })"
```

3. **Inspect database stats:**
```bash
mongosh --quiet --eval "db.getSiblingDB('${DB_NAME:-order_engine}').stats()"
```

### Port Already in Use

If port 3000 is already in use, change it in `.env`:
```
PORT=3001
```

### Build Errors

1. **Clear node_modules and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
```

2. **Check TypeScript version:**
```bash
npx tsc --version
```

## Next Steps

- Read the [README.md](README.md) for API documentation
- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint documentation
- Run tests: `npm test`

