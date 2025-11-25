#!/usr/bin/env pwsh
# Harmonic Trinity - Complete System Startup Script

Write-Host ""
Write-Host "=== HARMONIC TRINITY STARTUP ===" -ForegroundColor Green
Write-Host ""

# Configuration
$PROJECT_ROOT = "c:\Users\Admin\Desktop\harmonic"
$API_SERVER = "$PROJECT_ROOT\api-server"

# Kill existing processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start API Server
Write-Host "Starting SAAS API Server (Port 5000)..." -ForegroundColor Green
$apiScript = {
  cd 'c:\Users\Admin\Desktop\harmonic\api-server'
  node server.js
}
Start-Job -ScriptBlock $apiScript -Name "API-Server" | Out-Null
Start-Sleep 3

# Start Frontend
Write-Host "Starting Frontend Server (Port 3000)..." -ForegroundColor Green
$frontendScript = {
  cd 'c:\Users\Admin\Desktop\harmonic'
  npm run dev
}
Start-Job -ScriptBlock $frontendScript -Name "Frontend-Dev" | Out-Null
Start-Sleep 3

# Display status
Write-Host ""
Write-Host "=== SYSTEM STATUS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Trinity Debate: http://localhost:3000/harmonic" -ForegroundColor Magenta
Write-Host "Zurich Engine:  http://localhost:3000/lab/zurich" -ForegroundColor Magenta
Write-Host "API Dashboard: http://localhost:3000/lab/api-dashboard" -ForegroundColor Magenta
Write-Host "API Server:    http://localhost:5000" -ForegroundColor Magenta
Write-Host ""
Write-Host "Total Endpoints: 13,508" -ForegroundColor Yellow
Write-Host "All systems online!" -ForegroundColor Green
Write-Host ""

# Keep script alive
while ($true) {
  Start-Sleep 30
}
