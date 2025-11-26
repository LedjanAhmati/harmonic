# API Reference

Complete endpoint documentation for the Harmonic SaaS backend.

## User Management

### Create/Register User

...
POST /api/users/create
Content-Type: application/json

{
  "email": "<clisonix@gmail.com>",

  "displayName": "John Doe"
}
...

**Response (201):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "isPremium": false
  },
  "isNewUser": true
}
```

**Error (400):**

```json
{
  "success": false,
  "error": "email is required"
}
```

---

### Get User Info

```
GET /api/users/me?email=user@example.com
```

**Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "isPremium": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "subscription": {
    "id": "sub-uuid-here",
    "planName": "Premium",
    "status": "active",
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Response (200) - No Subscription:**

```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "displayName": "John Doe",
    "isPremium": false,
    "createdAt": "2024-01-15T10:30:00.000Z"
  },
  "subscription": null
}
```

**Error (404):**

```json
{
  "success": false,
  "error": "user not found"
}
```

---

## Payment & Premium

### Create Checkout Link

...
POST /api/premium/checkout
Content-Type: application/json

{
  "email": "<clisonix@gmail.com>"
}
...

**Response (200):**

```json
{
  "success": true,
  "checkoutUrl": "https://lemonsqueezy.com/checkout/buy/...",
  "orderId": "order_abc123"
}
```

**Error (400):**

```json
{
  "success": false,
  "error": "email is required"
}
```

---

### Webhook Handler

...
POST /api/premium/webhook
X-Signature:<LemonSqueezy webhook signature>
Content-Type: application/json

{
  "meta": {
    "event_name": "order:created",
    "timestamp": "2024-01-15T10:30:00Z",
    "webhook_id": "webhook_123"
  },
  "data": {
    "id": "order_123",
    "type": "orders",
    "attributes": {
      "customer_email": "user@example.com",
      "order_number": 12345,
      "total": "29.99",
      "currency": "USD",
      "status": "paid"
    }
  }
}
```

**Response (200):**
```json
{
  "ok": true,
  "result": {
    "success": true,
    "action": "order_created"
  }
}
```

**Handled Events:**
- `order:created` - New purchase (sets `isPremium = true`)
- `order:refunded` - Refund received (sets `isPremium = false`)
- `subscription:created` - Recurring subscription started
- `subscription:updated` - Subscription status changed
- `subscription:cancelled` - Subscription ended (sets `isPremium = false`)
- `subscription:paused` - Subscription paused (sets `isPremium = false`)
- `subscription:expired` - Subscription expired (sets `isPremium = false`)

**Error (401):**
```json
{
  "ok": false,
  "error": "invalid_signature"
}
```

---

## Database Operations (Internal)

These are available through `lib/db/supabase.ts` for use in your API routes:

### User Operations

```typescript
import { userOps } from "@/lib/db/supabase";

// Create or get user
const user = await userOps.getOrCreateUser(email, displayName);

// Get by ID
const user = await userOps.getUser(userId);

// Get by email
const user = await userOps.getUserByEmail(email);

// Set premium by ID
await userOps.setPremium(userId, true);

// Set premium by email (called by webhook)
await userOps.setPremiumByEmail(email, true);
```

### Subscription Operations

```typescript
import { subscriptionOps } from "@/lib/db/supabase";

// Create from LemonSqueezy payment
const sub = await subscriptionOps.createFromLemonSqueezy(
  email,
  orderId,
  "Premium"
);

// Get all subscriptions for user
const subs = await subscriptionOps.getByUser(userId);

// Get active subscription
const sub = await subscriptionOps.getActiveByUser(userId);
```

### Result Operations

```typescript
import { resultOps } from "@/lib/db/supabase";

// Save Trinity debate result
const result = await resultOps.save(userId, content, {
  personas: ["Alba", "ASI"],
  debate: "Topic here",
  winner: "Blerina"
});

// Get user's results
const results = await resultOps.getByUser(userId, limit);

// Delete result
await resultOps.delete(resultId, userId);

// Pin/unpin result
await resultOps.togglePin(resultId, userId);
```

