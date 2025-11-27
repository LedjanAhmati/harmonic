# Integration Testing Guide

Complete end-to-end testing workflow for payment + database integration.

## Prerequisites

✅ **Before starting, ensure:**

- Supabase project created with all tables and RLS policies
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`
- `LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_WEBHOOK_SECRET` in `.env.local`
- `NEXT_PUBLIC_APP_URL` set to your deployment URL or `http://localhost:3000`
- Next.js server running: `npm run dev`

## Test Flow

### Step 1: Create Test User

**Request:**

```bash
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "displayName": "Test User"
  }'
```

**Expected Response (201):**

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    "isPremium": false
  },
  "isNewUser": true
}
```

**Verify in Supabase:**

- Check `users` table
- New row with `isPremium = false`

---

### Step 2: Lookup User (Before Premium)

**Request:**

```bash
curl "http://localhost:3000/api/users/me?email=test@example.com"
```

**Expected Response (200):**

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    "isPremium": false,
    "createdAt": "2024-01-15T..."
  },
  "subscription": null
}
```

---

### Step 3: Create Checkout Link

**Request:**

```bash
curl -X POST http://localhost:3000/api/premium/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

**Expected Response (200):**

```json
{
  "success": true,
  "checkoutUrl": "https://lemonsqueezy.com/checkout/buy/...",
  "orderId": "order_12345"
}
```

**Next:** Copy `checkoutUrl` and open in browser to test payment flow.

---

### Step 4: Complete Payment (LemonSqueezy Test Mode)

**In LemonSqueezy Checkout:**

1. Use **test card**: `4242 4242 4242 4242` (expires: any future date, CVC: any 3 digits)
2. Fill in customer email: `test@example.com`
3. Click "Complete Purchase"

**Behind the scenes:**

- LemonSqueezy creates order (webhook fires)
- Server receives `POST /api/premium/webhook`
- Webhook handler:
  1. Verifies signature
  2. Extracts customer email
  3. Calls `subscriptionOps.createFromLemonSqueezy()`
  4. Sets user `isPremium = true`
  5. Creates subscription record

**Server logs should show:**
...
✅ LemonSqueezy webhook: order:created { email:test@example.com', orderId: 'order_...' }
✅ DB: Subscription created & premium activated for:test@example.com
...

---

### Step 5: Verify Premium Activated

**Request:**

```bash
curl "http://localhost:3000/api/users/me?email=test@example.com"
```

**Expected Response (200) - Note `isPremium: true`:**

```json
{
  "success": true,
  "user": {
    "id": "uuid-here",
    "email": "test@example.com",
    "displayName": "Test User",
    "isPremium": true,
    "createdAt": "2024-01-15T..."
  },
  "subscription": {
    "id": "sub_uuid",
    "planName": "Premium",
    "status": "active",
    "createdAt": "2024-01-15T...",
    "updatedAt": "2024-01-15T..."
  }
}
```

**Verify in Supabase:**

- Check `users` table: `isPremium = true`
- Check `subscriptions` table: New row with `status = 'active'`

---

### Step 6: Test Webhook Events (Manual)

**Simulate order event:**

```bash
curl -X POST http://localhost:3000/api/premium/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: test-signature-skip-for-local-testing" \
  -d '{
    "meta": {
      "event_name": "order:created"
    },
    "data": {
      "attributes": {
        "customer_email": "webhook@example.com",
        "order_number": 999,
        "total": "29.99",
        "currency": "USD",
        "status": "paid"
      }
    }
  }'
```

**Note:** Signature verification will fail in test mode. For development:

- Option A: Comment out signature check temporarily
- Option B: Use LemonSqueezy test mode (recommended)
- Option C: Generate valid signature using lemonsqueezy.ts

---

## Troubleshooting

### ❌ "user not found" on /api/users/me

**Cause:** User never created via /api/users/create

**Fix:** Call Step 1 first

---

### ❌ "Supabase connection refused"

**Cause:** Missing environment variables

**Fix:**

```bash
# Check .env.local has:
cat .env.local | grep SUPABASE
```

Should show:
...
SUPABASE_URL=https: //xxxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
...

---

### ❌ Webhook received but isPremium not updated

**Cause 1:** Webhook signature verification failing

- Check X-Signature header
- Verify LEMONSQUEEZY_WEBHOOK_SECRET matches LemonSqueezy dashboard

**Cause 2:** Database credentials wrong

- Check SUPABASE_SERVICE_ROLE_KEY is set (not just ANON_KEY)
- Webhook uses service role for admin access

**Cause 3:** RLS policies blocking writes

- Verify RLS policy allows service role writes
- Should have: `granted_roles = "{authenticator,postgres,service_role}"`

---

### ❌ "invalid_signature" on webhook

**Cause:** X-Signature header incorrect

**Fix (Development Only):**

```typescript
// In /api/premium/webhook/route.ts temporarily:
if (signature !== "skip-verification") {
  if (!verifyWebhookSignature(body, signature)) {
    // reject
  }
}
```

---

## Database Verification

### Check Users Table

```sql
SELECT id, email, display_name, is_premium, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check Subscriptions Table

```sql
SELECT id, user_id, lemon_squeezy_order_id, status, plan_name, created_at
FROM subscriptions
ORDER BY created_at DESC
LIMIT 5;
```

### Verify RLS Policies Active

```sql
SELECT 
  schemaname, tablename, 
  array_agg(policyname) as policies
FROM pg_policies
WHERE tablename IN ('users', 'subscriptions', 'results')
GROUP BY schemaname, tablename;
```

Should show policies for each table.

---

## Full End-to-End Checklist

- [ ] User created via POST /api/users/create
- [ ] User lookup returns `isPremium: false`
- [ ] Checkout link generated successfully
- [ ] Payment completed in LemonSqueezy
- [ ] Webhook received (check server logs)
- [ ] User lookup returns `isPremium: true`
- [ ] Supabase `users` table updated
- [ ] Supabase `subscriptions` table has new row
- [ ] All RLS policies working
- [ ] No TypeScript errors: `npm run build`

---

## Next Steps

After successful testing:

1. **Add Authentication** - Use magic link email or OAuth
2. **Connect UI** - Update PremiumUpgrade.tsx to call /api/users/create first
3. **Dashboard** - Show subscription status on /harmonic/dashboard/page.tsx
4. **Results Integration** - Save Trinity outputs with resultOps.save()
5. **Production** - Deploy to Vercel with real LemonSqueezy credentials
