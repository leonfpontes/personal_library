# Script para rodar testes com servidor automaticamente (Windows)
# Uso: powershell .\scripts\test\run-tests.ps1 [-UI] [-Debug]

param(
    [switch]$UI = $false,
    [switch]$Debug = $false
)

$ErrorActionPreference = "Stop"

$PORT = 3000
$SERVER_TIMEOUT = 30
$MODE = if ($UI) { "ui" } elseif ($Debug) { "debug" } else { "headless" }

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Playwright E2E Test Runner (Windows)                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verifica se node está instalado
try {
    $null = node --version
}
catch {
    Write-Host "❌ Node.js não encontrado. Instale Node.js 16+ primeiro." -ForegroundColor Red
    exit 1
}

# Verifica se dependencies estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
}

# Kill servidor anterior (se houver)
Write-Host "🧹 Limpando servidores anteriores..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -match "dev-server" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Inicia servidor em background
Write-Host "🚀 Iniciando servidor (port $PORT)..." -ForegroundColor Yellow
$ServerProcess = Start-Process -FilePath "node" -ArgumentList "scripts/dev/dev-server.js" -PassThru -WindowStyle Hidden

# Aguarda servidor estar pronto
Write-Host "⏳ Aguardando servidor estar disponível..." -ForegroundColor Yellow
$ready = $false
for ($i = 1; $i -le $SERVER_TIMEOUT; $i++) {
    try {
        $null = Invoke-WebRequest -Uri "http://localhost:$PORT/" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Servidor pronto!" -ForegroundColor Green
        $ready = $true
        break
    }
    catch {
        if ($i -eq $SERVER_TIMEOUT) {
            Write-Host "❌ Servidor não respondeu em ${SERVER_TIMEOUT}s" -ForegroundColor Red
            Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
            exit 1
        }
        Write-Host "   Tentativa $i/$SERVER_TIMEOUT..." -ForegroundColor Gray
        Start-Sleep -Seconds 1
    }
}

Write-Host ""

# Roda testes
switch ($MODE) {
    "ui" {
        Write-Host "🎮 Iniciando testes no modo UI..." -ForegroundColor Cyan
        npm run test:ui
    }
    "debug" {
        Write-Host "🐛 Iniciando testes em modo debug..." -ForegroundColor Cyan
        npm run test:debug
    }
    default {
        Write-Host "🧪 Executando testes (headless)..." -ForegroundColor Cyan
        npm test
    }
}

$testResult = $LASTEXITCODE

# Cleanup
Write-Host ""
Write-Host "🧹 Finalizando servidor..." -ForegroundColor Yellow
try {
    Stop-Process -Id $ServerProcess.Id -Force -ErrorAction SilentlyContinue
    Wait-Process -Id $ServerProcess.Id -Timeout 5 -ErrorAction SilentlyContinue
}
catch {
    # Process já foi finalizado
}

Write-Host ""
if ($testResult -eq 0) {
    Write-Host "✅ Todos os testes passaram!" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "❌ Alguns testes falharam. Verifique playwright-report/index.html" -ForegroundColor Red
    exit 1
}