---

## Type Definitions

### User

```typescript
interface User {
  id: string;                    // UUID
  email: string;                 // Unique email
  displayName: string;           // User's name
  isPremium: boolean;            // Premium status
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscription

```typescript
interface Subscription {
  id: string;                           // UUID
  userId: string;                       // Reference to users.id
  lemonSqueezyOrderId: string;         // LemonSqueezy order ID
  status: "active" | "paused" | "cancelled" | "expired";
  planName: string;                     // e.g., "Premium"
  createdAt: Date;
  updatedAt: Date;
}
```

### Result

```typescript
interface Result {
  id: string;                    // UUID
  userId: string;                // Reference to users.id
  content: string;               // Trinity output text
  metadata: {
    personas?: string[];         // ["Alba", "ASI", ...]
    debate?: string;             // Debate topic
    mood?: string;               // "focused", "creative", etc.
    tools?: string[];            // Tools used
    winner?: string;             // Winning persona (optional)
  };
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request (missing/invalid params) |
| 401 | Unauthorized (invalid signature) |
| 404 | Not found (user/resource) |
| 500 | Server error |

---

## Rate Limiting

Currently: **No rate limiting** (implement as needed)

Recommended for production:
- 100 requests/minute per IP
- 1000 requests/hour per user

---

## Authentication

Current: **Email-based** (query parameter)

Future: JWT tokens or session cookies

```typescript
// Later: JWT bearer token
Authorization: Bearer eyJhbGc...

// Or session cookie (automatic)
Cookie: __Secure-next-auth.session-token=...
```

---

## CORS

Currently: **Same-origin only** (Next.js API routes)

If calling from different domain, add CORS headers:

```typescript
export const middleware = async (req: Request) => {
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  return response;
};
```

---

## Webhook Security

**Signature Verification:**

```bash
# LemonSqueezy sends X-Signature header:
X-Signature: base64_encoded_hmac_sha256

# Server verifies:
const isValid = verifyWebhookSignature(body, signature);
```

**Implementation (already done):**
```typescript
import crypto from "crypto";

function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) return false;

  const hash = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");

  return hash === signature;
}
```

---

## Example Flow

### 1. User Signs Up

```bash
POST /api/users/create
{
  "email": "alice@example.com",
  "displayName": "Alice"
}
# → Creates user with isPremium = false
```

### 2. User Clicks "Upgrade"

```bash
POST /api/premium/checkout
{
  "email": "alice@example.com"
}
# → Returns LemonSqueezy checkout URL
```

### 3. Customer Completes Payment

- Browser redirected to LemonSqueezy
- Customer enters card details
- LemonSqueezy charges card
- Fires webhook event

### 4. Webhook Received

```bash
POST /api/premium/webhook
X-Signature: <signature>
{
  "meta": { "event_name": "order:created" },
  "data": {
    "attributes": {
      "customer_email": "alice@example.com",
      "order_number": 12345
    }
  }
}
# → Server:
# 1. Verifies signature ✓
# 2. Calls subscriptionOps.createFromLemonSqueezy()
# 3. Sets user isPremium = true ✓
# 4. Logs success ✓
```

### 5. Check Premium Status

```bash
GET /api/users/me?email=alice@example.com
# → Returns:
{
  "success": true,
  "user": {
    "id": "...",
    "email": "alice@example.com",
    "isPremium": true  # ← Changed!
  },
  "subscription": {
    "planName": "Premium",
    "status": "active"
  }
}
```

---

## Testing Endpoints

Use curl or Postman:

```bash
# Create user
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Test"}'

# Get user
curl "http://localhost:3000/api/users/me?email=test@example.com"

# Create checkout
curl -X POST http://localhost:3000/api/premium/checkout \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Need Help?

- **Integration Testing**: See `INTEGRATION_TESTING.md`
- **Database Issues**: See `SUPABASE_SETUP.md`
- **Payment Setup**: See `LEMONSQUEEZY_SETUP.md`
- **Architecture**: See `ARCHITECTURE.md`
