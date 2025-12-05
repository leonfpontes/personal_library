# Quickstart: Webview PDF da Apostila de Ervas

## Pré-requisitos
- Ambiente já configurado (Node 18+, Vercel dev server).
- Usuário com grant para `guia_de_ervas`.

## Passos de validação
1) Rodar projeto local: `npm run dev`.
2) Login com usuário que possua grant para `guia_de_ervas`.
3) Acessar `http://localhost:3000/livros/guia_de_ervas.html`.
4) Verificar:
   - PDF do Drive renderiza dentro da página (link preview).
   - Overlay/watermark com CPF visível sobre a área do viewer.
   - Botões de download/print do viewer não são clicáveis.
   - Bloqueios de cópia/print/devtools permanecem ativos.
5) Cenários de acesso negado:
   - Sem sessão: redirect para login.
   - Com sessão sem grant: deny/403 antes de renderizar o PDF.
6) Falha de carregamento: alterar temporariamente o link ou bloquear domínio do Drive e confirmar mensagem amigável sem oferecer download.

## Observações
- Não há migrations ou novas dependências.
- Se o Drive alterar a toolbar, ajustar altura do overlay no HTML/CSS.
