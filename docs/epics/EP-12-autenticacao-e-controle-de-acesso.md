# EP-12 — Autenticação e Controle de Acesso

## Overview
| Field | Value |
|-------|-------|
| **Epic ID** | EP-12 |
| **Title** | Autenticação e Controle de Acesso |
| **Priority** | P0 (Highest) |
| **Status** | Not Started |
| **Owner** | Backend + Frontend Lead |
| **Milestone** | MVP Auth (Week 1-2) |

## Objective
Implementar sistema de autenticação com JWT no backend FastAPI, tela de login no frontend React, middleware de proteção de rotas, e migrar a organização de dados para modelo multi-perfil controlado por credenciais.

---

## Epic Scope

### What This Epic Covers
- User model and credential storage in JSON
- JWT-based authentication (login, token generation, validation)
- Protected route middleware on backend
- Login page on frontend
- Auth context and protected routes on frontend
- Data migration from env-var based profiles to login-based profiles
- Script simplification

### What This Epic Does NOT Cover
- User registration (admin creates users manually)
- OAuth / social login
- Role-based access control (RBAC)
- Multi-baby support per profile
- Password recovery flow

---

## Dependencies

### Upstream Dependencies
- **EP-01** — App shell and design system (for login page styling)
- **EP-02** — Data model and persistence layer (JSON repository)

### Blocking
- **Blocks:** All future multi-user features
- **Critical:** Without auth, data isolation between families is not possible

---

## Features & Work Breakdown

### FE-12.1 — Modelo de Usuário e Credenciais (P0)
**Objective:** Define user data model and create initial user credentials file.

#### User Stories
- **US-12.1.1** — Como administrador, eu quero que os usuários tenham credenciais armazenadas em arquivo JSON para autenticação simples.
  - Acceptance Criteria:
    - User model has id, username, hashed_password, profile_dir, caregiver_id, display_name
    - Passwords are hashed with bcrypt (never stored in plain text)
    - users.json exists at backend/data/ root with 3 pre-configured users
    - Each user maps to a profile directory and a caregiver ID

#### Tasks
- **TK-12.1.1** — Criar modelo Pydantic User em backend/models/auth.py
- **TK-12.1.2** — Criar backend/data/users.json com 3 usuários (gisele, suely, lucas)
- **TK-12.1.3** — Criar serviço backend/services/user_service.py
- **TK-12.1.4** — Implementar hashing de senhas com passlib/bcrypt

---

### FE-12.2 — Autenticação JWT no Backend (P0)
**Objective:** Implement JWT token generation and validation for API authentication.

#### User Stories
- **US-12.2.1** — Como cuidador, eu quero fazer login com username e senha para receber um token JWT.
  - Acceptance Criteria:
    - POST /api/auth/login accepts username and password
    - Returns JWT token on valid credentials
    - Returns 401 on invalid credentials
    - Token contains user_id, profile_dir, caregiver_id
    - Token expires after configurable time (default 24h)
    - GET /api/auth/me returns current user info from token

#### Tasks
- **TK-12.2.1** — Adicionar python-jose e passlib ao requirements.txt
- **TK-12.2.2** — Adicionar configurações JWT ao config.py
- **TK-12.2.3** — Criar serviço backend/services/auth_service.py
- **TK-12.2.4** — Criar router backend/routers/auth.py
- **TK-12.2.5** — Token JWT contém user_id, profile_dir, caregiver_id

---

### FE-12.3 — Middleware de Proteção de Rotas (P0, depends on FE-12.2)
**Objective:** Protect all API routes with JWT validation and resolve data directory from token.

#### User Stories
- **US-12.3.1** — Como sistema, eu quero que rotas protegidas rejeitem requisições sem token válido.
  - Acceptance Criteria:
    - All API routes (except /api/auth/login, /health, /docs) require valid JWT
    - Invalid/expired tokens return HTTP 401
    - Repository is instantiated with profile_dir from token
    - No global DATA_DIR env var needed anymore

