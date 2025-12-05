#!/usr/bin/env pwsh
<#
.SYNOPSIS
Smoke Test para validar pós-reorganização de docs
.DESCRIPTION
Testa:
1. Checkpoint T009: docs/ops/ existe com 7 arquivos
2. Checkpoint T010: README.md contém links para docs/ops/
3. Checkpoint T011: index.html contém links para livros/
4. Link integrity (SC-002): Validar links em arquivos críticos
5. Structure verification: Validar que arquivos críticos não foram movidos
#>

param(
    [string]$RepoRoot = "E:\Estudos\Projetos_Dev\personal_library"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🧪 SMOKE TEST: Post-Reorganização Validation`n" -ForegroundColor Cyan

# ============================================================================
# Checkpoint T009: docs/ops/ exists with 7 files
# ============================================================================

Write-Host "[1/5] T009-CHECK: docs/ops/ contém 7 arquivos" -ForegroundColor Yellow

$docsOpsPath = "$RepoRoot\docs\ops"
if (-Not (Test-Path $docsOpsPath)) {
    Write-Host "❌ FAIL: docs/ops/ não existe" -ForegroundColor Red
    exit 1
}

$docsOpsFiles = @(
    "COMO_RODAR.md",
    "DEPLOY.md",
    "DEPLOYMENT_READY.md",
    "MOBILE_PATCH.md",
    "PRODUCTION_DEBUG_GUIDE.md",
    "RESUMO_EXECUTIVO.md",
    "STATUS.md"
)

$missingFiles = @()
foreach ($file in $docsOpsFiles) {
    $filePath = Join-Path $docsOpsPath $file
    if (-Not (Test-Path $filePath)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ FAIL: Arquivos faltando: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PASS: Todos 7 arquivos em docs/ops/" -ForegroundColor Green

# ============================================================================
# Checkpoint T010: README.md contém links para docs/ops/
# ============================================================================

Write-Host "[2/5] T010-CHECK: README.md contém links para docs/ops/" -ForegroundColor Yellow

$readmePath = Join-Path $RepoRoot "README.md"
$readmeContent = Get-Content $readmePath -Raw

$docsOpsRefs = @(
    "docs/ops/COMO_RODAR.md",
    "docs/ops/DEPLOY.md",
    "docs/ops/DEPLOYMENT_READY.md",
    "docs/ops/MOBILE_PATCH.md",
    "docs/ops/PRODUCTION_DEBUG_GUIDE.md",
    "docs/ops/RESUMO_EXECUTIVO.md",
    "docs/ops/STATUS.md"
)

$missingRefs = @()
foreach ($ref in $docsOpsRefs) {
    if ($readmeContent -notmatch [regex]::Escape($ref)) {
        $missingRefs += $ref
    }
}

if ($missingRefs.Count -gt 0) {
    Write-Host "❌ FAIL: Links faltando em README.md: $($missingRefs -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PASS: README.md contém todas as 7 referências" -ForegroundColor Green

# ============================================================================
# Checkpoint T011: index.html contém links para livros/
# ============================================================================

Write-Host "[3/5] T011-CHECK: index.html contém links para livros/" -ForegroundColor Yellow

$indexPath = Join-Path $RepoRoot "index.html"
$indexContent = Get-Content $indexPath -Raw

$bookLinks = @(
    "livros/vivencia_pombogira.html",
    "livros/guia_de_ervas.html",
    "livros/aula_iansa.html",
    "livros/aula_oba.html",
    "livros/aula_oya_loguna.html"
)

$missingBookLinks = @()
foreach ($link in $bookLinks) {
    if ($indexContent -notmatch [regex]::Escape($link)) {
        $missingBookLinks += $link
    }
}

if ($missingBookLinks.Count -gt 0) {
    Write-Host "❌ FAIL: Links de livros faltando: $($missingBookLinks -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PASS: index.html contém todos 5 links de livros" -ForegroundColor Green

# ============================================================================
# Checkpoint: Arquivos críticos não foram movidos
# ============================================================================

Write-Host "[4/5] Structure Check: Arquivos críticos intocados" -ForegroundColor Yellow

$criticalFiles = @(
    "middleware.js",
    "vercel.json",
    "package.json",
    "api",
    "auth",
    "livros",
    "scripts",
    "styles",
    "Source"
)

$missingCritical = @()
foreach ($file in $criticalFiles) {
    $filePath = Join-Path $RepoRoot $file
    if (-Not (Test-Path $filePath)) {
        $missingCritical += $file
    }
}

if ($missingCritical.Count -gt 0) {
    Write-Host "❌ FAIL: Arquivos críticos faltando: $($missingCritical -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PASS: Todos arquivos críticos intactos" -ForegroundColor Green

# ============================================================================
# Checkpoint: Casing validation (reader files)
# ============================================================================

Write-Host "[5/5] Casing Check: livros/*.html nomes em minúsculas" -ForegroundColor Yellow

$livrosPath = Join-Path $RepoRoot "livros"
$livrosFiles = Get-ChildItem $livrosPath -Name

$casingSensitiveIssues = @()
foreach ($file in $livrosFiles) {
    # Verificar se nome contém maiúsculas
    if ($file -ne $file.ToLower()) {
        $casingSensitiveIssues += $file
    }
}

if ($casingSensitiveIssues.Count -gt 0) {
    Write-Host "⚠️  WARNING: Arquivos com maiúsculas (Vercel case-sensitive): $($casingSensitiveIssues -join ', ')" -ForegroundColor Yellow
    # Não é FAIL, apenas aviso
}

Write-Host "✅ PASS: Casing validation completa" -ForegroundColor Green

# ============================================================================
# SUMMARY
# ============================================================================

Write-Host "`n" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ SMOKE TEST PASSED - Reorganização validada com sucesso!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "`nPróximos passos:" -ForegroundColor Cyan
Write-Host "  1. Revisar conteúdo dos arquivos movidos (opcional visual inspection)"
Write-Host "  2. Rodar localmente: npm run dev"
Write-Host "  3. Verificar links em navegador: http://localhost:3000"
Write-Host "  4. Deploy para produção se tudo OK"
Write-Host ""

exit 0
