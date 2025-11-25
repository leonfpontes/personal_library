# Proteção de Conteúdo: Critérios e Fallbacks

## Eventos Bloqueados

- Seleção de texto (`selectstart`)
- Copiar (`copy`)
- Teclas de atalho: `Ctrl/Cmd + C`, `X`, `V`, `S`, `P`
- Menu de contexto (clique direito)
- Impressão (CSS `@media print` oculta conteúdo)
- PrintScreen (heurístico: tecla `PrintScreen`)

## Fallbacks e Limitações

- Navegadores podem permitir extensões/DevTools contornarem bloqueios.
- Bloqueios por JS são best-effort; usuários avançados podem burlar.
- Impressão: conteúdo é ocultado via CSS, mas capturas de tela do sistema não são 100% preveníveis.

## Auditoria

- Toda tentativa bloqueada dispara POST `/api/audit/track` com `action`:
  - `copy_attempt`, `print_blocked`, `context_blocked`
- Payload inclui IP hash e user-agent no backend.

## Mensagens

- Catálogo em `scripts/messages.pt-BR.json` centraliza textos.
- Banner de acesso negado em `index.html` quando `?denied=true`.

## Política

- O objetivo é desincentivar uso indevido e identificar o usuário via marca d'água.
- Marca d'água: `Nome — CPF mascarado (123***01)` em `scripts/watermark.js`.
