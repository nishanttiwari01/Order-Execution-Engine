# How Orders Work: Who Places Them & How They Execute

## 👥 Who Places Orders?

### **Users/Clients** (The People/Applications Using Your System)

Orders are placed by:
1. **Traders** - People who want to buy or sell assets
2. **Trading Applications** - Apps that connect to your API
3. **Automated Systems** - Bots or algorithms that trade automatically
4. **Other Services** - Any system that calls your REST API

### **Example Users:**
- User "alice123" wants to BUY 10 BTC at $50,000
- User "bob456" wants to SELL 5 BTC at $51,000
- A trading bot wants to SELL 100 ETH at $3,000

**Key Point**: Anyone who can call your API can place orders!

---

## 🔄 How Orders Are Executed (Step-by-Step)

### **Step 1: User Places an Order**

```
User/Application
    ↓
Sends HTTP POST request to your API
    ↓
POST /api/v1/orders
{
  "userId": "alice123",
  "symbol": "BTC/USD",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": 10,
  "price": 50000
}
```

### **Step 2: API Receives Order**

```
OrderController.createOrder()
    ↓
Validates the request
    ↓
Checks: userId, symbol, side, type, quantity, price
```

### **Step 3: Order Saved to Database**

```
OrderModel.create()
    ↓
INSERT INTO orders (user_id, symbol, side, type, quantity, price, status)
VALUES ('alice123', 'BTC/USD', 'BUY', 'LIMIT', 10, 50000, 'PENDING')
    ↓
Order created with status: PENDING
```

### **Step 4: Matching Engine Processes Order**

```
MatchingEngine.processOrder(order)
    ↓
Checks existing orders in order book
    ↓
Looks for matching orders from OPPOSITE side
```

**For a BUY order, it looks for SELL orders:**
- Finds SELL orders with price <= buy price
- Sorts by: Price (lowest first), then Time (oldest first)

**For a SELL order, it looks for BUY orders:**
- Finds BUY orders with price >= sell price
- Sorts by: Price (highest first), then Time (oldest first)

### **Step 5: Matching Logic**

```
Example Scenario:
- Alice wants to BUY 10 BTC at $50,000
- Bob already has SELL order: 5 BTC at $50,000
- Charlie has SELL order: 3 BTC at $49,500

Matching Engine:
1. Finds Bob's order (price matches: $50,000)
2. Finds Charlie's order (better price: $49,500)
3. Matches with Charlie first (better price!)
4. Then matches with Bob for remaining quantity
```

### **Step 6: Trade Execution**

```
For each match found:
    ↓
1. Calculate trade quantity (min of both orders)
2. Determine trade price (use the existing order's price)
3. Create trade record
4. Update both orders:
   - Increase filled_quantity
   - Update status (PARTIALLY_FILLED or FILLED)
```

**Example Trade:**
```
Alice BUY 10 BTC @ $50,000
Charlie SELL 3 BTC @ $49,500
    ↓
Trade Created:
- Quantity: 3 BTC
- Price: $49,500 (Charlie's price - better for Alice!)
- Alice's order: 3 filled, 7 remaining (PARTIALLY_FILLED)
- Charlie's order: 3 filled, 0 remaining (FILLED)
```

### **Step 7: Save Trades to Database**

```
TradeModel.create()
    ↓
INSERT INTO trades (buy_order_id, sell_order_id, symbol, quantity, price)
VALUES (alice_order_id, charlie_order_id, 'BTC/USD', 3, 49500)
    ↓
Trade recorded permanently
```

### **Step 8: Remaining Order Handling**

```
If order is PARTIALLY_FILLED:
    ↓
Order stays in order book
    ↓
Status: PARTIALLY_FILLED
    ↓
Waits for more matching orders

If order is FILLED:
    ↓
Order removed from order book
    ↓
Status: FILLED
    ↓
No more matching needed
```

### **Step 9: Response to User**

```
API returns:
{
  "order": {
    "id": "uuid",
    "status": "PARTIALLY_FILLED",
    "filledQuantity": 3,
    "quantity": 10,
    ...
  },
  "trades": [
    {
      "id": "trade-uuid",
      "quantity": 3,
      "price": 49500,
      ...
    }
  ],
  "message": "Order created and partially filled"
}
```

---

## 🎯 Complete Example Flow

### **Scenario: Two Users Trading**

**Initial State:**
- Order book is empty

**Step 1: Alice Places Buy Order**
```
Alice → POST /api/v1/orders
{
  "userId": "alice",
  "symbol": "BTC/USD",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": 10,
  "price": 50000
}

Result:
- Order created: PENDING
- No matches found (order book empty)
- Order added to buy side of order book
- Status: PENDING
```

