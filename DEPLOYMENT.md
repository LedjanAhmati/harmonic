# Production Deployment Guide

Complete guide to deploy Harmonic to production on Vercel with Supabase and LemonSqueezy.

---

## Pre-Deployment Checklist

### ✅ Development Environment

- [ ] `npm run build` succeeds with zero errors
- [ ] `npm run dev` runs without crashes
- [ ] All API endpoints respond correctly
- [ ] Supabase connection works in development
- [ ] `.env.local` file exists (not committed to git)

### ✅ GitHub Setup

- [ ] Repository created and pushed to GitHub
- [ ] `.gitignore` includes `.env.local` and `.env*.local`
- [ ] `package-lock.json` committed to repo
- [ ] No secrets in any committed files

---

## Step 1: Prepare Supabase for Production

### 1.1 Create Production Supabase Project

1. Go to **supabase.com**
2. Click **New Project**
3. Name: `harmonic-prod`
4. Select region closest to your users
5. Create strong database password
6. Wait for provisioning (2-5 min)

### 1.2 Create Database Schema

1. In Supabase dashboard → **SQL Editor**
2. Create new query and run:

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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all reads
CREATE POLICY "Allow reads for all" ON users FOR SELECT USING (true);
CREATE POLICY "Allow reads for all" ON subscriptions FOR SELECT USING (true);
CREATE POLICY "Allow reads for all" ON results FOR SELECT USING (true);

-- RLS Policy: Service role can do everything
CREATE POLICY "Service role can insert" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update" ON users FOR UPDATE USING (true);
CREATE POLICY "Service role can insert" ON subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update" ON subscriptions FOR UPDATE USING (true);
CREATE POLICY "Service role can all results" ON results FOR ALL USING (true);
```

### 1.3 Get Supabase Credentials

1. Go to **Settings → API**
2. Copy and save:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role secret` key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2: Setup LemonSqueezy for Production

### 2.1 Create LemonSqueezy Account

1. Go to **lemonsqueezy.com**
2. Sign up and verify email
3. Create store (e.g., "Harmonic")

### 2.2 Create Product

1. In LemonSqueezy → **Products**
2. Create new: "Harmonic Premium"
3. Set price: €29.99 (or your preferred price)
4. Set recurring: Monthly subscription
5. Save product ID

### 2.3 Get LemonSqueezy API Keys

1. Go to **Settings → API**
2. Copy:
   - API token → `LEMONSQUEEZY_API_KEY`
   - Store ID → `LEMONSQUEEZY_STORE_ID`
   - Product ID → `LEMONSQUEEZY_PRODUCT_ID`

### 2.4 Setup Webhook

1. In LemonSqueezy → **Webhooks**
2. Click **Add webhook**
3. URL: `https://harmonic.yourdomain.com/api/premium/webhook`
   - (Replace with your production domain)
4. Events: Select all order and subscription events
5. Copy webhook secret → `LEMONSQUEEZY_WEBHOOK_SECRET`

---

## Step 3: Deploy to Vercel

### 3.1 Connect GitHub Repository

1. Go to **vercel.com**
2. Click **Add New → Project**
3. Import your GitHub repository
4. Select `harmonic` repo

### 3.2 Configure Environment Variables

In Vercel project settings → **Environment Variables**

Add all variables from `.env.local`:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGc...
LEMONSQUEEZY_API_KEY = your_api_key
LEMONSQUEEZY_STORE_ID = your_store_id
LEMONSQUEEZY_PRODUCT_ID = your_product_id
LEMONSQUEEZY_WEBHOOK_SECRET = your_webhook_secret
NEXT_PUBLIC_APP_URL = https://harmonic.yourdomain.com
```

### 3.3 Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 min)
3. Vercel will provide production URL
4. Test that it's working: `https://your-vercel-url.com/api/users/me?email=test@test.com`

### 3.4 Configure Custom Domain (Optional)

1. In Vercel → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Wait for SSL certificate (usually instant)

---

## Step 4: Post-Deployment Setup

### 4.1 Update LemonSqueezy Webhook URL

1. In LemonSqueezy → **Webhooks**
2. Edit webhook created in Step 2.4
3. Update URL to: `https://your-production-url.com/api/premium/webhook`
4. Save

### 4.2 Test Payment Flow

1. Visit: `https://your-production-url.com`
2. Navigate to premium page
3. Click "Upgrade to Premium"
4. Use test card: `4242 4242 4242 4242`
5. Fill in test details
6. Complete purchase
7. Verify in Supabase:
   - New row in `users` table
   - `isPremium = true`
   - New row in `subscriptions` table

### 4.3 Monitor

- Check Vercel logs: **Deployments → Logs**
- Check Supabase: **Database → Users table**
- Check LemonSqueezy: **Orders** dashboard

