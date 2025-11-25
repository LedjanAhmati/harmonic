# 🧪 LIVE ENDPOINT TEST - STEP 3

**Vercel Domain**: https://harmonic-ledjanahmati.vercel.app  
**Status**: Ready to test ✅

---

## Test Sequence (Run in PowerShell)

### Test 1: Health Check
```powershell
(Invoke-WebRequest -Uri "https://harmonic-ledjanahmati.vercel.app/health" -UseBasicParsing).Content
```
**Expected**: `{"status":"ok","time":...}`

---

### Test 2: Zürich Reasoning
```powershell
$body = @{prompt="Cfare do te bejme?"} | ConvertTo-Json
(Invoke-WebRequest -Uri "https://harmonic-ledjanahmati.vercel.app/v1/zurich" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object ok, prompt, stages
```
**Expected**: Deterministic reasoning with 4 stages

---

### Test 3: Trinity Debate
```powershell
$body = @{prompt="Is AI beneficial?"} | ConvertTo-Json
(Invoke-WebRequest -Uri "https://harmonic-ledjanahmati.vercel.app/v1/debate" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing).Content | ConvertFrom-Json | Select-Object ok, prompt, personas
```
**Expected**: 5 persona responses (alba, albi, jona, blerina, asi)

---

### Test 4: API Info
```powershell
(Invoke-WebRequest -Uri "https://harmonic-ledjanahmati.vercel.app/v1/info" -UseBasicParsing).Content
```
**Expected**: List of all endpoints

---

## ✅ All Tests Pass?

If all 4 tests return 200 + expected data → **LIVE AND WORKING** 🎉

---

## Postman Alternative

1. Open Postman
2. Import: `Harmonic_Reasoning_API.postman_collection.json`
3. Change base URL: `https://harmonic-ledjanahmati.vercel.app`
4. Run all requests in order

---

## If Tests Fail

1. Check Vercel build status: https://vercel.com/ledjan-ahmatis-projects-111461ad/harmonic
2. Check logs for errors
3. Local server still works: http://localhost:5000 ✓

---

**Status**: Ready for Product Hunt once tests pass! 🚀
