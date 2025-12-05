# Research: Webview PDF da Apostila de Ervas (Google Drive)

## Decisions

1) **Embed do PDF via Google Drive preview**
- Usar URL de preview: `https://drive.google.com/file/d/1DUDvuMoSVsUfEInYFT__Mb94hvsuq4a9/preview`
- Justificativa: mantém renderização inline em iframe; não exige libs novas; funciona em desktop/mobile.
- Alternativas: Google Docs Viewer (`https://docs.google.com/gview?embedded=1&url=...`) — descartado para evitar latência extra e dependência de URL pública direta do PDF.

2) **Bloqueio de download/print da toolbar do viewer**
- Estratégia: overlay fixo no topo do iframe (altura ~56px, mesma altura da toolbar do Drive) com `pointer-events: auto` para engolir cliques, mantendo o restante da área com `pointer-events: none` para permitir rolagem/zoom padrão do PDF.
- Complementar: manter `scripts/protection.js` para bloquear copy/print/devtools; overlay garante que botões de download/print do Drive não sejam clicáveis.
- Risco residual: se o Drive alterar a altura da toolbar, o overlay pode precisar de ajuste; testar manualmente.

3) **Detecção de falha de carregamento**
- Usar timeout + listener `onload` do iframe: se não acionar em X segundos ou se `contentWindow` não acessível (cross-origin impede inspeção), exibir fallback de erro amigável no contêiner e não ofertar download.
- Alternativa: `onerror` em iframe não é confiável para Drive; timeout é abordagem prática.

4) **Responsividade e layout**
- Conter o iframe em bloco flexível ocupando área de leitura, com altura mínima de viewport (ex.: `min-height: 80vh`) e rolagem única para evitar barras duplas.
- Manter header/controles existentes do reader.

## Tests to run (manual/Playwright)
- Happy path: usuário com sessão+grant vê PDF, watermark visível, overlay bloqueia clicks nos botões de download/print (tentar clicar e verificar nenhuma ação/aba nova).
- Forbidden: sem sessão → redirect login; com sessão sem grant → deny/403 sem render do PDF.
- Proteção: copy/print/devtools bloqueados como hoje; watermark sobre iframe.
- Falha: simular bloqueio do domínio do Drive ou alterar URL para invalidar → mostrar mensagem de erro e manter proteção (nenhum link de download).
- Mobile view: verificar rolagem única e overlay ainda cobrindo toolbar.

## Open Risks / Assumptions
- Toolbar do Drive pode mudar; overlay precisa ser ajustável (CSS var ou classe dedicada).
- Se o proprietário do arquivo alterar permissões do link, o embed pode falhar; fallback deve instruir tentar novamente ou contatar suporte, sem oferecer download.