---

## Troubleshooting

### Build Fails on Vercel

**Error**: `LEMONSQUEEZY_API_KEY is required`

**Fix**: Environment variables not set. Re-add them in Vercel Settings.

### Webhook Not Firing

**Error**: Payment completes but database not updated

**Cause**: Webhook URL incorrect or secret mismatch

**Fix**:
1. Verify webhook URL in LemonSqueezy matches production domain
2. Verify `LEMONSQUEEZY_WEBHOOK_SECRET` matches LemonSqueezy dashboard
3. Check Vercel logs for errors

### Supabase Connection Error

**Error**: `Error: connect ECONNREFUSED`

**Cause**: `SUPABASE_URL` or keys incorrect

**Fix**:
1. Verify credentials in LemonSqueezy Settings → API
2. Test connection: `curl https://your-supabase-url/rest/v1/`
3. Check Supabase is not paused (free tier suspends after 7 days inactivity)

### Database Query Failed

**Error**: `Permission denied` in API response

**Cause**: RLS policies not configured correctly

**Fix**:
1. Go to Supabase → **Auth → Policies**
2. Verify service role has INSERT/UPDATE permissions
3. Re-run RLS SQL from Step 1.2

---

## Monitoring & Maintenance

### Daily Checks

- [ ] Vercel deployment status (green)
- [ ] Supabase connection working
- [ ] No errors in Vercel logs

### Weekly Checks

- [ ] Review new users in Supabase
- [ ] Check LemonSqueezy payment stats
- [ ] Monitor API response times

### Monthly Checks

- [ ] Review subscription renewal rate
- [ ] Check churn rate
- [ ] Update security certificates (auto-renewed)

---

## Scaling Considerations

### When You Reach 100 Users

- Supabase free tier is sufficient
- Monitor response times in Vercel Analytics
- Consider Vercel Pro for priority support

### When You Reach 1000 Users

- Upgrade Supabase to Pro tier
- Add caching layer (Redis via Upstash)
- Monitor database query performance

### When You Reach 10,000 Users

- Dedicated Supabase instance recommended
- Implement database read replicas
- Consider CDN for static assets

---

## Backup & Recovery

### Automatic Backups

- Supabase: Daily automatic backups (30 day retention)
- Vercel: Automatically recovers from failed deployments
- GitHub: Source code backed up in repository

### Manual Backup

Every month, export Supabase data:

1. Go to Supabase → **Database → Tables**
2. Right-click each table → **Export as CSV**
3. Store CSV files in secure location (Google Drive, etc.)

### Restore from Backup

1. Get backup CSV file
2. In Supabase → **SQL Editor**
3. Run: `DELETE FROM table_name;` (clear table)
4. Import CSV data back

---

## Updating Production

### Deploy New Version

1. Commit changes to GitHub
2. Push to `main` branch
3. Vercel auto-deploys within 1 minute
4. Test on production URL

### Rollback if Issues

1. In Vercel → **Deployments**
2. Find previous working deployment
3. Click "..." → **Promote to Production**
4. Previous version is live within 1 minute

### Database Migrations

For schema changes:

1. Test locally with `npm run dev`
2. Create SQL migration file in `migrations/`
3. Run migration in Supabase SQL Editor
4. Deploy code to Vercel
5. Verify in production

---

## Security Checklist

- [ ] API keys stored in Vercel environment variables (never in code)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Webhook signature verification enabled
- [ ] RLS policies restrict unauthorized access
- [ ] Rate limiting considered for production load
- [ ] Error messages don't expose sensitive info
- [ ] Database backups configured

---

## Cost Estimation (Monthly)

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Up to 100GB bandwidth | $0-20 |
| Supabase | 500MB storage, 5GB bandwidth | $0-25 |
| LemonSqueezy | 5% payment fee | ~5% of revenue |
| Custom Domain (Optional) | - | ~$12/year |
| **Total** | - | **$0-45** |

*Scales gracefully as you grow.*

---

## Getting Help

- **Vercel Issues**: https://vercel.com/support
- **Supabase Issues**: https://supabase.com/docs
- **LemonSqueezy Issues**: https://lemonsqueezy.com/help
- **Code Issues**: Check `/ARCHITECTURE.md` and `/API_REFERENCE.md`

---

## Next Steps After Deployment

1. ✅ Setup analytics (Google Analytics 4)
2. ✅ Setup error monitoring (Sentry)
3. ✅ Setup email notifications (SendGrid)
4. ✅ Create user onboarding flow
5. ✅ Add customer support system
6. ✅ Setup CI/CD pipeline
7. ✅ Implement feature flags

**Congratulations! Your SaaS is now live in production! 🎉**
