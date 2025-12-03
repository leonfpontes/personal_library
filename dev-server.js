/**
 * Servidor de desenvolvimento simples para o projeto
 * Alternativa ao `vercel dev` quando há problemas de configuração
 *
 * Melhorias:
 * - Tratamento de handlers assíncronos (await Promises)
 * - Captura global de exceções para evitar crash silencioso (gera ERR_CONNECTION_RESET no cliente)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Carrega variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const PORT = process.env.PORT || 3000;

// Tipos MIME comuns
const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.md': 'text/markdown'
};

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason);
});

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = parsedUrl.pathname;

  console.log(`${req.method} ${pathname}`);

  // Rota para API (com suporte a body e JSON)
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.replace(/^\/api/, './api');
    const apiFile = path.join(__dirname, `${apiPath}.js`);

    // Utilitário para parse de body
    const parseBody = () => new Promise(resolve => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        const contentType = (req.headers['content-type'] || '').split(';')[0].trim();
        let body = undefined;
        try {
          if (contentType === 'application/json') {
            body = raw ? JSON.parse(raw) : {};
          } else if (contentType === 'application/x-www-form-urlencoded') {
            body = Object.fromEntries(new URLSearchParams(raw));
          } else {
            body = raw;
          }
        } catch (e) {
          body = raw;
        }
        resolve(body);
      });
    });

    if (fs.existsSync(apiFile)) {
      try {
        // Clear require cache to avoid stale references
        delete require.cache[require.resolve(apiFile)];
        
        // Patch res.json and res.status
        res.json = (obj) => {
          if (!res.headersSent) res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(obj));
        };
        res.status = (code) => {
          res.statusCode = code;
          return res; // chainable
        };
        // Adiciona req.query
        req.query = parsedUrl.query || {};
        // Adiciona req.body (assíncrono para POST/PUT/PATCH)
        const method = req.method || 'GET';
        
        const invokeHandler = (handler) => {
          let fn = null;
          if (typeof handler === 'function') fn = handler;
          else if (handler && handler.default && typeof handler.default === 'function') fn = handler.default;
          if (!fn) return false;
          try {
            const ret = fn(req, res);
            if (ret && typeof ret.then === 'function') {
              ret.catch(err => {
                console.error('[handler error]', err);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.json({ error: 'Handler failure', detail: err.message });
                }
              });
            }
            return true;
          } catch (e) {
            console.error('[sync handler error]', e);
            if (!res.headersSent) {
              res.statusCode = 500;
              res.json({ error: 'Handler exception', detail: e.message });
            }
            return true; // handler existed but failed
          }
        };

        if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
          parseBody().then(body => {
            req.body = body;
            const handler = require(apiFile);
            if (!invokeHandler(handler)) {
              res.statusCode = 500;
              return res.json({ error: 'Invalid API handler' });
            }
          }).catch(e => {
            console.error('[parse body error]', e);
            if (!res.headersSent) {
              res.statusCode = 400;
              res.json({ error: 'Body parse error', detail: e.message });
            }
          });
        } else {
          req.body = undefined;
          const handler = require(apiFile);
          if (!invokeHandler(handler)) {
            res.statusCode = 500;
            return res.json({ error: 'Invalid API handler' });
          }
        }
        return;
      } catch (error) {
        console.error('Error loading API:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'API not found' }));
    return;
  }

  // Remove trailing slash
  if (pathname !== '/' && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Serve arquivos estáticos
  let filePath = path.join(__dirname, pathname);

  // Se for diretório, tenta index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  // Se não tem extensão, tenta .html
  if (!path.extname(filePath) && !fs.existsSync(filePath)) {
    filePath += '.html';
  }

  // Verifica se arquivo existe
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>404 - Not Found</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: #f5f5f5;
            }
            .container {
              text-align: center;
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            h1 { margin: 0 0 1rem; color: #333; }
            p { color: #666; }
            a { color: #0070f3; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>404 - Página não encontrada</h1>
            <p>O recurso solicitado não existe.</p>
            <p><a href="/">← Voltar para home</a></p>
          </div>
        </body>
      </html>
    `);
    return;
  }

  // Determina tipo MIME
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  // Lê e serve o arquivo
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>500 - Server Error</title>
          </head>
          <body>
            <h1>500 - Erro interno do servidor</h1>
            <p>${err.message}</p>
          </body>
        </html>
      `);
      return;
    }

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  🚀 Servidor de desenvolvimento iniciado!');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
  console.log(`  ➜  Local:   http://localhost:${PORT}`);
  console.log(`  ➜  Network: http://127.0.0.1:${PORT}`);
  console.log('');
  console.log('  📝 Pressione Ctrl+C para parar');
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');
});
