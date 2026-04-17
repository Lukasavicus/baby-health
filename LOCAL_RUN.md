# Rodar localmente

1. Na raiz do repositório: suba a API (veja as opções abaixo).
2. Em outro terminal: `cd app-design && npm run dev` (Vite dev server em `http://localhost:5173`).
3. Acesse `http://localhost:5173/login` e faça login com um dos usuários abaixo.

O front usa `app-design/.env.development` → `VITE_API_BASE_URL=http://localhost:8000` (o CORS do backend já inclui `http://localhost:5173`).

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
| `suely` | `davi123` | Suely | mãe |
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

## Seed via API (alternativa)

Com a API no ar e autenticado, você pode popular dados de demo via:

```bash
curl -X POST http://localhost:8000/api/setup/seed \
  -H "Authorization: Bearer <seu_token>"
```
