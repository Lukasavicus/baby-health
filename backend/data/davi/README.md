# Davi — dataset de teste

Arquivos no formato do [`JsonRepository`](../../repositories/json_repository.py): `babies.json`, `caregivers.json`, `events.json`, `medications.json`. A subpasta **`images/`** guarda uploads da API (`POST /api/media/upload`) para este perfil; `baby.photo_url` pode apontar para `/api/media/...`.

- **Bebê:** Davi, nascimento `2025-09-07`, id `baby-davi-1`.
- **Cuidadora:** Giseli (babá), id `cg-giseli-1`.
- **Eventos:** mistura de (1) export estruturado em `INPUTS/davizinho_events_structured.json` (fev/2026 e 2026-04-02) e (2) blocos do WhatsApp mapeados para 2026-03-25 … 2026-03-31. As datas do chat sem dia civil foram atribuídas por convenção.

**Usar com a API:** defina `DATA_DIR` para esta pasta ao subir o backend (caminho absoluto ou relativo ao diretório de trabalho do processo), por exemplo a partir de `backend/`:

```bash
DATA_DIR="$(pwd)/data/davi_test" python3 main.py
```

**Bootstrap:**

```bash
curl -s "http://localhost:8000/api/ui/bootstrap"
```

**app-design:** apenas `VITE_API_BASE_URL` apontando para a API; não há variável de perfil no front — o dataset é sempre o `DATA_DIR` do processo da API.

**Contagem:** 124 eventos no `events.json`.
