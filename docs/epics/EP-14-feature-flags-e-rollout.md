# EP-14 — Feature flags e rollout

| Field | Value |
|-------|-------|
| **Epic ID** | EP-14 |
| **Priority** | P1 |
| **Status** | In Review |

## Objetivo

Disponibilizar um catálogo de feature flags servido pela API, com overrides persistidos por `profile_dir`, proteção TOTP para gestão administrativa, e consumo no frontend para rollout gradual na Home **Hoje** (trackers e secções condicionais ao perfil).

## Escopo

- Backend: router `/api/feature-flags`, store JSON, constantes, integração em `main.py`, testes automatizados
- Frontend: cliente HTTP, contexto de bootstrap, `TodayPage` / `TodayTrackerGrid` / `TodayHealthSection` condicionais
- DevEx: `python-dotenv`, exemplos `.env`, portas e hosts alinhados (`127.0.0.1`, `8080`), documentação operacional

## Features

| Feature | Descrição |
|---------|-----------|
| [FE-14.1](../features/FE-14.1-backend-feature-flags.md) | Backend do módulo de feature flags |
| [FE-14.2](../features/FE-14.2-frontend-rollout-hoje.md) | Rollout na UI da Home Hoje |
| [FE-14.3](../features/FE-14.3-devex-e-documentacao.md) | DevEx, env e documentação |

## Notas

- Overrides locais em `backend/data/feature_flags/` (ficheiro ignorado pelo Git quando aplicável); defaults versionados no código.
- Para atividade V1 vs V2, ver também [TK-13.1.2](../tasks/TK-13.1.2-resolver-activity-v1-v2.md) e o épico [EP-13](EP-13-melhoria-continua-e-refatoracao.md).