**Step 2: Bob Places Sell Order**
```
Bob → POST /api/v1/orders
{
  "userId": "bob",
  "symbol": "BTC/USD",
  "side": "SELL",
  "type": "LIMIT",
  "quantity": 5,
  "price": 50000
}

Matching Engine:
1. Finds Alice's BUY order @ $50,000
2. Prices match! ($50,000 = $50,000)
3. Executes trade:
   - Quantity: 5 BTC (min of 10 and 5)
   - Price: $50,000
4. Updates:
   - Alice's order: 5 filled, 5 remaining (PARTIALLY_FILLED)
   - Bob's order: 5 filled, 0 remaining (FILLED)
5. Creates trade record

Result:
- Trade executed!
- Alice gets 5 BTC
- Bob sells 5 BTC
- Both get $50,000 per BTC
```

**Step 3: Charlie Places Another Sell Order**
```
Charlie → POST /api/v1/orders
{
  "userId": "charlie",
  "symbol": "BTC/USD",
  "side": "SELL",
  "type": "LIMIT",
  "quantity": 3,
  "price": 49500  ← Better price!
}

Matching Engine:
1. Finds Alice's remaining BUY order (5 BTC @ $50,000)
2. Charlie's price is better ($49,500 < $50,000)
3. Executes trade:
   - Quantity: 3 BTC
   - Price: $49,500 (Charlie's price - better for Alice!)
4. Updates:
   - Alice's order: 8 filled (5+3), 2 remaining (PARTIALLY_FILLED)
   - Charlie's order: 3 filled, 0 remaining (FILLED)

Result:
- Another trade executed!
- Alice gets 3 more BTC at better price
- Charlie sells 3 BTC
```

---

## 🏗️ System Architecture

```
┌─────────────┐
│   Users/    │
│ Applications│
│  (Clients)  │
└──────┬──────┘
       │ HTTP Requests
       ↓
┌─────────────────┐
│  REST API       │
│  (Express.js)   │
│  Port 3000      │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Controllers    │
│  (OrderController)│
│  - Validate     │
│  - Process      │
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Matching Engine│
│  - Find matches │
│  - Execute trades│
│  - Update orders│
└──────┬──────────┘
       │
       ↓
┌─────────────────┐
│  Database       │
│  (MongoDB)      │
│  - Store orders │
│  - Store trades │
└─────────────────┘
```

---

## 🔑 Key Concepts

### **Order Book**
- **Bids (Buy Orders)**: Sorted by price (highest first), then time
- **Asks (Sell Orders)**: Sorted by price (lowest first), then time
- Think of it as a "waiting list" for orders

### **Matching Rules**
1. **Opposite Sides**: BUY matches with SELL, not BUY with BUY
2. **Price Compatibility**:
   - BUY @ $50,000 matches SELL @ $50,000 or lower
   - SELL @ $50,000 matches BUY @ $50,000 or higher
3. **Best Price First**: Better prices get matched first
4. **Time Priority**: Same price? Earlier order wins

### **Order Lifecycle**
```
PENDING → PARTIALLY_FILLED → FILLED
   ↓
CANCELLED (if user cancels)
   ↓
REJECTED (if invalid)
```

---

## 💻 How to Test It

### **1. Start Your Server**
```bash
npm start
```

### **2. Create First Order (Buy)**
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

**Result**: Order created, status PENDING (no matches yet)

### **3. Create Second Order (Sell - Will Match!)**
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

**Result**: 
- Trade executed!
- Alice's order: 5 filled, 5 remaining
- Bob's order: 5 filled, 0 remaining (FILLED)
- Trade record created

### **4. Check Order Book**
```bash
curl http://localhost:3000/api/v1/orderbook/BTC/USD
```

**Shows**: Current buy and sell orders waiting to match

### **5. Check Trades**
```bash
curl http://localhost:3000/api/v1/trades
```

**Shows**: All executed trades

---

## 🎓 Summary

### **Who Places Orders?**
- **Anyone** who can call your API
- Users, applications, bots, other services
- Identified by `userId` in the request

### **How Orders Execute?**
1. User sends order via API
2. Order saved to database (PENDING)
3. Matching Engine looks for opposite side orders
4. If match found → Execute trade
5. Update both orders (filled quantities, status)
6. Save trade to database
7. Return response to user

### **Key Points:**
- ✅ Orders match automatically when compatible
- ✅ Better prices get priority
- ✅ Partial fills are possible
- ✅ All trades are recorded
- ✅ Order book shows pending orders

---

## 🚀 Real-World Example

**Stock Exchange:**
- You want to buy Apple stock
- You place order: BUY 100 shares @ $150
- Exchange finds someone selling @ $150
- Trade executes automatically
- You get 100 shares, they get your money

**Your System:**
- Same concept, but for any trading pair (BTC/USD, ETH/USD, etc.)
- Fully automated matching
- Real-time execution
- Complete trade history

---

Your Order Execution Engine works exactly like a real exchange - users place orders, and the system automatically matches and executes them!

