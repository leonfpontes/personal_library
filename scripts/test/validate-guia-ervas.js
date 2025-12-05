#!/usr/bin/env node

/**
 * Quick Validation Script for guia_de_ervas.html
 * 
 * Executa verificações básicas sem navegador:
 * - HTML está bem formado
 * - Scripts estão presentes
 * - URL do Drive está correta
 * - Elementos CSS necessários existem
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../../livros/guia_de_ervas.html');

console.log('📋 Validando: guia_de_ervas.html\n');

try {
  const content = fs.readFileSync(filePath, 'utf-8');
  let passed = 0;
  let failed = 0;

  // Test 1: DOCTYPE
  const hasDoctype = content.includes('<!DOCTYPE html>');
  console.log(`${hasDoctype ? '✅' : '❌'} DOCTYPE html presente`);
  hasDoctype ? passed++ : failed++;

  // Test 2: Meta viewport
  const hasViewport = content.includes('name="viewport"');
  console.log(`${hasViewport ? '✅' : '❌'} Meta viewport presente (mobile)`);
  hasViewport ? passed++ : failed++;

  // Test 3: Google Docs preview URL
  const googleDocsUrl = 'https://docs.google.com/document/d/1p8DUmneZsEUHYCsgkrb8sC7khWwjOY4zEivqLF44TYc/preview';
  const hasUrl = content.includes(googleDocsUrl);
  console.log(`${hasUrl ? '✅' : '❌'} Google Docs preview URL configurada`);
  hasUrl ? passed++ : failed++;

  // Test 4: Toolbar blocker elemento
  const hasToolbarBlocker = content.includes('class="toolbar-blocker"') || 
                           content.includes('id="toolbar-blocker"') ||
                           content.includes('toolbar-blocker');
  console.log(`${hasToolbarBlocker ? '✅' : '❌'} Toolbar blocker HTML presente`);
  hasToolbarBlocker ? passed++ : failed++;

  // Test 5: Fallback error div
  const hasErrorFallback = content.includes('id="pdfError"') || content.includes('class="pdf-error"');
  console.log(`${hasErrorFallback ? '✅' : '❌'} Fallback error message HTML presente`);
  hasErrorFallback ? passed++ : failed++;

  // Test 6: Protection scripts
  const hasWatermark = content.includes('scripts/watermark.js');
  const hasProtection = content.includes('scripts/protection.js');
  console.log(`${hasWatermark ? '✅' : '❌'} Watermark script incluído`);
  console.log(`${hasProtection ? '✅' : '❌'} Protection script incluído`);
  (hasWatermark && hasProtection) ? (passed += 2) : (failed += 2);

  // Test 7: Performance API
  const hasPerformanceAPI = content.includes('performance.now()') || 
                           content.includes('window.__pdfLoadMs');
  console.log(`${hasPerformanceAPI ? '✅' : '❌'} Performance measurement (timing) configurado`);
  hasPerformanceAPI ? passed++ : failed++;

  // Test 8: CSS classes
  const hasCssClasses = content.includes('viewer-shell') && 
                       content.includes('viewer-frame') &&
                       content.includes('pdf-loading') &&
                       content.includes('topbar');
  console.log(`${hasCssClasses ? '✅' : '❌'} CSS classes essenciais presentes`);
  hasCssClasses ? passed++ : failed++;

  // Test 9: Auth validation
  const hasAuthValidation = content.includes('/api/auth/validate');
  console.log(`${hasAuthValidation ? '✅' : '❌'} Auth validation check presente`);
  hasAuthValidation ? passed++ : failed++;

  // Test 10: Theme toggle
  const hasThemeToggle = content.includes('themeToggle') || 
                        content.includes('data-theme');
  console.log(`${hasThemeToggle ? '✅' : '❌'} Theme toggle functionality presente`);
  hasThemeToggle ? passed++ : failed++;

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ Passaram: ${passed}`);
  console.log(`❌ Falharam: ${failed}`);
  console.log(`📊 Taxa de sucesso: ${Math.round((passed / (passed + failed)) * 100)}%`);
  console.log(`${'='.repeat(50)}\n`);

  if (failed === 0) {
    console.log('🎉 Todas as verificações passaram!');
    process.exit(0);
  } else {
    console.log('⚠️ Algumas verificações falharam. Revise o arquivo.');
    process.exit(1);
  }

} catch (err) {
  console.error(`❌ Erro ao ler arquivo: ${err.message}`);
  process.exit(1);
}
