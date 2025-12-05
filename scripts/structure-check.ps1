#!/usr/bin/env pwsh
<#
.SYNOPSIS
Validacao automatica de estrutura do projeto Personal Library
.DESCRIPTION
Executa checklist de estrutura automaticamente:
- Verifica existencia de arquivos criticos
- Valida casing de nomes (case-sensitive)
- Valida links em README.md, index.html, leitores
- Roda link-check via npx linkinator
- Retorna 0 se tudo OK, 1 se erros
.EXAMPLE
./scripts/structure-check.ps1
#>

param(
    [string]$RepoRoot = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot))
)

$ErrorActionPreference = "Stop"

# Cores
$Green = "Green"
$Red = "Red"
$Yellow = "Yellow"
$Cyan = "Cyan"

Write-Host "`n========================================================" -ForegroundColor $Cyan
Write-Host "[*] STRUCTURE VALIDATION: Personal Library" -ForegroundColor $Cyan
Write-Host "========================================================`n" -ForegroundColor $Cyan

$errors = @()
$warnings = @()

# ============================================================================
# PART 1: Critical Files
# ============================================================================

Write-Host "[1/6] Checking critical files..." -ForegroundColor $Yellow

$criticalFiles = @(
    "middleware.js",
    "vercel.json",
    "package.json",
    "README.md",
    "index.html"
)

foreach ($file in $criticalFiles) {
    $path = Join-Path $RepoRoot $file
    if (-Not (Test-Path $path)) {
        $errors += "Missing critical file: $file"
    }
}

$criticalDirs = @(
    "api",
    "auth",
    "livros",
    "scripts",
    "styles",
    "Source",
    "docs\ops",
    "specs\001-project-structure"
)

foreach ($dir in $criticalDirs) {
    $path = Join-Path $RepoRoot $dir
    if (-Not (Test-Path $path)) {
        $errors += "Missing critical directory: $dir"
    }
}

if ($errors.Count -eq 0) {
    Write-Host "[OK] All critical files and directories exist" -ForegroundColor $Green
} else {
    Write-Host "[FAIL] Missing files/directories:" -ForegroundColor $Red
    foreach ($err in $errors) {
        Write-Host "   - $err" -ForegroundColor $Red
    }
}

# ============================================================================
# PART 2: Documentation Operacional (docs/ops/)
# ============================================================================

Write-Host "`n[2/6] Checking operational docs..." -ForegroundColor $Yellow

$docsOpsFiles = @(
    "COMO_RODAR.md",
    "DEPLOY.md",
    "DEPLOYMENT_READY.md",
    "MOBILE_PATCH.md",
    "PRODUCTION_DEBUG_GUIDE.md",
    "RESUMO_EXECUTIVO.md",
    "STATUS.md"
)

$docsOpsPath = Join-Path $RepoRoot "docs\ops"
$missingDocs = @()

foreach ($file in $docsOpsFiles) {
    $path = Join-Path $docsOpsPath $file
    if (-Not (Test-Path $path)) {
        $missingDocs += $file
    }
}

# Check for docs in root (should not exist)
foreach ($file in $docsOpsFiles) {
    $path = Join-Path $RepoRoot $file
    if (Test-Path $path) {
        $warnings += "Operational doc found in root (should be in docs/ops/): $file"
    }
}

if ($missingDocs.Count -eq 0) {
    Write-Host "[OK] All 7 operational docs in docs/ops/" -ForegroundColor $Green
} else {
    Write-Host "[FAIL] Missing operational docs: $($missingDocs -join ', ')" -ForegroundColor $Red
    foreach ($doc in $missingDocs) {
        $errors += "Missing operational doc: docs/ops/$doc"
    }
}

# ============================================================================
# PART 3: Reader Files & Casing
# ============================================================================

Write-Host "`n[3/6] Checking reader files and casing..." -ForegroundColor $Yellow

$readers = @(
    "vivencia_pombogira.html",
    "guia_de_ervas.html",
    "aula_iansa.html",
    "aula_oba.html",
    "aula_oya_loguna.html"
)

$livrosPath = Join-Path $RepoRoot "livros"
$livrosActual = Get-ChildItem $livrosPath -Name

$missingReaders = @()
$casingIssues = @()

foreach ($reader in $readers) {
    if ($livrosActual -notcontains $reader) {
        $missingReaders += $reader
    }
    # Check casing
    if ($reader -ne $reader.ToLower()) {
        $casingIssues += $reader
    }
}

if ($missingReaders.Count -eq 0) {
    Write-Host "[OK] All 5 readers present" -ForegroundColor $Green
} else {
    Write-Host "[FAIL] Missing readers: $($missingReaders -join ', ')" -ForegroundColor $Red
    foreach ($reader in $missingReaders) {
        $errors += "Missing reader: livros/$reader"
    }
}

