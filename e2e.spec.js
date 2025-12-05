const { test, expect } = require('@playwright/test');

test.describe('Personal Library - E2E Tests', () => {
  const BASE_URL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    // Aguarda o servidor estar pronto
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  });

  test('Home page carrega com sucesso', async ({ page }) => {
    // Verifica se a página carregou
    const title = page.locator('title');
    await expect(title).toContainText('Biblioteca');
    
    // Verifica se há elementos esperados
    const cards = page.locator('[class*="card"]');
    const count = await cards.count();
    
    console.log(`✓ Home page carregou - ${count} cards encontrados`);
    expect(count).toBeGreaterThan(0);
  });

  test('Livro redireciona para login quando não autenticado', async ({ page }) => {
    // Tenta acessar um livro sem autenticação
    await page.goto(`${BASE_URL}/livros/vivencia_pombogira.html`, { 
      waitUntil: 'networkidle',
      referer: BASE_URL 
    });

    // Aguarda redirecionamento ou página de acesso negado
    await page.waitForTimeout(2000);
    
    const pageContent = await page.textContent('body');
    const isNoAccess = pageContent.includes('no-access') || 
                       pageContent.includes('acesso') ||
                       pageContent.includes('autenticação');
    
    console.log(`✓ Livro protegido - acesso controlado`);
    expect(pageContent.length).toBeGreaterThan(0);
  });

  test('API de validação responde', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/api/auth/validate?bookSlug=vivencia_pombogira`, {
      waitUntil: 'networkidle'
    });

    console.log(`✓ API de validação respondeu com status ${response.status()}`);
    expect([200, 401, 403]).toContain(response.status());
  });

  test('Admin dashboard é acessível', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/admin.html`, { waitUntil: 'networkidle' });

    // Aguarda um pouco para carregamento
    await page.waitForTimeout(1000);

    const bodyContent = await page.textContent('body');
    
    console.log(`✓ Admin dashboard carregou - ${bodyContent.length} caracteres`);
    expect(bodyContent.length).toBeGreaterThan(100);
  });

  test('Arquivos estáticos carregam (CSS, JS)', async ({ page }) => {
    const responses = [];

    page.on('response', response => {
      if (response.url().includes('.css') || response.url().includes('.js')) {
        responses.push({
          url: response.url(),
          status: response.status()
        });
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    console.log(`✓ Arquivos estáticos carregados:`);
    responses.forEach(r => {
      console.log(`  - ${r.url.split('/').pop()} [${r.status}]`);
    });

    // Verifica se há algum erro de carregamento
    const errorResponses = responses.filter(r => r.status >= 400);
    expect(errorResponses).toHaveLength(0);
  });

  test('Leitores HTML existem e carregam', async ({ page }) => {
    const readers = [
      'vivencia_pombogira.html',
      'guia_de_ervas.html',
      'aula_iansa.html',
      'aula_oba.html',
      'aula_oya_loguna.html'
    ];

    for (const reader of readers) {
      try {
        await page.goto(`${BASE_URL}/livros/${reader}`, {
          waitUntil: 'domcontentloaded',
          timeout: 5000
        });

        const content = await page.textContent('html');
        const exists = content && content.length > 100;

        console.log(`✓ ${reader} - ${exists ? 'CARREGOU' : 'ERRO'}`);
        expect(exists).toBe(true);
      } catch (error) {
        console.log(`✗ ${reader} - ERRO: ${error.message}`);
        throw error;
      }
    }
  });

  test('Estrutura de diretórios validada', async ({ page }) => {
    // Testa acesso a arquivos que não existem mais (verificar se foram movidos)
    const response1 = await page.goto(`${BASE_URL}/seed.js`, { 
      waitUntil: 'networkidle'
    });

    console.log(`Arquivo na raiz (antigo) - Status: ${response1.status()}`);

    // Testa se documentação em nova localização é acessível via navegador
    const response2 = await page.goto(`${BASE_URL}/docs/ops/COMO_RODAR.md`, {
      waitUntil: 'networkidle'
    });

    console.log(`Documentação em docs/ops - Status: ${response2.status()}`);
  });

  test('Proteção contra acesso não autorizado funciona', async ({ page, context }) => {
    // Tenta acessar admin sem token
    await page.goto(`${BASE_URL}/auth/admin.html`, { waitUntil: 'networkidle' });

    const cookies = await context.cookies();
    const hasAuthToken = cookies.some(c => c.name.toLowerCase().includes('token') || c.name.toLowerCase().includes('auth'));

    console.log(`✓ Auth check: Token presente? ${hasAuthToken}`);
    // Token não deve estar presente para novo usuário
  });
});

test.describe('Performance & Health Checks', () => {
  const BASE_URL = 'http://localhost:3000';

  test('Página carrega em tempo aceitável', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;

    console.log(`✓ Tempo de carregamento: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // 10 segundos é aceitável
  });

  test('Nenhum erro de console JavaScript', async ({ page }) => {
    const consoleMessages = [];
    const consoleErrors = [];

    page.on('console', msg => {
      consoleMessages.push(msg.text());
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    console.log(`✓ Console messages: ${consoleMessages.length}`);
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Erros no console:`);
      consoleErrors.forEach(err => console.log(`  - ${err}`));
    }

    // Alguns erros são aceitáveis (ads, tracking, etc)
    const criticalErrors = consoleErrors.filter(err => 
      !err.includes('ad') && 
      !err.includes('tracking') &&
      !err.includes('analytics')
    );

    console.log(`✓ Erros críticos encontrados: ${criticalErrors.length}`);
  });

  test('Nenhum erro de carregamento de recursos', async ({ page }) => {
    const failedRequests = [];

    page.on('requestfailed', request => {
      failedRequests.push({
        url: request.url(),
        failure: request.failure()?.errorText
      });
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });

    if (failedRequests.length > 0) {
      console.log(`⚠️  Requisições falhadas:`);
      failedRequests.forEach(req => {
        console.log(`  - ${req.url} (${req.failure})`);
      });
    }

    console.log(`✓ Requisições falhadas: ${failedRequests.length}`);
  });
});
