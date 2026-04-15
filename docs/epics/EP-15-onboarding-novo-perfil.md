# EP-15 — Onboarding e criação de novo perfil

| Field | Value |
|-------|-------|
| **Epic ID** | EP-15 |
| **Priority** | P0 |
| **Status** | Delivered (MVP) |

## Goal

Permitir que um novo cuidador crie **conta** (email único, senha, nome, papel) + **perfil de dados** (`profile_dir`) + **bebé** e **cuidador primário**, com fluxo guiado em passos e verificação de email **mock** (código fixo em modo demo).

## Features

| ID | Title |
|----|--------|
| FE-15.1 | Wizard em carrossel com validação por passo |
| FE-15.2 | Passo 1 — Valor do produto (highlights) |
| FE-15.3 | Passo 2 — Conta (email, nome, papel, senha) |
| FE-15.4 | Passo 3 — Verificação mock (6 dígitos) |
| FE-15.5 | Passo 4 — Dados do bebé (nome, género opcional, data, peso/altura opcionais, foto opcional) |
| FE-15.6 | Passo 5 — Loader final + provisionamento + login |
| FE-15.7 | API `/api/onboarding/*` + `OnboardingService` |

## Stories

- **US-15.1** — Como novo cuidador, quero um passo-a-passo claro até à primeira sessão autenticada.
- **US-15.2** — Como sistema, quero email único e código de verificação controlado por env para não aceitar `123456` em produção sem flag explícita.

## Tasks (implementação)

- TK-15.1 — Modelos `OnboardingCompleteRequest`, `Baby.gender`, `CaregiverRole` alargado, `UserService.create_user` / `email_taken`.
- TK-15.2 — `OnboardingService` (JSON local + GCS), `merge_baby_ui_state` para entrada inicial de crescimento opcional.
- TK-15.3 — Router `onboarding.py` e registo em `main.py`.
- TK-15.4 — Frontend: `OnboardingWizard`, rotas `/onboarding`, API client, link em `LoginPage`.
- TK-15.5 — `AuthContext.setSession` + JWT `display_name` opcional.
- TK-15.6 — Documentação de env: `DEBUG` ou `BABYHEALTH_ALLOW_MOCK_EMAIL_CODE=1` para código demo `123456`.

## Referências de código

- Backend: [`backend/routers/onboarding.py`](../../backend/routers/onboarding.py), [`backend/services/onboarding_service.py`](../../backend/services/onboarding_service.py), [`backend/models/onboarding.py`](../../backend/models/onboarding.py)
- Frontend: [`app-design/src/app/components/onboarding/OnboardingWizard.tsx`](../../app-design/src/app/components/onboarding/OnboardingWizard.tsx)