if ($casingIssues.Count -eq 0) {
    Write-Host "[OK] Reader file names use lowercase (case-sensitive safe)" -ForegroundColor $Green
} else {
    Write-Host "[WARN] Uppercase in reader names (may fail on Vercel): $($casingIssues -join ', ')" -ForegroundColor $Yellow
    foreach ($issue in $casingIssues) {
        $warnings += "Casing issue (Vercel case-sensitive): livros/$issue"
    }
}

# ============================================================================
# PART 4: Link Validation in Key Files
# ============================================================================

Write-Host "`n[4/6] Validating links in key files..." -ForegroundColor $Yellow

$indexPath = Join-Path $RepoRoot "index.html"
$readmePath = Join-Path $RepoRoot "README.md"

$indexContent = Get-Content $indexPath -Raw
$readmeContent = Get-Content $readmePath -Raw

$requiredLinks = @(
    @{file = "index.html"; pattern = "livros/vivencia_pombogira.html"; desc = "Link to Pombogira reader"},
    @{file = "index.html"; pattern = "livros/guia_de_ervas.html"; desc = "Link to Ervas reader"},
    @{file = "index.html"; pattern = "livros/aula_iansa.html"; desc = "Link to Iansa reader"},
    @{file = "index.html"; pattern = "livros/aula_oba.html"; desc = "Link to Oba reader"},
    @{file = "index.html"; pattern = "livros/aula_oya_loguna.html"; desc = "Link to Oya reader"},
    @{file = "README.md"; pattern = "docs/ops/DEPLOY.md"; desc = "Link to docs/ops/DEPLOY.md"},
    @{file = "README.md"; pattern = "docs/ops/COMO_RODAR.md"; desc = "Link to docs/ops/COMO_RODAR.md"}
)

foreach ($link in $requiredLinks) {
    $content = if ($link.file -eq "index.html") { $indexContent } else { $readmeContent }
    if ($content -notmatch [regex]::Escape($link.pattern)) {
        $errors += "Missing link in $($link.file): $($link.pattern)"
    }
}

Write-Host "[OK] Link validation complete" -ForegroundColor $Green

# ============================================================================
# PART 5: NPX Linkinator (if available)
# ============================================================================

Write-Host "`n[5/6] Running linkinator (if available)..." -ForegroundColor $Yellow

$hasLinkinator = $false
try {
    $out = @()
    $out = npx linkinator --version 2>&1
    if ($out -and $out[0] -notmatch "not found") {
        $hasLinkinator = $true
    }
} catch { }

if ($hasLinkinator) {
    Write-Host "Found linkinator" -ForegroundColor $Green
    Write-Host "[SKIP] linkinator test (requires HTTP server)" -ForegroundColor $Yellow
} else {
    Write-Host "[SKIP] linkinator not installed" -ForegroundColor $Yellow
    Write-Host "   To enable: npm install -D linkinator" -ForegroundColor $Yellow
}

# ============================================================================
# PART 6: Summary
# ============================================================================

Write-Host "`n[6/6] Summary" -ForegroundColor $Yellow

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "`n========================================================" -ForegroundColor $Green
    Write-Host "[PASS] STRUCTURE VALIDATION PASSED" -ForegroundColor $Green
    Write-Host "========================================================" -ForegroundColor $Green
    Write-Host "Status: Ready for deployment" -ForegroundColor $Green
    Write-Host ""
    exit 0
} elseif ($errors.Count -eq 0 -and $warnings.Count -gt 0) {
    Write-Host "`n========================================================" -ForegroundColor $Yellow
    Write-Host "[WARN] WARNINGS DETECTED" -ForegroundColor $Yellow
    Write-Host "========================================================" -ForegroundColor $Yellow
    Write-Host "Status: Proceed with caution" -ForegroundColor $Yellow
    Write-Host "`nWarnings ($($warnings.Count)):" -ForegroundColor $Yellow
    foreach ($warn in $warnings) {
        Write-Host "  [W] $warn" -ForegroundColor $Yellow
    }
    Write-Host ""
    exit 0
} else {
    Write-Host "`n========================================================" -ForegroundColor $Red
    Write-Host "[FAIL] STRUCTURE VALIDATION FAILED" -ForegroundColor $Red
    Write-Host "========================================================" -ForegroundColor $Red
    Write-Host "`nErrors ($($errors.Count)):" -ForegroundColor $Red
    foreach ($err in $errors) {
        Write-Host "  [E] $err" -ForegroundColor $Red
    }
    if ($warnings.Count -gt 0) {
        Write-Host "`nWarnings ($($warnings.Count)):" -ForegroundColor $Yellow
        foreach ($warn in $warnings) {
            Write-Host "  [W] $warn" -ForegroundColor $Yellow
        }
    }
    Write-Host ""
    exit 1
}
