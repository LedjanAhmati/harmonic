#!/usr/bin/env pwsh
# Harmonic Trinity - Complete System Startup Script
# Launches ALL processes in separate PowerShell windows

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         HARMONIC TRINITY - COMPLETE STARTUP            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Configuration
$PROJECT_ROOT = "c:\Users\Admin\Desktop\harmonic"
$API_SERVER = "$PROJECT_ROOT\api-server"

# Kill existing processes
Write-Host "🔴 Stopping existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# 1. Start API Server (simple-server.js)
Write-Host "🚀 [1/3] Starting API Server (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$API_SERVER'; Write-Host '🎼 Harmonic API Server' -ForegroundColor Cyan; node simple-server.js" -WindowStyle Normal
Start-Sleep 2

# 2. Start Frontend Server (Next.js on 3000)
Write-Host "🚀 [2/3] Starting Frontend Server (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT'; Write-Host '🌐 Harmonic Frontend' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal
Start-Sleep 3

# 3. Start Documentation/Info Server (optional monitoring)
Write-Host "🚀 [3/3] Opening System Overview..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT'; Write-Host '📋 System Information' -ForegroundColor Cyan; Write-Host ''; Get-Content SYSTEM_OVERVIEW.txt | Select-Object -First 50; Write-Host ''; Read-Host 'Press Enter to continue'" -WindowStyle Normal
Start-Sleep 1

# Display complete system status
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "                 🎼 SYSTEM ONLINE 🎼" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 FRONTEND SERVERS:" -ForegroundColor Magenta
Write-Host "   ✓ http://localhost:3000              (Main Frontend)"
Write-Host "   ✓ http://localhost:3000/harmonic     (Trinity Interface)"
Write-Host "   ✓ http://localhost:3000/chat         (Chat)"
Write-Host "   ✓ http://localhost:3000/lab/zurich   (Zürich Lab)"
Write-Host "   ✓ http://localhost:3000/asi          (ASI Fusion)"
Write-Host ""

Write-Host "🔌 API SERVERS:" -ForegroundColor Magenta
Write-Host "   ✓ http://localhost:5000/health       (Health Check)"
Write-Host "   ✓ http://localhost:5000/v1/info      (API Info)"
Write-Host "   ✓ http://localhost:5000/v1/zurich    (Zürich Reasoning POST)"
Write-Host "   ✓ http://localhost:5000/v1/debate    (5-Persona Debate POST)"
Write-Host ""

Write-Host "🧠 TRINITY PERSONAS:" -ForegroundColor Cyan
Write-Host "   • Alba      (Optimistic)"
Write-Host "   • Albi      (Pragmatic)"
Write-Host "   • Jona      (Skeptical)"
Write-Host "   • Blerina   (Analytical)"
Write-Host "   • ASI       (Meta-Synthesis)"
Write-Host ""

Write-Host "📊 EXAMPLE API CALLS:" -ForegroundColor Yellow
Write-Host "   Health:  curl http://localhost:5000/health"
Write-Host "   Zurich:  curl -X POST http://localhost:5000/v1/zurich -H \"Content-Type: application/json\" -d '{\"prompt\":\"What is AI?\"}'  "
Write-Host "   Debate:  curl -X POST http://localhost:5000/v1/debate -H \"Content-Type: application/json\" -d '{\"prompt\":\"Should AI be regulated?\"}'  "
Write-Host ""

Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   ✅ All services launched in separate windows" -ForegroundColor Green
Write-Host "   📍 Check the 3 PowerShell windows above" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
