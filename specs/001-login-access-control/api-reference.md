# API Reference — Exemplos de Uso

Este documento contém exemplos práticos de uso das APIs do sistema de autenticação e controle de acesso.

## Autenticação

### 1. Login

**Endpoint**: `POST /api/auth/login`

**Request**:

```powershell
curl -X POST https://<seu-dominio>/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@library.local","password":"changeme123"}'
```

**Response (200 OK)**:

```json
{
  "success": true,
  "user": {
    "id": "admin",
    "nome": "Admin",
    "cpfMasked": "000***00",
    "email": "admin@library.local",
    "status": "active"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookie Retornado**:

```text
Set-Cookie: session=<JWT>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400; Path=/
```

### 2. Validar Sessão

**Endpoint**: `GET /api/auth/validate?bookSlug=vivencia_pombogira`

**Usado por**: `scripts/watermark.js` para verificar se o usuário tem acesso ao livro.

**Request**:

```powershell
curl -X GET "https://<seu-dominio>/api/auth/validate?bookSlug=vivencia_pombogira" `
  -H "Cookie: session=<JWT>"
```

**Response (200 OK - acesso permitido)**:

```json
{
  "valid": true,
  "user": {
    "nome": "João Silva",
    "cpfMasked": "123***01"
  }
}
```

**Response (403 Forbidden - sem grant)**:

```json
{
  "valid": false,
  "error": "access_denied"
}
```

## Gerenciamento de Usuários

### 3. Listar Usuários

**Endpoint**: `GET /api/users`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET https://<seu-dominio>/api/users `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "users": [
    {
      "id": "admin",
      "nome": "Admin",
      "cpfMasked": "000***00",
      "email": "admin@library.local",
      "status": "active"
    },
    {
      "id": "abc123-uuid",
      "nome": "Maria Santos",
      "cpfMasked": "456***89",
      "email": "maria@example.com",
      "status": "active"
    }
  ]
}
```

### 4. Criar Usuário

**Endpoint**: `POST /api/users`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X POST https://<seu-dominio>/api/users `
  -H "Content-Type: application/json" `
  -H "X-Admin-Token: <ADMIN_TOKEN>" `
  -d '{
    "nome": "João Silva",
    "cpf": "12345678901",
    "email": "joao@example.com",
    "password": "senha123",
    "consent": true
  }'
```

**Response (200 OK)**:

```json
{
  "success": true,
  "user": {
    "id": "def456-uuid",
    "nome": "João Silva",
    "cpfMasked": "123***01",
    "email": "joao@example.com",
    "status": "active"
  }
}
```

**Response (400 Bad Request - CPF já existe)**:

```json
{
  "success": false,
  "error": "CPF já cadastrado"
}
```

### 5. Obter Usuário por ID

**Endpoint**: `GET /api/users/[userId]`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET https://<seu-dominio>/api/users/def456-uuid `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "id": "def456-uuid",
  "nome": "João Silva",
  "cpfMasked": "123***01",
  "email": "joao@example.com",
  "status": "active"
}
```

**Response (404 Not Found)**:

```json
{
  "success": false,
  "error": "Usuário não encontrado"
}
```

### 6. Deletar Usuário

**Endpoint**: `DELETE /api/users/[userId]`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X DELETE https://<seu-dominio>/api/users/def456-uuid `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "success": true
}
```

## Gerenciamento de Grants (Permissões)

### 7. Conceder Acesso a Livro

**Endpoint**: `POST /api/grants`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X POST https://<seu-dominio>/api/grants `
  -H "Content-Type: application/json" `
  -H "X-Admin-Token: <ADMIN_TOKEN>" `
  -d '{
    "userId": "def456-uuid",
    "bookSlug": "vivencia_pombogira",
    "action": "grant"
  }'
```

**Response (200 OK)**:

```json
{
  "success": true,
  "grantId": "ghi789-uuid"
}
```

### 8. Revogar Acesso a Livro

**Endpoint**: `POST /api/grants`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X POST https://<seu-dominio>/api/grants `
  -H "Content-Type: application/json" `
  -H "X-Admin-Token: <ADMIN_TOKEN>" `
  -d '{
    "userId": "def456-uuid",
    "bookSlug": "vivencia_pombogira",
    "action": "revoke"
  }'
