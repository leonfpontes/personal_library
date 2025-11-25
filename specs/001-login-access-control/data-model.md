# Data Model: Login e Controle de Acesso da Biblioteca (SQLite Edge)

**Date**: 2025-11-25  
**Source**: research.md decisions (atualizado para SQLite edge/serverless)

## Overview

Persistência migrada de Vercel KV (Redis) para **SQLite edge/serverless** (Turso/Deno KV/LiteFS similar) para atender restrições de plataforma. O modelo privilegia:

-a **DATABASE_URL** (`libsql://personallibrary-leonfpontes.aws-us-east-1.turso.io`) e o **TOKEN** (`eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NjQxMDQ0NTQsImlkIjoiYmVjNmQ1ZWUtY2U0ZS00ODQxLWIyMjEtNzc0NTY0NjFjOGI2IiwicmlkIjoiMDg5YjIxMmUtN2EzNi00M2FlLTlmZDgtZTYzYmU3NWY3NGFiIn0.7YIgZ9I04jEXezVAlIYYioJyNH-Fnha9t4PNoAnU-mHj1PkMHTxdBLEprFOuBHGRxaoxYhSx14W4s-gbvmlIDg`) do Turso SQLite.
- Operações simples (CRUD) com índices diretos.
- Baixa latência em leitura para validação de autorização (grants) e watermark.
- Facilidade de migração e export (arquivo .db versionado se necessário).

Todas as tabelas usam tipos nativos SQLite. Timestamps em segundos (INTEGER). UUID armazenado como TEXT (formato v4). CPF armazenado em formato claro para validação, porém máscara aplicada em exibição (marca d’água) e acesso restrito apenas a código de backend. Opcional: encriptação simétrica pode ser adicionada posteriormente (`CPF_ENC_KEY`).

---

## Entities

### User

Tabela: `users`

| Field         | Type    | Required | Constraints                          | Description                                  |
|---------------|---------|----------|--------------------------------------|----------------------------------------------|
| id            | TEXT    | Yes      | PK (UUID v4)                         | Identificador único                          |
| nome          | TEXT    | Yes      | 3-100 chars                          | Nome completo                                |
| cpf           | TEXT    | Yes      | UNIQUE, regex ^\d{11}$               | CPF sem formatação                           |
| email         | TEXT    | Yes      | UNIQUE, valid email                  | Credencial de login                          |
| hashed_password | TEXT | Yes      | bcrypt hash                          | Senha armazenada como hash                   |
| status        | TEXT    | Yes      | CHECK(status IN ('active','inactive')) | Status                                        |
| created_at    | INTEGER | Yes      |                                      | Timestamp criação                            |
| last_access_at| INTEGER | Yes      |                                      | Último login                                 |
| consent_at    | INTEGER | Yes      |                                      | Timestamp do consentimento LGPD             |

Índices adicionais:

- `CREATE INDEX idx_users_email ON users(email);`
- `CREATE INDEX idx_users_cpf ON users(cpf);`
- `CREATE INDEX idx_users_status ON users(status);`

Business Rules:

- CPF válido (11 dígitos) e único.
- Email único e normalizado (lowercase).
- Senha hash bcrypt (salt rounds = 10). Nunca armazenar plaintext.
- `last_access_at` atualizado em cada login.
- Sessões só válidas para `status='active'`.
- Consentimento LGPD registrado em `consent_at`.

---

### Grant (Concessão de Acesso)

Tabela: `grants`

