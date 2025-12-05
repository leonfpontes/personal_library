/**
 * Global setup para Playwright
 * Aguarda o servidor estar disponível antes de rodar os testes
 */

const http = require('http');

async function waitForServer(url, maxAttempts = 30, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve(res.statusCode);
        });
        req.on('error', reject);
        req.setTimeout(2000, () => {
          req.destroy();
          reject(new Error('Timeout'));
        });
      });
      console.log(`✓ Servidor disponível (tentativa ${attempt})`);
      return true;
    } catch (error) {
      if (attempt === maxAttempts) {
        console.error(`✗ Servidor não respondeu após ${maxAttempts} tentativas`);
        throw new Error(`Servidor indisponível em ${url}`);
      }
      console.log(`  Aguardando servidor... (tentativa ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

async function globalSetup() {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('  🔄 Playwright Global Setup');
  console.log('═══════════════════════════════════════════════════════\n');

  try {
    await waitForServer('http://localhost:3000', 30, 1000);
    console.log('\n✓ Servidor pronto para testes\n');
  } catch (error) {
    console.error(`\n✗ Erro: ${error.message}\n`);
    console.error('Certifique-se de que o servidor está rodando:');
    console.error('  npm run dev\n');
    process.exit(1);
  }
}

module.exports = globalSetup;