```

**Response (200 OK)**:

```json
{
  "success": true
}
```

**Nota**: A revogação é idempotente. Se o acesso já foi revogado, retorna sucesso sem erro.

### 9. Listar Acessos de Usuário

**Endpoint**: `GET /api/grants/[userId]`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET https://<seu-dominio>/api/grants/def456-uuid `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "grants": [
    {
      "id": "ghi789-uuid",
      "bookSlug": "vivencia_pombogira",
      "status": "active",
      "grantedAt": "2025-01-23T10:00:00.000Z",
      "revokedAt": null
    },
    {
      "id": "jkl012-uuid",
      "bookSlug": "guia_de_ervas",
      "status": "revoked",
      "grantedAt": "2025-01-20T08:00:00.000Z",
      "revokedAt": "2025-01-23T09:00:00.000Z"
    }
  ]
}
```

## Auditoria

### 10. Registrar Evento de Auditoria

**Endpoint**: `POST /api/audit/track`

**Usado por**: `scripts/protection.js` para registrar tentativas de cópia, impressão, etc.

**Request**:

```powershell
curl -X POST https://<seu-dominio>/api/audit/track `
  -H "Content-Type: application/json" `
  -H "Cookie: session=<JWT>" `
  -d '{
    "action": "copy_attempt",
    "bookSlug": "vivencia_pombogira"
  }'
```

**Response (200 OK)**:

```json
{
  "success": true,
  "auditId": "mno345-uuid"
}
```

### 11. Listar Logs de Auditoria

**Endpoint**: `GET /api/audit/logs?limit=50`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET "https://<seu-dominio>/api/audit/logs?limit=50" `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "logs": [
    {
      "id": "mno345-uuid",
      "userId": "def456-uuid",
      "action": "copy_attempt",
      "bookSlug": "vivencia_pombogira",
      "timestamp": "2025-01-23T14:30:00.000Z",
      "ipHash": "sha256hash...",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

### 12. Listar Logs por Livro

**Endpoint**: `GET /api/audit/book/[bookSlug]?limit=50`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET "https://<seu-dominio>/api/audit/book/vivencia_pombogira?limit=50" `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "logs": [
    {
      "id": "mno345-uuid",
      "userId": "def456-uuid",
      "action": "copy_attempt",
      "bookSlug": "vivencia_pombogira",
      "timestamp": "2025-01-23T14:30:00.000Z"
    }
  ]
}
```

### 13. Listar Logs por Usuário

**Endpoint**: `GET /api/audit/user/[userId]?limit=50`

**Autenticação**: Requer `X-Admin-Token` header.

**Request**:

```powershell
curl -X GET "https://<seu-dominio>/api/audit/user/def456-uuid?limit=50" `
  -H "X-Admin-Token: <ADMIN_TOKEN>"
```

**Response (200 OK)**:

```json
{
  "logs": [
    {
      "id": "mno345-uuid",
      "userId": "def456-uuid",
      "action": "copy_attempt",
      "bookSlug": "vivencia_pombogira",
      "timestamp": "2025-01-23T14:30:00.000Z"
    },
    {
      "id": "pqr678-uuid",
      "userId": "def456-uuid",
      "action": "print_blocked",
      "bookSlug": "guia_de_ervas",
      "timestamp": "2025-01-23T15:00:00.000Z"
    }
  ]
}
```

## Códigos de Erro

| Status | Erro | Descrição |
|--------|------|-----------|
| 400 | `missing_fields` | Campos obrigatórios ausentes (nome, CPF, email, etc.) |
| 400 | `invalid_cpf` | CPF inválido (não tem 11 dígitos) |
| 400 | `cpf_exists` | CPF já cadastrado |
| 400 | `email_exists` | Email já cadastrado |
| 401 | `invalid_credentials` | Email ou senha incorretos |
| 403 | `access_denied` | Sem permissão (admin token inválido ou grant revogado) |
| 403 | `inactive_user` | Usuário com status `inactive` |
| 404 | `user_not_found` | Usuário não encontrado |
| 405 | `method_not_allowed` | Método HTTP não suportado (ex: GET em /api/grants) |
| 500 | `internal_error` | Erro interno do servidor (verificar logs) |

## Notas de Segurança

- **CPF sempre mascarado**: Nenhum endpoint retorna CPF completo; formato `123***01`.
- **Senhas nunca expostas**: Armazenadas como bcrypt hash (10 rounds); nunca retornadas.
- **JWT HttpOnly**: Cookie `session` não acessível via JavaScript; previne XSS.
- **Admin token**: Deve ser mantido seguro; rotacionar periodicamente.
- **Rate limiting**: Considerar adicionar em produção para `/api/auth/login`.