| Field      | Type    | Required | Constraints                                         | Description                       |
|------------|---------|----------|-----------------------------------------------------|-----------------------------------|
| id         | TEXT    | Yes      | PK (UUID v4)                                        | Identificador único da concessão  |
| user_id    | TEXT    | Yes      | FK -> users(id) ON DELETE CASCADE                   | Usuário                           |
| book_slug  | TEXT    | Yes      | CHECK(book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')) | Livro                            |
| status     | TEXT    | Yes      | CHECK(status IN ('active','revoked'))               | Estado                            |
| granted_at | INTEGER | Yes      |                                                     | Timestamp concessão               |
| revoked_at | INTEGER | No       |                                                     | Timestamp revogação               |

Índices:

- `CREATE UNIQUE INDEX idx_grants_user_book ON grants(user_id, book_slug);`
- `CREATE INDEX idx_grants_status ON grants(status);`

Business Rules:

- Uma linha por usuário/livro. Revogação atualiza `status='revoked'` e `revoked_at`.
- Reativação: `UPDATE grants SET status='active', revoked_at=NULL, granted_at=NOW() WHERE user_id=? AND book_slug=?`.
Índices:

- `CREATE INDEX idx_audit_user ON audit_log(user_id);`
- `CREATE INDEX idx_audit_book ON audit_log(book_slug);`
- `CREATE INDEX idx_audit_action ON audit_log(action);`
- `CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);`

Retention: limpeza por job (não TTL nativo). Regra: deletar registros com `timestamp < NOW() - 7776000` (90 dias).

---

### Session

Tabela: `sessions`

| Field        | Type    | Required | Constraints                                   | Description                                 |
|--------------|---------|----------|-----------------------------------------------|---------------------------------------------|
| id           | TEXT    | Yes      | PK (UUID v4)                                  | Identificador da sessão                     |
| user_id      | TEXT    | Yes      | FK -> users(id) ON DELETE CASCADE             | Usuário                                     |
| created_at   | INTEGER | Yes      |                                               | Timestamp criação                           |
| expires_at   | INTEGER | Yes      |                                               | Timestamp expiração                         |
| revoked_at   | INTEGER | No       |                                               | Timestamp revogação (logout/forçada)        |
| ip_hash      | TEXT    | No       |                                               | Hash SHA-256 do IP (LGPD-friendly)          |
| user_agent   | TEXT    | No       |                                               | Agente de navegação                         |

Business Rules:
- Expiração padrão: 24h após criação (configurável via env `SESSION_TTL_SECONDS`).
- Logout: seta `revoked_at=NOW()` e middleware invalida.
- Middleware considera válida se `revoked_at IS NULL AND expires_at > NOW()`.
- Regeneração opcional a cada login; multi-sessões permitidas.

---

### AuditLog (Registro de Acesso)

Tabela: `audit_log`

| Field      | Type    | Required | Constraints                                             | Description                         |
|------------|---------|----------|---------------------------------------------------------|-------------------------------------|
| id         | TEXT    | Yes      | PK (UUID v4)                                            | Identificador                       |
| user_id    | TEXT    | No       | FK -> users(id) ON DELETE SET NULL                      | Usuário (null se anônimo)           |
| action     | TEXT    | Yes      | CHECK(action IN ('login_success','login_failure','access_granted','access_denied','copy_attempt','logout')) | Tipo de evento                      |
| book_slug  | TEXT    | No       | CHECK(book_slug IN ('vivencia_pombogira','guia_de_ervas','aula_iansa','aula_oba','aula_oya_loguna')) | Livro (se aplicável)                |
| timestamp  | INTEGER | Yes      |                                                         | Timestamp                           |
| ip_hash    | TEXT    | No       |                                                         | Hash SHA-256 do IP                  |
| user_agent | TEXT    | No       |                                                         | User Agent                          |

Índices:
- `CREATE INDEX idx_audit_user ON audit_log(user_id);`
- `CREATE INDEX idx_audit_book ON audit_log(book_slug);`
- `CREATE INDEX idx_audit_action ON audit_log(action);`
- `CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);`

Retention: limpeza por job (não TTL nativo). Regra: deletar registros com `timestamp < NOW() - 7776000` (90 dias).

---

## Relationships

```
User 1 ─────────┐
                ├── N Grant ── N Book
                ├── N Session
                └── N AuditLog
```

Details:

- User–Grant: 1:N (unique por livro).
- Book–Grant: N:M (via grants).
- User–Session: 1:N.
- User–AuditLog: 1:N (FK nullable para preservar eventos após exclusão).

---

## Access Patterns & Queries

### 1. Login (Authenticate User)

```sql
SELECT id, hashed_password, status FROM users WHERE email = ?;
-- Verifica bcrypt, status='active', atualiza last_access_at e cria sessão
INSERT INTO sessions (id,user_id,created_at,expires_at,ip_hash,user_agent) VALUES (?,?,?,?,?,?);
UPDATE users SET last_access_at=? WHERE id=?;
```

---

### 2. Check Grant (Middleware Validation)

```sql
SELECT status FROM grants WHERE user_id=? AND book_slug=?;
-- Considera acesso se existir linha com status='active'
```

---

### 3. Grant Access to Book

```sql
INSERT OR REPLACE INTO grants (id,user_id,book_slug,status,granted_at,revoked_at)
VALUES (COALESCE((SELECT id FROM grants WHERE user_id=? AND book_slug=?), ?), ?, ?, 'active', ?, NULL);
```

---

### 4. Revoke Access to Book

```sql
UPDATE grants SET status='revoked', revoked_at=? WHERE user_id=? AND book_slug=?;
```

---

### 5. List All Grants for User

```sql
SELECT book_slug, status, granted_at, revoked_at FROM grants WHERE user_id=?;
```

---

### 6. List All Users with Access to Book

```sql
SELECT user_id FROM grants WHERE book_slug=? AND status='active';
```

---

### 7. Fetch User Details for Watermark

```sql
SELECT nome, cpf FROM users WHERE id=?;
-- Watermark render: aplicar máscara no CPF (ex.: 123***01)
```

---

### 8. Create User

```sql
INSERT INTO users (id,nome,cpf,email,hashed_password,status,created_at,last_access_at,consent_at)
VALUES (?,?,?,?,?,?,?, ?, ?);
```

---

### 9. Log Audit Event

```sql
INSERT INTO audit_log (id,user_id,action,book_slug,timestamp,ip_hash,user_agent)
VALUES (?,?,?,?,?,?,?);
```

---

## Data Validation Rules

### Client-Side (Browser)
- **CPF**: `pattern="^\d{11}$"` (11 dígitos numéricos)
- **Email**: `type="email"` (validação HTML5)
- **Password**: `minlength="8"` (mínimo 8 caracteres)
- **Nome**: `minlength="3" maxlength="100"`

### Server-Side (API/Middleware)
- CPF: regex `/^\d{11}$/` + máscara na renderização (exibição watermark: primeiros 3 + últimos 2).
- Email: regex RFC 5322 + normalização lowercase.
- Password: >=8 chars, hash bcrypt.
- Book Slug: whitelist.
- Consentimento: flag implícita via presença de `consent_at` (não permitir criação sem consentimento).

### Business Logic
- User `inactive`: block login
- Session expired: redirect to login
- Grant revoked: block access (checked in middleware)
- Audit log: write-only (não editável após criação)

---

## Data Retention & Cleanup

| Entity | Retention Policy | Cleanup Method |
|--------|------------------|----------------|
| **User** | Até exclusão manual ou 12 meses de inatividade | DELETE cascata remove grants & sessions; audit mantém user_id NULL |
| **Grant** | Histórico mantido (status) | Não deletado; audit reflete mudanças |
| **Session** | 24 horas | Limpeza job: `DELETE FROM sessions WHERE expires_at < NOW()` |
| **AuditLog** | 90 dias | Limpeza job: `DELETE FROM audit_log WHERE timestamp < NOW() - 7776000` |

**LGPD Compliance**:
- Exclusão: remover linha de `users` dispara cascata (grants, sessions). `audit_log` preservado com `user_id` NULL.
- CPF usado apenas para watermark + auditoria; não exportado por endpoints públicos.
- Máscara na watermark e em responses (`cpf_masked` derivado).
- Consentimento armazenado (`consent_at`).

---

## Indexes & Performance

Optimized:
- Login: index email → single row.
- Grant check: composite index (user_id, book_slug).
- Audit queries: filtered by user/book/time with indexes.

Potential Bottlenecks:
- Listagem massiva de usuários sem paginação.
- Audit log grande sem filtros de data.

Caching Strategy:
- Grants embutidos no JWT (lista de book_slugs ativos) — refrescar após alterações.
- Session validação via query simples (PRIMARY KEY).
- Book metadata hardcoded no frontend.

---

## Migration & Seeding

### Initial Setup
1. Executar migrations SQL.
2. Seed admin:
```sql
INSERT INTO users (id,nome,cpf,email,hashed_password,status,created_at,last_access_at,consent_at)
VALUES ('admin-uuid','Administrador','00000000000','admin@library.local','$2a$10$hash','active',strftime('%s','now'),strftime('%s','now'),strftime('%s','now'));
```
3. Conceder livros iniciais (opcional):
```sql
INSERT INTO grants (id,user_id,book_slug,status,granted_at) VALUES ('g1','admin-uuid','vivencia_pombogira','active',strftime('%s','now'));
```
   ```

### Book Slugs Registry
Hardcoded list (não em KV; gerenciado via código):
```js
const BOOKS = [
  { slug: 'vivencia_pombogira', title: 'Os Mistérios de Pombogira' },
  { slug: 'guia_de_ervas', title: 'Guia de Ervas' },
  { slug: 'aula_iansa', title: 'Aula Iansã' },
  { slug: 'aula_oba', title: 'Aula Obá' },
  { slug: 'aula_oya_loguna', title: 'Aula Oyá e Logunã' }
];
```

---

## Summary

- **Entities**: User, Grant, Session, AuditLog
- **Storage**: Vercel KV (Redis) com estruturas otimizadas (Hashes, Sets, Sorted Sets)
- **Access Patterns**: O(1) para grants check, login, session validation
- **Retention**: 24h sessions, 90d logs, 12m users (inactive)
- **LGPD**: Consent + retention policy + delete on request

**Next Steps**: Gerar `contracts/` (OpenAPI specs para APIs)
