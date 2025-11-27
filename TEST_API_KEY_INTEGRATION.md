# API Key & Usage Tracking Integration - Test Guide

**Status**: ✅ INTEGRATION COMPLETE

## What Was Integrated

### 1. APIKeyManager Integration

- Added to `/api/v1/data/route.js`
- Verifies API keys before processing requests
- Returns `401` for invalid keys
- Provides key metadata to quota checker

### 2. UsageTracker Integration

- Added to `/api/v1/data/route.js`
- Tracks all POST requests automatically
- Enforces quotas per tier
- Returns `429` when quota exceeded
- Includes quota headers in all responses

### 3. Authentication Middleware

```javascript
verifyAndTrackRequest(req) // Verify API key + check quota
trackUsage(userId, endpoint, responseTime, source) // Log request
```

### 4. Rate Limit Headers

All POST responses now include:

- `X-RateLimit-Limit` - Total quota for period
- `X-RateLimit-Used` - Requests used
- `X-RateLimit-Remaining` - Requests available
- `X-RateLimit-Reset` - ISO timestamp when quota resets
- `X-User-Id` - User identifier
- `X-Response-Time` - Request duration in ms
- `X-Demo-Mode` - Present if unauthenticated

## Testing the Integration

### Test 1: Demo Request (No API Key)

```bash
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -d '{
    "query": "quantum computing",
    "sources": "wiki"
  }'
```

**Expected Response**:

- Status: `200`
- Header: `X-Demo-Mode: true`
- Header: `X-RateLimit-Limit: 1000` (free tier)
- Includes data + quota info

### Test 2: Generate API Key

```bash
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-test-123",
    "name": "Integration Test Key"
  }'
```

**Expected Response**:

```json
{
  "success": true,
  "id": "key-abc123...",
  "key": "hm_xxxxx...xxxxx",
  "userId": "user-test-123",
  "name": "Integration Test Key",
  "tier": "free",
  "quotaMonthly": 1000,
  "createdAt": "2025-11-25T...",
  "message": "⚠️ Save this key now. You won't see it again!"
}
```

**Save the key**: Copy the `key` value for next tests

### Test 3: Authenticated Request (Free Tier)

```bash
# Replace HM_KEY with actual key from Test 2
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: HM_KEY" \
  -H "X-Tier: free" \
  -d '{
    "query": "artificial intelligence",
    "sources": ["wiki", "arxiv"]
  }'
```

**Expected Response**:

- Status: `200`
- Header: `X-RateLimit-Limit: 1000`
- Header: `X-RateLimit-Used: 1`
- Header: `X-RateLimit-Remaining: 999`
- Data from sources
- No `X-Demo-Mode` header

### Test 4: Check Usage

```bash
curl -X GET "http://localhost:3000/api/v1/usage?action=current&userId=user-test-123&tier=free"
```

**Expected Response**:

```json
{
  "quota": 1000,
  "used": 1,
  "remaining": 999,
  "percentage": 0.1,
  "resetDate": "2025-12-25T00:00:00Z",
  "isExceeded": false
}
```

### Test 5: Invalid API Key

```bash
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: invalid_key_format" \
  -d '{"query": "test", "sources": "wiki"}'
```

**Expected Response**:

- Status: `401`
- Body: `{"success": false, "error": "Invalid API key"}`

### Test 6: Get Usage History

```bash
curl -X GET "http://localhost:3000/api/v1/usage?action=history&userId=user-test-123&limit=10"
```

**Expected Response**:

```json
{
  "userId": "user-test-123",
  "history": [
    {
      "endpoint": "/api/v1/data",
      "method": "POST",
      "source": "wiki,arxiv",
      "responseTime": 245.5,
      "status": 200,
      "timestamp": "2025-11-25T14:30:45.123Z"
    }
  ],
  "count": 1
}
```

### Test 7: Get Usage Analytics

```bash
curl -X GET "http://localhost:3000/api/v1/usage?action=analytics&userId=user-test-123&days=7"
```

**Expected Response**:

```json
{
  "userId": "user-test-123",
  "period": "7 days",
  "daily": [
    {
      "date": "2025-11-25",
      "requests": 1,
      "avgResponseTime": 245.5
    }
  ],
  "total": {
    "requests": 1,
    "avgResponseTime": 245.5
  }
}
```

### Test 8: Pro Tier (Higher Quota)

