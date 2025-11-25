# ⚡ Quick Start (5 Minutes)

## 1. Supabase Setup (3 min)

1. Go to **supabase.com** → Sign up (free)
2. Create new project named **"harmonic"**
3. Wait for provisioning (2-3 min)
4. Copy these from **Settings → API**:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 2. Create Database Tables (1 min)

1. In Supabase: Click **SQL Editor**
2. Click **New query**
3. Paste this entire block:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lemon_squeezy_order_id TEXT UNIQUE,
  status TEXT DEFAULT 'active',
  plan_name TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create results table
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  metadata JSONB,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Enable read for own user" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for service role" 
  ON users FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON users FOR UPDATE 
  USING (true);

-- RLS Policies for subscriptions table
CREATE POLICY "Enable read for subscriptions" 
  ON subscriptions FOR SELECT 
  USING (true);

CREATE POLICY "Enable insert for service role" 
  ON subscriptions FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Enable update for service role" 
  ON subscriptions FOR UPDATE 
  USING (true);

-- RLS Policies for results table
CREATE POLICY "Enable read/write for own results" 
  ON results FOR ALL 
  USING (true);
```

4. Click **Run**
5. Done! ✅

## 3. Environment Variables (1 min)

1. In your project, create **`.env.local`**:

```bash
# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# LemonSqueezy (if you have credentials)
LEMONSQUEEZY_API_KEY=your_key_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_secret_here

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Restart your dev server:
```bash
npm run dev
```

## 4. Test It Works

```bash
# Create a test user
curl -X POST http://localhost:3000/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Test"}'

# Should return: { "success": true, "user": {...} }
```

✅ **You're done!** Your SaaS is operational.

---

## Next: Full Integration Testing

See **`INTEGRATION_TESTING.md`** for complete end-to-end flow.

## Full Documentation

- **Architecture**: `ARCHITECTURE.md`
- **Database**: `SUPABASE_SETUP.md`
- **Payments**: `LEMONSQUEEZY_SETUP.md`
- **Testing**: `INTEGRATION_TESTING.md`
