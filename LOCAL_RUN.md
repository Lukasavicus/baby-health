# Rodar localmente

1. Na raiz do repositório: suba a API (veja as opções abaixo).
2. Em outro terminal: `cd app-design && npm run dev` (Vite dev server em `http://localhost:5173`).
3. Acesse `http://localhost:5173/login` e faça login com um dos usuários abaixo.

O front usa `app-design/.env.development` → `VITE_API_BASE_URL=http://127.0.0.1:8080` (evita reset no macOS; alinhado ao `PORT` da API). No `.env` da raiz, use `CORS_ALLOWED_ORIGINS` em **lista separada por vírgulas** (veja `.env.example`) para o preflight CORS não falhar.

## Scripts de API

Todos os comandos abaixo são executados **na raiz** do repositório.

| Comando | Catálogos UI (tipos, opções) | Uso |
|---------|------------------------------|-----|
| `npm run dev-api` | Vazio | Backend limpo |
| `npm run dev-api-seed` | Completos (`ui_app_defaults/`) | **Recomendado para desenvolvimento** |

### Recomendação

Use **`npm run dev-api-seed`** no dia a dia. Ele carrega todos os catálogos de UI (`backend/ui_app_defaults/`), garantindo que botões de tipo (alimentação, fralda, etc.) apareçam corretamente.

## Autenticação

O acesso à API é protegido por JWT. Para usar o app, faça login na tela inicial.

### Usuários disponíveis (perfil do Davi)

| Usuário | Senha | Cuidador | Papel |
|---------|-------|----------|-------|
| `gisele` | `davi123` | Gisele | babá |
| `suely` | `davi123` | Suely | avó |
| `lucas` | `davi123` | Lucas | pai |

Todos os usuários acessam o mesmo perfil de dados (Davi). O cuidador associado é definido automaticamente pelo login.

### Como funciona

1. `POST /api/auth/login` com `username` e `password` retorna um token JWT.
2. O frontend armazena o token no `localStorage` e o envia em todas as chamadas via header `Authorization: Bearer <token>`.
3. O backend valida o token e resolve o diretório de dados (`backend/data/<profile_dir>/`) automaticamente.
4. Rotas públicas: `/api/auth/login`, `/health`, `/docs`.

### Variáveis de ambiente JWT

| Variável | Default | Descrição |
|----------|---------|-----------|
| `JWT_SECRET` | Gerado automaticamente | Chave secreta para assinar tokens |
| `JWT_ALGORITHM` | `HS256` | Algoritmo de assinatura |
| `JWT_EXPIRY_MINUTES` | `1440` (24h) | Tempo de expiração do token |

## Feature flags (opcional)

Módulo desacoplado em `backend/feature_flags/`. **Desligado por padrão** (`FEATURE_FLAGS_ENABLED=0`). O backend carrega o arquivo **`.env` na raiz do repositório** ao importar `config` (antes de montar `Settings` e de registrar o router). Ao rodar **`pytest`**, esse carregamento é ignorado para não misturar variáveis do seu `.env` local com a suíte de testes. Coloque as variáveis nesse `.env` (não versionado); veja `.env.example`. Para ativar na API local:

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `FEATURE_FLAGS_ENABLED` | `1` | Registra o router em `/api/feature-flags/*` |
| `FEATURE_FLAGS_TOTP_SECRET` | saída de `openssl rand -base32 20` | Segredo Base32 para o Google Authenticator (gestão) |
| `FEATURE_FLAGS_STORE_PATH` | *(vazio)* | Caminho do JSON; default `backend/data/feature_flags/store.json` |

- **`GET /api/feature-flags/catalog`** — público; lista chaves e variantes.
- **`GET|POST /api/feature-flags/assignments`** — header **`X-TOTP-Code`** (nunca OTP na query string).
- **`GET /api/feature-flags/me`** — mesmo JWT do login; devolve variantes efetivas para o `profile_dir` do usuário.

No frontend: `fetchFeatureFlagCatalog()` e `fetchMyFeatureFlags()` em [`app-design/src/api/featureFlags.ts`](app-design/src/api/featureFlags.ts), e `getFeatureVariant()` em [`app-design/src/app/lib/featureFlags.ts`](app-design/src/app/lib/featureFlags.ts).

Guia completo (catálogo, perfis, API, front, checklist): [`docs/feature-flags.md`](docs/feature-flags.md).

## Seed via API (alternativa)

Com a API no ar e autenticado, você pode popular dados de demo via:

```bash
curl -X POST http://localhost:8080/api/setup/seed \
  -H "Authorization: Bearer <seu_token>"
```
