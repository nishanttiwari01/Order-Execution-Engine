# YouTube Video Script: Order Execution Engine Demo

## 🎬 Video Structure (1-2 minutes)

### **Part 1: Introduction (10 seconds)**
### **Part 2: System Overview (15 seconds)**
### **Part 3: Live Demo - Multiple Orders (60 seconds)**
### **Part 4: Design Decisions & Conclusion (15 seconds)**

---

## 📝 Detailed Script

### **PART 1: Introduction (0:00 - 0:10)**

**What to Say:**
> "Hi! I'm demonstrating an Order Execution Engine - a trading system that automatically matches buy and sell orders. Let me show you how it works."

**What to Show:**
- VS Code with project open
- Quick view of project structure

---

### **PART 2: System Overview (0:10 - 0:25)**

**What to Say:**
> "The system has three main components: a REST API for order submission, a matching engine that finds compatible orders, and a MongoDB database that stores everything. Orders flow from the API through the matching engine, which executes trades automatically when prices match."

**What to Show:**
- Open `src/index.ts` - Show Express server setup
- Open `src/engine/MatchingEngine.ts` - Show matching logic
- Open `src/database/connection.ts` - Show MongoDB connection setup
- Open terminal showing server running

**Files to Open:**
1. `src/index.ts` (lines 1-20)
2. `src/engine/MatchingEngine.ts` (lines 10-50)
3. `src/database/connection.ts` (show Mongo connection)

---

### **PART 3: Live Demo (0:25 - 1:25) - THE MAIN PART**

#### **Step 1: Show Server Running (0:25 - 0:30)**

**What to Say:**
> "First, let's start the server. You can see it's running on port 3000."

**What to Show:**
- Terminal with `npm start` or `npm run dev`
- Show server logs: "Order Execution Engine server running on port 3000"

**Action:**
```bash
npm start
# or
npm run dev
```

---

#### **Step 2: Open Multiple Terminal Windows (0:30 - 0:35)**

**What to Say:**
> "I'll open multiple terminal windows to submit orders simultaneously and show real-time processing."

**What to Show:**
- Split screen: 3-4 terminal windows
- One for server logs
- Others for API calls

**Setup:**
- Terminal 1: Server logs (keep visible)
- Terminal 2: For API calls
- Terminal 3: For API calls
- Terminal 4: For API calls

---

#### **Step 3: Submit First Order (0:35 - 0:45)**

**What to Say:**
> "Let's submit the first order - Alice wants to buy 10 Bitcoin at $50,000."

**What to Show:**
- Terminal with curl command
- Server logs showing order received
- VS Code: Open `src/controllers/OrderController.ts` (lines 19-70)

**Action:**
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "alice",
    "symbol": "BTC/USD",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 10,
    "price": 50000
  }'
```

**What to Highlight:**
- Show response: `"status": "PENDING"` (no matches yet)
- Show server logs: "Processing order..."
- Point to controller code handling the request

---

#### **Step 4: Submit Second Order - Show Matching (0:45 - 0:55)**

**What to Say:**
> "Now Bob wants to sell 5 Bitcoin at $50,000. Watch what happens - the matching engine finds Alice's order, prices match, and a trade is executed automatically!"

**What to Show:**
- Terminal with second curl command
- Server logs showing matching process
- VS Code: Open `src/engine/MatchingEngine.ts` (lines 86-130)
- Show trade being created

**Action:**
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "bob",
    "symbol": "BTC/USD",
    "side": "SELL",
    "type": "LIMIT",
    "quantity": 5,
    "price": 50000
  }'
```

**What to Highlight:**
- Response shows: `"trades": [...]` (trade was created!)
- Alice's order: `"status": "PARTIALLY_FILLED"`, `"filledQuantity": 5`
- Bob's order: `"status": "FILLED"`
- Point to matching engine code executing the trade

---

#### **Step 5: Submit Multiple Orders Simultaneously (0:55 - 1:15)**

**What to Say:**
> "Now let's submit three orders at the same time to show the queue processing multiple orders. Watch the server logs - you'll see each order being processed, matched, and trades being executed."

**What to Show:**
- Three terminal windows with curl commands ready
- Execute all three at once (or quickly one after another)
- Server logs showing all three being processed
- VS Code: Show matching engine processing queue

**Actions (run in 3 different terminals simultaneously):**
```bash
# Terminal 2
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "charlie",
    "symbol": "BTC/USD",
    "side": "SELL",
    "type": "LIMIT",
    "quantity": 3,
    "price": 49500
  }'

# Terminal 3
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "david",
    "symbol": "BTC/USD",
    "side": "BUY",
    "type": "LIMIT",
    "quantity": 8,
    "price": 51000
  }'

# Terminal 4
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "eve",
    "symbol": "BTC/USD",
    "side": "SELL",
    "type": "LIMIT",
    "quantity": 2,
    "price": 50000
  }'
```

**What to Highlight:**
- Server logs showing all orders being received
- Matching engine processing each one
- Multiple trades being created
- Order statuses updating (PENDING → PARTIALLY_FILLED → FILLED)
- Point to logs showing "Processing order..." for each

---

#### **Step 6: Show Order Book & Trades (1:15 - 1:25)**

**What to Say:**
> "Let's check the order book to see pending orders, and view all executed trades. You can see the complete order flow from submission to execution."

