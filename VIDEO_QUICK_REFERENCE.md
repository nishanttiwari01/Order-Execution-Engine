# 🎥 Video Quick Reference Card

## ⚡ Quick Script (1-2 minutes)

### **0:00-0:10 - Intro**
"Hi! This is an Order Execution Engine that automatically matches buy and sell orders. Let me show you how it works."

**Show**: VS Code project structure

---

### **0:10-0:25 - Architecture**
"Orders flow through a REST API to a matching engine, which finds compatible orders and executes trades automatically. Everything is stored in MongoDB."

**Show**: 
- `src/index.ts` (server)
- `src/engine/MatchingEngine.ts` (matching logic)
- `src/database/connection.ts` (database)

---

### **0:25-0:45 - First Order**
"Alice wants to buy 10 Bitcoin at $50,000. The order is created and saved with status PENDING, waiting for a match."

**Command**:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"alice","symbol":"BTC/USD","side":"BUY","type":"LIMIT","quantity":10,"price":50000}'
```

**Show**: Response shows `"status": "PENDING"`, server logs

---

### **0:45-0:55 - Second Order (Match!)**
"Now Bob wants to sell 5 Bitcoin at $50,000. Watch - the matching engine finds Alice's order, prices match, and a trade executes automatically!"

**Command**:
```bash
curl -X POST http://localhost:3000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"userId":"bob","symbol":"BTC/USD","side":"SELL","type":"LIMIT","quantity":5,"price":50000}'
```

**Show**: Response shows `"trades": [...]`, Alice's order now `PARTIALLY_FILLED`, Bob's order `FILLED`

---

### **0:55-1:15 - Multiple Orders**
"Let's submit three orders simultaneously. Watch the server logs - you'll see each order being processed sequentially, matched, and trades executed."

**Commands** (run quickly one after another):
```bash
# Terminal 2
curl -X POST http://localhost:3000/api/v1/orders -H "Content-Type: application/json" -d '{"userId":"charlie","symbol":"BTC/USD","side":"SELL","type":"LIMIT","quantity":3,"price":49500}'

# Terminal 3  
curl -X POST http://localhost:3000/api/v1/orders -H "Content-Type: application/json" -d '{"userId":"david","symbol":"BTC/USD","side":"BUY","type":"LIMIT","quantity":8,"price":51000}'

# Terminal 4
curl -X POST http://localhost:3000/api/v1/orders -H "Content-Type: application/json" -d '{"userId":"eve","symbol":"BTC/USD","side":"SELL","type":"LIMIT","quantity":2,"price":50000}'
```

**Show**: Server logs processing all three, multiple trades created

---

### **1:15-1:25 - Results**
"Let's check the order book and all executed trades. You can see the complete flow from order submission to execution."

**Commands**:
```bash
curl http://localhost:3000/api/v1/orderbook/BTC/USD
curl http://localhost:3000/api/v1/trades
```

**Show**: Order book with pending orders, list of all trades

---

### **1:25-1:40 - Design Decisions**
"Key design: Price-time priority ensures fair matching, MongoDB provides reliable persistence, and the REST API enables easy integration. Orders process sequentially for data consistency."

**Show**: 
- `src/engine/MatchingEngine.ts` (matching algorithm)
- `src/database/connection.ts` (indexes/config)

---

## 📁 Files to Open During Video

1. **`src/index.ts`** - Lines 1-20 (server setup)
2. **`src/engine/MatchingEngine.ts`** - Lines 86-140 (matching logic)
3. **`src/controllers/OrderController.ts`** - Lines 19-70 (API handler)
4. **`src/database/connection.ts`** - Show Mongo connection/indexes
5. **Server logs terminal** - Show real-time processing

---

## 🎯 Key Points to Emphasize

1. ✅ **Automatic Matching**: "Orders match automatically when prices are compatible"
2. ✅ **Real-time Processing**: "Watch the server logs - orders processed in real-time"
3. ✅ **Price-Time Priority**: "Better prices matched first, then earlier orders"
4. ✅ **Queue Processing**: "Multiple orders processed sequentially"
5. ✅ **Status Updates**: "PENDING → PARTIALLY_FILLED → FILLED"
6. ✅ **Complete Audit Trail**: "All orders and trades permanently recorded"

---

## ⚠️ Note About WebSocket & DEX Routing

**Current System**: Uses REST API (not WebSocket)
- **Show Instead**: Server logs show real-time status updates
- **Explain**: "Status updates are visible in server logs. In production, you'd add WebSocket for real-time client updates."

**DEX Routing**: Not implemented (this is for decentralized exchanges)
- **Show Instead**: Matching engine routing decisions in logs
- **Explain**: "The matching engine routes orders to compatible matches based on price-time priority, visible in the logs."

---

## 🚀 Quick Start for Recording

```bash
# 1. Start server
npm start

# 2. In another terminal, run demo script
./VIDEO_DEMO_COMMANDS.sh

# Or manually run commands from VIDEO_SCRIPT.md
```

---

## 💡 Pro Tips

- **Speak clearly**: Moderate pace
- **Point cursor**: Highlight code sections
- **Show logs**: Keep server terminal visible
- **Pause briefly**: Let viewers see responses
- **Explain as you go**: "Watch what happens..."

**Good luck! 🎬**

