# Feature: Leitor de PDF para Guia de Ervas

## Resumo
Transformar `livros/guia_de_ervas.html` de leitor de Markdown em leitor de PDF que exibe `Source/PDF/Guia de Ervas - Terreiro Tia Maria e Cabocla Jupira.pdf`, mantendo marca d'água e proteção contra cópia, e oferecendo controles de zoom. Remover controles de fonte (A+/A−) e o sumário/ancoragem lateral.

## Objetivos
- Exibir o PDF do Guia de Ervas diretamente no leitor.
- Preservar travas de cópia e marca d'água existentes.
- Permitir zoom in/out com controles dedicados.
- Remover elementos que não fazem sentido para PDF (font-size, TOC lateral).

## Escopo
Incluído:
- Atualização de `livros/guia_de_ervas.html` para incorporar PDF e controles de zoom.
- Manter integração com `scripts/protection.js` e `scripts/watermark.js`.
Excluído:
- Navegação por páginas do PDF, anotações, download ou impressão.
- Alterações em outros livros/leitores.

## Usuários e Cenários
- Leitor autenticado acessa o livro “Guia de Ervas” e vê o PDF carregado.
- Usuário usa os botões “+” e “−” para ajustar zoom (50% a 200%).
- Marca d’água visível sobre o conteúdo; tentativas de copiar/selecionar são mitigadas.

## Requisitos Funcionais
- RF1: O sistema deve carregar o PDF `Source/PDF/Guia de Ervas - Terreiro Tia Maria e Cabocla Jupira.pdf` ao abrir `livros/guia_de_ervas.html`.
- RF2: O leitor deve disponibilizar botões de zoom in e zoom out, com exibição percentual atual.
- RF3: O zoom deve persistir em `localStorage` e respeitar limites de 0.5× a 2.0×.
- RF4: O leitor deve remover controles de fonte A+/A− e o TOC lateral.
- RF5: O leitor deve manter ativos `scripts/protection.js` e `scripts/watermark.js`.
- RF6: O acesso deve continuar passando pelo guard de validação `/api/auth/validate?bookSlug=guia_de_ervas`.

## Critérios de Sucesso
- 100% dos acessos válidos carregam o PDF em até 3s em rede local.
- Controles de zoom ajustam a visualização de 50% a 200% com passos de 10%.
- Marca d’água visível em 100% das visualizações.
- Conteúdo não apresenta seleção/cópia simples via teclado/mouse nas áreas controladas.
- Nenhum elemento de TOC lateral ou controles de fonte aparece no leitor.

## Entidades/Conteúdo
- Documento: Guia de Ervas (PDF) localizado em `Source/PDF/...`.
- Preferências: `localStorage` chave `pdf-zoom` (valor decimal).

## Assunções
- O `protection.js` e `watermark.js` atuam sobre o DOM atual e cobrem o iframe/overlay.
- O navegador embutido do usuário suporta exibição de PDF via `<iframe>`.
- O guard de acesso atual permanece inalterado.

## Dependências
- Scripts: `../scripts/protection.js`, `../scripts/watermark.js`.
- Arquivo PDF presente no caminho especificado.

## Riscos
- Alguns navegadores podem bloquear PDF em iframe; alternativa será necessária se ocorrer.
- Zoom via `transform` pode causar pixelização visual; aceitável para leitura.

## Testes e Cenários de Aceite
- A1: Abrir página com usuário válido → PDF carrega; sem TOC, sem A+/A−.
- A2: Clicar “+” 3x → zoom exibe 130%; persistência após recarregar página.
- A3: Clicar “−” até 50% → trava no limite; exibição percentual correta.
- A4: Marca d’água aparece sobre o conteúdo renderizado.
- A5: Tentar selecionar/copiar texto → bloqueio/mitigação ativa (segundo proteção existente).

## Não Funcional
- Desempenho local adequado (<3s carregamento inicial do frame em dev).
- Usabilidade simples, com botões claramente rotulados.