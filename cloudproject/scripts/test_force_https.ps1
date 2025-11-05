# Test script for FORCE_HTTPS redirect behavior
# Usage: Open PowerShell in repo root and run:
#   .\scripts\test_force_https.ps1

param(
    [int]$WaitSeconds = 30
)

function Start-DevServer([bool]$force) {
    if ($force) {
        Write-Host "Starting dev server with FORCE_HTTPS=true"
        $args = '/c', 'set FORCE_HTTPS=true&& npm.cmd run dev'
    } else {
        Write-Host "Starting dev server without FORCE_HTTPS"
        $args = '/c', 'npm.cmd run dev'
    }

    $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList $args -WindowStyle Hidden -PassThru
    return $proc
}

function Wait-For-Port([int]$timeoutSeconds) {
    for ($i=0; $i -lt $timeoutSeconds; $i++) {
        $lines = netstat -ano | Select-String -Pattern ":3000|:3001"
        if ($lines) {
            if ($lines -match ':3000') { return 3000 }
            if ($lines -match ':3001') { return 3001 }
        }
        Start-Sleep -Seconds 1
    }
    return $null
}

function Test-Redirect([int]$port) {
    Write-Host "Testing http://localhost:$port ..."
    try {
        $resp = & curl.exe -vI "http://localhost:$port" 2>&1
    } catch {
        Write-Host "curl failed: $_"
        return
    }
    $statusLine = $resp | Select-String -Pattern "^< HTTP/"
    $locationLine = $resp | Select-String -Pattern "location:" -CaseSensitive:$false
    Write-Host $statusLine
    Write-Host $locationLine
}

# --- Run tests ---

# 1) With FORCE_HTTPS=true
$proc1 = Start-DevServer $true
$port1 = Wait-For-Port -timeoutSeconds $WaitSeconds
if (-not $port1) {
    Write-Host "Server did not open expected ports within timeout. Killing process..."
    if ($proc1) { Stop-Process -Id $proc1.Id -Force }
    exit 1
}
Test-Redirect -port $port1

# Kill first server
if ($proc1) { Stop-Process -Id $proc1.Id -Force }
Start-Sleep -Seconds 2

# 2) Without FORCE_HTTPS
$proc2 = Start-DevServer $false
$port2 = Wait-For-Port -timeoutSeconds $WaitSeconds
if (-not $port2) {
    Write-Host "Server did not open expected ports within timeout. Killing process..."
    if ($proc2) { Stop-Process -Id $proc2.Id -Force }
    exit 1
}
Test-Redirect -port $port2

if ($proc2) { Stop-Process -Id $proc2.Id -Force }

Write-Host "Tests complete."
