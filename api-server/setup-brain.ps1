#!/usr/bin/env pwsh

# Brain directory path - use local data directory for testing
$current = Get-Location
$BrainDir = "$current\data\brain"
$SampleDir = "$current\data"

Write-Host "Brain Setup Script" -ForegroundColor Cyan
Write-Host "Using local brain: $BrainDir" -ForegroundColor Yellow

# Create directories
foreach ($subdir in @("apis", "docs", "concepts")) {
    $dir = "$BrainDir\$subdir"
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    Write-Host "Ready: $dir" -ForegroundColor Green
}

# Copy files
$files = @(
    @{ src = "sample-apis.json"; dest = "apis"; name = "apis.json" },
    @{ src = "sample-docs.json"; dest = "docs"; name = "docs.json" },
    @{ src = "sample-concepts.json"; dest = "concepts"; name = "concepts.json" }
)

foreach ($file in $files) {
    $srcPath = "$SampleDir\$($file.src)"
    $destDir = "$BrainDir\$($file.dest)"
    $destPath = "$destDir\$($file.name)"
    
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination $destPath -Force
        Write-Host "Indexed: $($file.dest)/$($file.name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Setup complete! Brain indexer ready for local testing" -ForegroundColor Green