```bash
# Generate Pro tier key
curl -X POST http://localhost:3000/api/v1/keys \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-pro-123",
    "name": "Pro Key",
    "tier": "pro"
  }'
```

Then use with Pro tier requests:

```bash
curl -X POST http://localhost:3000/api/v1/data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: HM_PROKEY..." \
  -H "X-Tier: pro" \
  -d '{"query": "test", "sources": "wiki"}'
```

**Expected Response**:

- Header: `X-RateLimit-Limit: 10000` (instead of 1000)

## Performance Metrics

| Operation | Expected Time |
|-----------|---------------|
| API Key Generation | < 100ms |
| API Key Validation | < 50ms |
| Quota Check | < 5ms |
| Total Auth Overhead | < 15ms |
| Usage Tracking | < 10ms |

## Architecture

POST /api/v1/data
    ↓
[Request received]
    ↓
verifyAndTrackRequest()
    ├─ Get API key from X-API-Key header
    ├─ If no key: Allow demo mode (1K quota)
    ├─ If key: Validate with APIKeyManager
    │   ├─ Check key format (hm_*)
    │   ├─ Verify bcrypt hash
    │   ├─ Update lastUsed timestamp
    │   └─ Return userId, tier, keyId
    ├─ Check quota with UsageTracker
    │   ├─ Get current usage
    │   ├─ Compare against tier limit
    │   └─ Return quota status
    └─ Return auth result
    ↓
[If valid: Continue]
[If invalid: Return 401 or 429]
    ↓
[Fetch data from managers]
    ↓
trackUsage()
    ├─ Log request details
    ├─ Calculate response time
    ├─ Store in usage history
    └─ Return to caller
    ↓
[Response with quota headers]
...

## Quota Limits by Tier

| Tier | Monthly Quota | Price | Use Case |
|------|---------------|-------|----------|
| Free | 1,000 | $0 | Testing & experimentation |
| Pro | 10,000 | $29/mo | Production applications |
| Enterprise | Unlimited | Custom | Large deployments |

## Security Features

✅ **Bcrypt Hashing**: API keys stored as bcrypt hashes, never in plaintext
✅ **One-Time Display**: Key shown only at creation, never retrievable
✅ **Immediate Revocation**: Revoked keys disabled instantly
✅ **Key Rotation**: Generate new key + optionally revoke old one
✅ **Rate Limiting**: Per-user quota enforcement
✅ **Audit Trail**: All requests tracked with timestamps

## Integration Points

### In `/api/v1/data/route.js`

```javascript
import APIKeyManager from "@/lib/managers/api-key-manager";
import UsageTracker from "@/lib/managers/usage-tracker";

// Before any data processing:
const auth = await verifyAndTrackRequest(req);
if (!auth.valid) {
  return error response; // 401 or 429
}

// After data processing:
await trackUsage(auth.userId, endpoint, responseTime, source);
```

### New Endpoints Ready

- ✅ `POST /api/v1/keys` - Generate keys
- ✅ `DELETE /api/v1/keys/{keyId}` - Revoke keys
- ✅ `GET /api/v1/usage` - View usage
- ✅ `POST /api/v1/usage/track` - Track requests
- ✅ `DELETE /api/v1/usage/reset` - Reset quota (admin)

## Next Steps

1. **Database Migration** (PostgreSQL)
   - Move from in-memory to persistent storage
   - Create `users`, `api_keys`, `usage` tables
   - Add migration script

2. **User Authentication** (JWT)
   - Add `/api/v1/auth/login` endpoint
   - Add `/api/v1/auth/signup` endpoint
   - Bind API keys to authenticated users

3. **Admin Dashboard**
   - View all users & usage
   - Manage tiers & quotas
   - Generate reports

4. **Billing Integration** (Lemonsqueezy)
   - Sync tier changes with payment system
   - Send usage alerts
   - Auto-upgrade on quota threshold

5. **Testing & Validation**
   - Load testing under high quota usage
   - Verify quota reset dates
   - Test key rotation workflow

## Rollback Instructions

If needed to revert integration:

```bash
git diff app/api/v1/data/route.js
git checkout app/api/v1/data/route.js
npm uninstall bcryptjs
npm run build
```

## Status

**Build**: ✅ Passing
**Integration**: ✅ Complete
**Ready for**: Testing & deployment
**Next Phase**: Database migration + user authentication

---

**Created**: November 25, 2025
**Phase**: 4 - Advanced SAAS Features
**Component**: API Key + Usage Tracking Integration
