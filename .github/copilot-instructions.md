# Copilot Instructions for `personal_library`

Purpose: Help AI coding/writing agents work productively in this repository by following the current structure and editorial conventions. Keep guidance concrete and specific to this repo.

## Big Picture
- This is a content-first repo for Portuguese (pt-BR) manuscripts. No build system, tests, or scripts are present.
- Primary artifact: long-form Markdown under `Source/`. Example: `Source/vivencia_pombogira.md` (≈780+ lines).
- `index.html` is currently empty (placeholder). Do not add bundlers, frameworks, or site tooling unless explicitly requested.

## Layout
- `Source/`: manuscript files in Markdown.
- `README.md`: minimal project label; avoid expanding with process docs unless asked.
- `.github/`: this instruction file for AI agents.

## Authoring Conventions (observed)
- **Language:** Portuguese (pt-BR). Preserve diacritics and original terminology (e.g., “Pombogira”, “Umbanda Sagrada”).
- **Tone/Style:** Didactic, theological, and explanatory; narrative paragraphs over heavy Markdown formatting.
- **Headings:**
  - Top-level title often in uppercase (e.g., `OS MISTÉRIOS DE POMBOGIRA...`).
  - Chapters start with `CAPÍTULO N` on its own line.
  - Subsections use numeric prefix and en dash: `N.M – Título`.
- **Paragraphs:** Separate with a blank line. Keep natural prose lines; avoid hard-wrapping every ~80 chars.
- **Lists:** Used sparingly for emphasis; prefer simple `-` bullets. Keep list items as short, single sentences.
- **Quotes/Emphasis:** Minimal use. Prefer plain text over bold/italic unless clarifying structure.
- **Encoding:** UTF-8. Do not strip or normalize accents.

### Examples from `Source/vivencia_pombogira.md`
- Chapter header:
  ```
  CAPÍTULO 3
  O MISTÉRIO INTERIORIZADOR: A SENHORA DOS INTERIORES
  ```
- Subsection with numbering and en dash:
  ```
  2.2 – Da opressão ao empoderamento: a transmutação espiritual da dor
  ```
- Short emphasis lists embedded in prose:
  ```
  Ela não é vulgar; é profunda.
  Não é sedutora; é verdadeira.
  ```

## Working Practices
- Add new manuscripts under `Source/` using lowercase snake_case or descriptive slugs (e.g., `Source/nova_apostila.md`).
- Maintain the chapter structure (`CAPÍTULO N`, subsections `N.M – ...`) for long-form works.
- If cross-linking, use relative links from the current file (e.g., from `.github/` use `[Vivência Pombogira](../Source/vivencia_pombogira.md)`). Avoid adding external navigation until requested.
- Keep edits focused: content improvements, typo fixes, or structural consistency. Do not introduce doctrinal changes without explicit prompts.
- Leave `index.html` untouched unless the user asks to wire it to Markdown.

## Local Preview
- Use VS Code’s Markdown preview to review changes before committing: Command Palette → “Markdown: Open Preview to the Side”.

## Non-Goals
- Do not add build pipelines, static site generators, or CI.
- Do not restructure directories or rename existing files without instruction.
- Do not translate content or change language defaults unless asked.

## When Unsure
- Prefer minimal, surgical edits that preserve the author’s voice and structure.
- Ask for clarification before introducing new patterns (e.g., templates, TOCs, front matter).
