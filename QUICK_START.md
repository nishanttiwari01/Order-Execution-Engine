# Quick Start Guide - Order Execution Engine

## 🚀 Complete Setup & Run Guide

### Step-by-Step Commands

#### 1. **Install Dependencies** (First time only)
```bash
npm install
```
This installs all required packages (Express, MongoDB driver, TypeScript, etc.)

#### 2. **Set Up Database** (First time only, or when schema changes)
```bash
npm run setup:db
```

**What this does:**
- ✅ Connects to MongoDB (using credentials from `.env`)
- ✅ Creates the `order_engine` database if it doesn't exist
- ✅ Ensures the `orders` and `trades` collections exist
- ✅ Applies the required indexes for performance
- ✅ Verifies everything was created correctly

**Note:** If you see "already exists" messages, that's normal - it means the collections/indexes are already set up.

#### 3. **Build the TypeScript Code** (Required before starting)
```bash
npm run build
```

**What this does:**
- Compiles TypeScript (`.ts`) files to JavaScript (`.js`)
- Outputs compiled files to the `dist/` directory
- Required because Node.js runs JavaScript, not TypeScript

#### 4. **Start the Server**

**Option A: Production Mode** (uses compiled JavaScript)
```bash
npm start
```

**Option B: Development Mode** (with hot reload - recommended for development)
```bash
npm run dev
```
This automatically recompiles and restarts when you change code.

#### 5. **Verify It's Working**
```bash
curl http://localhost:3000/health
```

You should see a response like:
```json
{"status":"ok","timestamp":"2025-11-23T..."}
```

---

## 📋 Complete Command Sequence (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Set up database
npm run setup:db

# 3. Build the project
npm run build

# 4. Start the server
npm start
```

Or for development:
```bash
npm install
npm run setup:db
npm run dev  # This doesn't require build step
```

---

## 🔄 Daily Workflow

### Starting Fresh Each Day:
```bash
npm run dev
```

### After Making Code Changes:
- If using `npm run dev`: Changes are auto-detected, no action needed
- If using `npm start`: Run `npm run build` then `npm start`

### After Database/index Changes:
```bash
npm run setup:db
```

---

## 🛠️ Other Useful Commands

### Seed Sample Data (Optional)
```bash
npm run seed
```
Adds sample orders and trades to test the system.

### Run Tests
```bash
npm test
```

### Check Code Quality
```bash
npm run lint      # Check for errors
npm run format    # Auto-format code
```

---

## 📁 Project Structure

```
Eterna_Labs/
├── src/
│   ├── index.ts              # Main application entry point
│   ├── database/
│   │   └── connection.ts     # MongoDB connection utilities
│   ├── scripts/
│   │   ├── setupDatabase.ts  # Database setup script
│   │   └── seedData.ts       # Sample data generator
│   ├── models/               # Database models
│   ├── controllers/          # API request handlers
│   ├── routes/               # API routes
│   └── engine/               # Order matching engine
├── dist/                     # Compiled JavaScript (created by build)
├── .env                      # Environment variables (database config)
└── package.json              # Project config and scripts
```

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'dist/index.js'"
**Solution:** Run `npm run build` first

### Error: "Database connection failed"
**Solution:** 
1. Check MongoDB is running (`brew services list | grep mongo` or `systemctl status mongod`)
2. Verify `.env` has a valid `MONGODB_URI`
3. Run `npm run setup:db` again

### Error: "Port 3000 already in use"
**Solution:** 
- Change `PORT` in `.env` file
- Or kill the process using port 3000

---

## 📚 Next Steps

Once the server is running:
- Check API documentation: `API_DOCUMENTATION.md`
- See example requests: `EXAMPLES.md`
- Read full setup guide: `SETUP.md`
