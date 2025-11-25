#!/usr/bin/env powershell

Write-Host "🚀 Starting Harmonic Trinity SAAS System" -ForegroundColor Green
Write-Host ""

# Kill any existing processes
Write-Host "🛑 Cleaning up old processes..."
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

Write-Host "✅ Process cleanup complete" -ForegroundColor Green
Write-Host ""

# Start API server
Write-Host "📡 Starting SAAS API Server (port 5000)..." -ForegroundColor Cyan
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Admin\Desktop\harmonic\api-server'; npm run dev" -WindowStyle Normal

Start-Sleep 3

# Start Next.js app
Write-Host "🎨 Starting Frontend (port 3000)..." -ForegroundColor Magenta
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Admin\Desktop\harmonic'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "=" * 60
Write-Host "✅ HARMONIC TRINITY SAAS SYSTEM STARTED" -ForegroundColor Green
Write-Host "=" * 60
Write-Host ""
Write-Host "🌐 Frontend:  http://localhost:3000/harmonic" -ForegroundColor Cyan
Write-Host "📡 API Server: http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 API Endpoints:" -ForegroundColor Yellow
Write-Host "   POST   /debate      - Run full debate"
Write-Host "   GET    /stats       - Cache statistics"
Write-Host "   GET    /cache       - View cached responses"
Write-Host "   GET    /health      - Server status"
Write-Host ""
Write-Host "💾 Memory Bank: api-server/data/harmonic-memory.db" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Try it now: Go to http://localhost:3000/harmonic" -ForegroundColor Cyan
Write-Host ""
