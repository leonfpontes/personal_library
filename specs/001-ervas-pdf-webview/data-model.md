# Data Model: Webview PDF da Apostila de Ervas

## Scope
Nenhuma alteração de dados ou esquemas. Reutiliza grants e sessões existentes.

## Entities (referência)
- **User**: já existente; autenticação JWT.
- **Grant**: acesso por livro; requer grant para `guia_de_ervas`.
- **Audit Log**: permanece inalterado (retenção 90 dias).

## Notes
- Nenhum novo campo PII.
- Nenhuma migração necessária.
