# Rodar localmente

1. Na raiz do repositório: suba a API (veja as opções abaixo).
2. Em outro terminal: `cd app-design && npm run dev` (Vite dev server em `http://localhost:5173`).

O front usa `app-design/.env.development` → `VITE_API_BASE_URL=http://localhost:8000` (o CORS do backend já inclui `http://localhost:5173`).

## Scripts de API

Todos os comandos abaixo são executados **na raiz** do repositório.

| Comando | Dados (bebê/eventos) | Catálogos UI (tipos, opções) | Uso |
|---------|----------------------|------------------------------|-----|
| `npm run dev-api` | Vazio (`backend/data/`) | Vazio | Backend limpo |
| `npm run dev-api-seed` | Vazio | Completos (`ui_app_defaults/`) | Testar UI sem dados reais |
| `npm run dev-api-davi` | Davi + Giseli + eventos | Vazio | Testar dados sem catálogos |
| `npm run dev-api-davi-seed` | Davi + Giseli + eventos | Completos | **Recomendado para desenvolvimento** |

### Recomendação

Use **`npm run dev-api-davi-seed`** no dia a dia. Ele combina os dados de exemplo do Davi (`backend/data/davi_test/`) com todos os catálogos de UI (`backend/ui_app_defaults/`), garantindo que botões de tipo (alimentação, fralda, etc.) e dados do bebê apareçam juntos.

### Seed via API (alternativa)

Com qualquer variante da API no ar, você também pode popular dados de demo via:

```bash
curl -X POST http://localhost:8000/api/setup/seed
```

Isso cria bebê, cuidadores e eventos no JSON store ativo (não afeta catálogos de UI).
