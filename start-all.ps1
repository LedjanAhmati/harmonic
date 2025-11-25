#!/usr/bin/env pwsh
# Harmonic Trinity - Complete System Startup Script
# Launches each process in external PowerShell window

Write-Host ""
Write-Host "=== HARMONIC TRINITY STARTUP ===" -ForegroundColor Green
Write-Host ""

# Configuration
$PROJECT_ROOT = "c:\Users\Admin\Desktop\harmonic"
$API_SERVER = "$PROJECT_ROOT\api-server"

# Kill existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process npm -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start API Server in external window
Write-Host "Starting API Server (Port 5000) in external window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$API_SERVER'; node simple-server.js" -WindowStyle Normal
Start-Sleep 2

# Start Frontend in external window
Write-Host "Starting Frontend Server (Port 3000) in external window..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PROJECT_ROOT'; npm run dev" -WindowStyle Normal
Start-Sleep 3

# Display status
Write-Host ""
Write-Host "=== SYSTEM STATUS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Frontend:        http://localhost:3000" -ForegroundColor Magenta
Write-Host "API Server:      http://localhost:5000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Pages:" -ForegroundColor Yellow
Write-Host "  Trinity:     http://localhost:3000/harmonic" -ForegroundColor Cyan
Write-Host "  Zurich:      http://localhost:3000/lab/zurich" -ForegroundColor Cyan
Write-Host "  Dashboard:   http://localhost:3000/lab/api-dashboard" -ForegroundColor Cyan
Write-Host ""
Write-Host "Endpoints:" -ForegroundColor Yellow
Write-Host "  GET  /health" -ForegroundColor Cyan
Write-Host "  POST /v1/zurich" -ForegroundColor Cyan
Write-Host "  POST /v1/debate" -ForegroundColor Cyan
Write-Host ""
Write-Host "All systems launching!" -ForegroundColor Green
Write-Host ""
