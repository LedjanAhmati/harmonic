# 🚀 LemonSqueezy Premium Integration

## Setup Instructions

### 1. Create LemonSqueezy Account
- Go to [lemonsqueezy.com](https://lemonsqueezy.com)
- Create account & store
- Create a **Product** for your premium plan (e.g., "Harmonic Premium")

### 2. Get API Keys
1. Go to **Settings → API**
2. Generate API Key
3. Note: **Store ID** and **Product ID**
4. Generate **Webhook Secret** for signature verification

### 3. Configure Environment
Create/update `.env.local`:

```bash
LEMONSQUEEZY_API_KEY=your_api_key
LEMONSQUEEZY_STORE_ID=your_store_id
LEMONSQUEEZY_PRODUCT_ID=your_product_id
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Webhook URL
1. In LemonSqueezy dashboard → **Webhooks**
2. Add webhook endpoint:
   ```
   https://your-domain.com/api/premium/webhook
   ```
3. Select events:
   - `order:created`
   - `subscription:created`
   - `subscription:updated`
   - `subscription:cancelled`

### 5. Test Locally

**Start dev server:**
```bash
npm run dev
# http://localhost:3000
```

**Test checkout:**
```bash
curl -X POST http://localhost:3000/api/premium/checkout \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

Response:
```json
{
  "ok": true,
  "checkoutUrl": "https://buy.lemonsqueezy.com/checkout/..."
}
```

---

## Files Created

| File | Purpose |
|------|---------|
| `lib/payments/lemonsqueezy.ts` | API client & webhook verification |
| `app/api/premium/checkout/route.ts` | Checkout session creation |
| `app/api/premium/webhook/route.ts` | Webhook handler for payment events |
| `app/components/PremiumUpgrade.tsx` | "Upgrade to Premium" UI button |
| `.env.example` | Configuration template |

---

## Usage in UI

Import and use the upgrade button:

```tsx
import { PremiumUpgrade } from "@/app/components/PremiumUpgrade";

export default function DashboardPage() {
  return (
    <div>
      <PremiumUpgrade 
        userEmail="user@example.com"
        onSuccess={() => console.log("Payment successful!")}
      />
    </div>
  );
}
```

---

## Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │ Clicks "Upgrade"
       ▼
┌─────────────────────────────┐
│ /api/premium/checkout POST  │
│ - Gets user email           │
│ - Creates LemonSqueezy link │
└──────┬──────────────────────┘
       │ Returns checkoutUrl
       ▼
┌─────────────────────┐
│ LemonSqueezy Modal  │
│ - User enters card  │
│ - Payment processes │
└──────┬──────────────┘
       │ Payment success
       ▼
┌──────────────────────────┐
│ /api/premium/webhook     │
│ - Verify signature       │
│ - Handle order:created   │
│ - Update DB (TODO)       │
└──────┬───────────────────┘
       │ Redirect to dashboard
       ▼
┌─────────────────┐
│ Premium Activated│
└─────────────────┘
```

---

## TODO: Database Integration

Currently, webhooks are **verified and logged**, but:

1. **Missing**: Update `users.isPremium` flag in database
2. **Missing**: Create `subscriptions` table to track premium status
3. **Missing**: Handle cancellations & refunds

To complete:

```sql
-- Add to your database
ALTER TABLE users ADD COLUMN isPremium BOOLEAN DEFAULT false;

CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  userId UUID REFERENCES users(id),
  lemonSqueezyId TEXT UNIQUE,
  status TEXT, -- 'active', 'cancelled', 'paused'
  currentPeriodEnd TIMESTAMP,
  createdAt TIMESTAMP DEFAULT NOW()
);
```

---

## Testing Locally with Webhooks

For local testing, use **ngrok** to expose your webhook:

```bash
# Install ngrok
npm install -g ngrok

# Expose local server
ngrok http 3000

# Copy ngrok URL to LemonSqueezy webhook: https://xxxx.ngrok.io/api/premium/webhook
```

---

## API Endpoints

### POST /api/premium/checkout
**Create a checkout link**

Request:
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "ok": true,
  "checkoutUrl": "https://buy.lemonsqueezy.com/checkout/..."
}
```

---

### POST /api/premium/webhook
**Receives LemonSqueezy events** (automatically called by LemonSqueezy)

Headers:
- `X-Signature`: Webhook signature for verification

Events handled:
- `order:created` → User purchased
- `order:refunded` → Refund processed
- `subscription:created` → Subscription started
- `subscription:updated` → Plan changed
- `subscription:cancelled` → Subscription cancelled
- `subscription:paused` → Subscription paused

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Invalid signature" | Check `LEMONSQUEEZY_WEBHOOK_SECRET` is correct |
| "Failed to create checkout" | Verify `LEMONSQUEEZY_API_KEY`, `STORE_ID`, `PRODUCT_ID` |
| Webhooks not firing | Ensure webhook URL is public & configured in LemonSqueezy |
| CORS errors | Check your app URL in LemonSqueezy redirect_url |

---

## Next Steps

✅ **Completed:**
1. Checkout creation
2. Webhook handling
3. Signature verification
4. UI component

🔄 **TODO:**
1. Database integration (update user premium status)
2. Subscription management page
3. Invoice history
4. Plan comparison UI
5. Cancellation flow

---

**Questions?** Check LemonSqueezy docs: https://docs.lemonsqueezy.com
