#!/usr/bin/env bash
# Script para rodar testes com servidor automaticamente
# Uso: bash scripts/test/run-tests.sh [--ui] [--debug]

set -e

PORT=${PORT:-3000}
SERVER_TIMEOUT=30
TEST_TIMEOUT=60
MODE="headless"

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  Playwright E2E Test Runner                           ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Parse arguments
for arg in "$@"; do
  case $arg in
    --ui) MODE="ui" ;;
    --debug) MODE="debug" ;;
  esac
done

# Verifica se node está instalado
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Instale Node.js 16+ primeiro."
  exit 1
fi

# Verifica se dependencies estão instaladas
if [ ! -d "node_modules" ]; then
  echo "📦 Instalando dependências..."
  npm install
fi

# Kill servidor anterior (se houver)
echo "🧹 Limpando servidores anteriores..."
pkill -f "node scripts/dev/dev-server.js" 2>/dev/null || true
sleep 1

# Inicia servidor em background
echo "🚀 Iniciando servidor (port $PORT)..."
npm run dev &
SERVER_PID=$!

# Aguarda servidor estar pronto
echo "⏳ Aguardando servidor estar disponível..."
for i in $(seq 1 $SERVER_TIMEOUT); do
  if curl -s http://localhost:$PORT/ > /dev/null 2>&1; then
    echo "✅ Servidor pronto!"
    break
  fi
  
  if [ $i -eq $SERVER_TIMEOUT ]; then
    echo "❌ Servidor não respondeu em ${SERVER_TIMEOUT}s"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
  fi
  
  echo "   Tentativa $i/$SERVER_TIMEOUT..."
  sleep 1
done

echo ""

# Roda testes
case $MODE in
  ui)
    echo "🎮 Iniciando testes no modo UI..."
    npm run test:ui
    ;;
  debug)
    echo "🐛 Iniciando testes em modo debug..."
    npm run test:debug
    ;;
  *)
    echo "🧪 Executando testes (headless)..."
    npm test
    ;;
esac

TEST_RESULT=$?

# Cleanup
echo ""
echo "🧹 Finalizando servidor..."
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true

echo ""
if [ $TEST_RESULT -eq 0 ]; then
  echo "✅ Todos os testes passaram!"
  exit 0
else
  echo "❌ Alguns testes falharam. Verifique playwright-report/index.html"
  exit 1
fi
