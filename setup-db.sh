#!/bin/bash

# Database Setup Script
# This script prepares MongoDB for the Order Execution Engine
# Usage: ./setup-db.sh

set -e  # Exit on error

echo "🚀 Setting up Order Execution Engine MongoDB..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from env.example..."
    cp env.example .env
    echo "✅ Created .env file. Please edit it with your database credentials."
    echo ""
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Check if MongoDB is running (requires mongosh)
echo "Checking MongoDB connection..."
MONGO_URI=${MONGODB_URI:-"mongodb://${DB_HOST:-localhost}:${DB_PORT:-27017}"}

if ! mongosh "${MONGO_URI}" --quiet --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1; then
    echo "❌ Cannot connect to MongoDB!"
    echo "   Please ensure MongoDB is running and the connection string in .env is correct."
    exit 1
fi

echo "✅ MongoDB connection successful"
echo ""

# Run the setup script
echo "Running database setup..."
npm run setup:db

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the server: npm start"
echo "  2. Or run in dev mode: npm run dev"
echo "  3. Seed sample data (optional): npm run seed"