**What to Show:**
- Terminal: Query order book
- Terminal: Query all trades
- VS Code: Show database queries in models

**Actions:**
```bash
# Show order book
curl http://localhost:3000/api/v1/orderbook/BTC/USD

# Show all trades
curl http://localhost:3000/api/v1/trades
```

**What to Highlight:**
- Order book shows pending buy/sell orders
- Trades list shows all executed trades
- Point to database models executing queries

---

### **PART 4: Design Decisions & Conclusion (1:25 - 1:40)**

**What to Say:**
> "Key design decisions: Price-time priority matching ensures fair execution, MongoDB provides reliable persistence, and the REST API enables easy integration. The system processes orders sequentially, ensuring data consistency. All trades are recorded permanently for audit trails."

- **What to Show:**
- VS Code: Show key files
  - `src/engine/MatchingEngine.ts` - Matching algorithm
  - `src/database/connection.ts` - MongoDB configuration
  - `src/models/OrderModel.ts` - Data layer
- Terminal: Show final state (all orders processed)

**Files to Highlight:**
1. `src/engine/MatchingEngine.ts` - Show matching logic
2. `src/database/connection.ts` - Show connection/indexes
3. `src/models/OrderModel.ts` - Show data access layer

---

## 🎥 Screen Setup for Recording

### **Recommended Layout:**

```
┌─────────────────────────────────────┐
│         VS Code (Left 60%)          │
│  - Show relevant source files        │
│  - Highlight code sections           │
└─────────────────────────────────────┘
┌──────────────┬──────────────────────┐
│ Terminal 1   │ Terminal 2-4          │
│ (Server Logs)│ (API Calls)            │
│              │                        │
└──────────────┴──────────────────────┘
```

### **Screen Recording Tips:**
1. **Use screen split**: VS Code on left, terminals on right
2. **Zoom in**: Make text readable (font size 14-16)
3. **Highlight cursor**: Move cursor to show what you're explaining
4. **Smooth transitions**: Don't rush between sections

---

## 📋 Pre-Recording Checklist

### **Before You Start:**

1. ✅ **Server is running**
   ```bash
   npm start
   # or
   npm run dev
   ```

2. ✅ **Database is set up**
   ```bash
   npm run setup:db
   ```

3. ✅ **Test all commands work**
   - Test each curl command
   - Verify responses
   - Check server logs

4. ✅ **Have files ready to open**
   - `src/index.ts`
   - `src/engine/MatchingEngine.ts`
   - `src/controllers/OrderController.ts`
   - `src/database/connection.ts`
   - `src/models/OrderModel.ts`

5. ✅ **Prepare terminal windows**
   - Terminal 1: Server logs (keep running)
   - Terminal 2-4: Ready for API calls

---

## 🎬 Recording Tips

### **Do's:**
- ✅ Speak clearly and at moderate pace
- ✅ Pause briefly when showing code
- ✅ Point cursor to relevant sections
- ✅ Show server logs in real-time
- ✅ Execute commands smoothly
- ✅ Explain what's happening as it happens

### **Don'ts:**
- ❌ Don't rush through commands
- ❌ Don't show too much code at once
- ❌ Don't forget to show server logs
- ❌ Don't skip the matching process explanation

---

## 📝 Key Points to Emphasize

1. **Automatic Matching**: "Orders match automatically when prices are compatible"
2. **Real-time Processing**: "Watch the server logs - you can see orders being processed in real-time"
3. **Price-Time Priority**: "Better prices get matched first, then earlier orders"
4. **Partial Fills**: "Orders can fill partially across multiple trades"
5. **Complete Audit Trail**: "All orders and trades are permanently recorded"

---

## 🔧 Alternative: Using Postman/Thunder Client

If curl commands are hard to show, use Postman or VS Code's Thunder Client:

1. **Setup**: Create request collection with all orders
2. **Demo**: Click "Send" on multiple requests
3. **Show**: Response panel and server logs

---

## 📊 Expected Results to Show

### **After All Orders:**
- **Alice**: BUY 10 @ $50,000 → 5 filled, 5 remaining (PARTIALLY_FILLED)
- **Bob**: SELL 5 @ $50,000 → 5 filled (FILLED)
- **Charlie**: SELL 3 @ $49,500 → Should match with Alice (better price!)
- **David**: BUY 8 @ $51,000 → May match or stay pending
- **Eve**: SELL 2 @ $50,000 → Should match with Alice

### **Trades Created:**
- Alice ↔ Bob: 5 BTC @ $50,000
- Alice ↔ Charlie: 3 BTC @ $49,500 (if Alice still has remaining)
- Possibly more matches

---

## 🎯 Final Script Summary

**0:00-0:10**: Introduction
**0:10-0:25**: System overview (show architecture)
**0:25-0:45**: First order (show PENDING)
**0:45-0:55**: Second order (show matching & trade)
**0:55-1:15**: Multiple orders simultaneously (show queue processing)
**1:15-1:25**: Show order book & trades
**1:25-1:40**: Design decisions & conclusion

**Total: ~1:40 minutes** (perfect for 1-2 min requirement!)

---

## 💡 Pro Tips

1. **Practice first**: Run through the demo once before recording
2. **Have backup**: If something fails, have a backup plan
3. **Show enthusiasm**: Make it engaging!
4. **Highlight key moments**: 
   - When trade executes
   - When status changes
   - When multiple orders process

Good luck with your video! 🎥