#### Tasks
- **TK-12.3.1** — Criar dependency get_current_user em deps.py
- **TK-12.3.2** — Criar dependency get_profile_repository
- **TK-12.3.3** — Substituir get_repository em todos os routers
- **TK-12.3.4** — Manter rotas públicas (/api/auth/login, /health, /docs)
- **TK-12.3.5** — Retornar HTTP 401 para tokens inválidos/expirados

---

### FE-12.4 — Tela de Login (P0, depends on FE-12.2)
**Objective:** Create login page in the frontend with username/password form.

#### User Stories
- **US-12.4.1** — Como cuidador, eu quero uma tela de login para inserir minhas credenciais.
  - Acceptance Criteria:
    - Login page has username and password fields
    - Submit button triggers POST /api/auth/login
    - Error message shown for invalid credentials
    - Successful login redirects to Home (/)
    - Page follows existing design system (pastel colors, friendly typography)

#### Tasks
- **TK-12.4.1** — Criar componente LoginPage.tsx
- **TK-12.4.2** — Implementar chamada POST /api/auth/login
- **TK-12.4.3** — Exibir feedback visual de erro
- **TK-12.4.4** — Redirecionar para Home após login
- **TK-12.4.5** — Estilizar com design system existente

---

### FE-12.5 — Contexto de Autenticação (P0, depends on FE-12.4)
**Objective:** Manage user session in the frontend with auth context and protected routes.

#### User Stories
- **US-12.5.1** — Como cuidador, eu quero que minha sessão seja mantida no app até eu fazer logout.
  - Acceptance Criteria:
    - Token stored in localStorage
    - All API calls include Authorization: Bearer header
    - Unauthenticated users redirected to /login
    - Logout clears token and redirects to /login
    - caregiver_id derived from token, not manual localStorage
    - 401 responses trigger automatic redirect to /login

#### Tasks
- **TK-12.5.1** — Criar AuthContext e AuthProvider
- **TK-12.5.2** — Armazenar token JWT no localStorage
- **TK-12.5.3** — Atualizar client.ts com header Authorization: Bearer
- **TK-12.5.4** — Criar componente ProtectedRoute
- **TK-12.5.5** — Implementar logout
- **TK-12.5.6** — Derivar caregiver_id do token JWT
- **TK-12.5.7** — Tratar resposta 401 globalmente

---

### FE-12.6 — Migração de Dados e Scripts (P0)
**Objective:** Migrate data directory structure and simplify npm scripts.

#### User Stories
- **US-12.6.1** — Como desenvolvedor, eu quero que os dados do Davi estejam preservados e os scripts simplificados.
  - Acceptance Criteria:
    - davi_test/ renamed to davi/ with all data intact
    - npm scripts simplified (no profile-specific scripts)
    - LOCAL_RUN.md updated with login instructions
    - .env.example updated with JWT variables
    - DATA_DIR now points to backend/data root (profiles parent)

#### Tasks
- **TK-12.6.1** — Renomear davi_test/ para davi/
- **TK-12.6.2** — Remover scripts npm específicos de perfil
- **TK-12.6.3** — Simplificar package.json
- **TK-12.6.4** — Atualizar LOCAL_RUN.md
- **TK-12.6.5** — Atualizar .env.example com variáveis JWT
- **TK-12.6.6** — Atualizar config.py: DATA_DIR aponta para raiz de perfis

---

## Acceptance Criteria Summary

1. **Auth Backend:** Login endpoint works; JWT tokens generated and validated
2. **Protected Routes:** All API routes require valid JWT except login/health/docs
3. **Login Page:** Functional login form with error handling
4. **Session Management:** Token stored, used in all requests, logout works
5. **Data Migration:** Davi data preserved; scripts simplified
6. **Security:** Passwords hashed with bcrypt; tokens expire; no plain-text secrets

---

## Related Documents
- EP-01: Design system (login page styling)
- EP-02: Data model and persistence (JSON repository)
