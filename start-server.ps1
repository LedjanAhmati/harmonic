# Start Harmonic API Server in separate process
# This prevents the server from crashing when we send commands

# Kill any existing Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 2

# Start the simple server in a new PowerShell window (detached)
$serverPath = "C:\Users\Admin\Desktop\harmonic\api-server\simple-server.js"

Write-Host "🚀 Starting Harmonic API Server..." -ForegroundColor Green
Write-Host "📍 Location: $serverPath" -ForegroundColor Cyan
Write-Host "🔗 URL: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""

# Start in new PowerShell process (doesn't block)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\Admin\Desktop\harmonic\api-server'; node simple-server.js" -WindowStyle Normal

# Give it 2 seconds to start
Start-Sleep 2

# Verify it's running
$process = Get-Process node -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "✅ Server running! PID: $($process.Id)" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Available Endpoints:" -ForegroundColor Yellow
    Write-Host "  GET  /health" -ForegroundColor White
    Write-Host "  POST /v1/zurich   - Deterministic reasoning" -ForegroundColor White
    Write-Host "  POST /v1/debate   - Multi-persona debate" -ForegroundColor White
    Write-Host "  GET  /v1/info     - API information" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Test with:" -ForegroundColor Yellow
    Write-Host '  Invoke-WebRequest -Uri "http://localhost:5000/health"' -ForegroundColor Gray
} else {
    Write-Host "❌ Failed to start server" -ForegroundColor Red
}
