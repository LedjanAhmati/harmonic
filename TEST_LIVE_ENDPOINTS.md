# 🧪 LIVE ENDPOINT TEST SCRIPT

**Vercel Domain**: https: //harmonic-ledjanahmati.vercel.app

---

## **TEST 1: Health Check**

```bash
curl https://harmonic-ledjanahmati.vercel.app/health
...
**Expected**: `{"status":"ok"}`

---

## **TEST 2: Zürich Reasoning**
```bash
curl -X POST https://harmonic-ledjanahmati.vercel.app/api/v1/zurich \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Cfare do te bejme?"}'
...
**Expected**: Full reasoning with stages (input → analysis → synthesis → output)

---

## **TEST 3: Trinity Debate**
```bash
curl -X POST https://harmonic-ledjanahmati.vercel.app/api/v1/debate \
  -H "Content-Type: application/json" \
  -d '{"topic":"Is AI good for society?"}'
...
**Expected**: 5 persona responses (alba, albi, jona, blerina, asi)

---

## **TEST 4: Auth Signup**
```bash
curl -X POST https://harmonic-ledjanahmati.vercel.app/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"TestPass123"}'
...
**Expected**: `{"token":"...", "userId":"...", "message":"User created"}`

---

## **TEST 5: Auth Login**
```bash
curl -X POST https://harmonic-ledjanahmati.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@test.com","password":"TestPass123"}'
...
**Expected**: `{"token":"...", "message":"Login successful"}`

---

## **TEST 6: Get User Info** (using token from signup/login)
```bash
curl https://harmonic-ledjanahmati.vercel.app/api/v1/user/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
...
**Expected**: `{"userId":"...", "email":"demo@test.com", "createdAt":"..."}`

---

## **TEST 7: API Info**
```bash
curl https://harmonic-ledjanahmati.vercel.app/api/v1/info
...
**Expected**: List of all 10 available endpoints

---

## **All Tests Pass?**
✅ If all return 200 status with expected data → **LIVE AND WORKING** 🎉

---

## **Using Postman Instead**

1. Open Postman
2. Import: `Harmonic_Reasoning_API.postman_collection.json`
3. Change base URL to: `https://harmonic-ledjanahmati.vercel.app`
4. Run requests in order:
   - Test 1: Health Check
   - Test 2-3: Reasoning endpoints
   - Test 4-5: Auth (signup then login)
   - Test 6: User info (paste token)
   - Test 7: API info

---

## **Monitoring Live Deployment**

- **Vercel Dashboard**: https://vercel.com/ledjan-ahmatis-projects-111461ad/harmonic
- **Deployment Logs**: Check status and build output
- **Errors**: Use Vercel's error logs if tests fail

---

**Estimate Time**: 2 minutes for deployment, 2 minutes for testing = 4 min total 🚀
