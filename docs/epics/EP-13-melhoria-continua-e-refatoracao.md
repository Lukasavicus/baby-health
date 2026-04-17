# EP-13 — Melhoria Contínua e Refatoração

| Field | Value |
|-------|-------|
| **Epic ID** | EP-13 |
| **Priority** | P1 |
| **Status** | In Progress |

## Objetivo

Estabelecer um ciclo contínuo de melhoria de qualidade, legibilidade e manutenibilidade do código-fonte, sem alterar funcionalidades visíveis ao usuário. Inclui remoção de código morto, extração de componentes reutilizáveis, aplicação de princípios SOLID/Clean Code e redução de duplicação.

## Escopo

- Limpeza de código morto e dependências não utilizadas
- Extração de componentes e hooks reutilizáveis
- Quebra de arquivos grandes em módulos coesos
- Centralização de constantes e utilitários duplicados
- Melhoria progressiva de tipagem (substituir `any` por tipos concretos)
- Padronização de padrões de UI (drawers, charts, listas)

## Princípios norteadores

1. **Navalha de Occam** — Preferir a solução mais simples que resolve o problema
2. **SRP** — Cada arquivo/componente tem uma única responsabilidade
3. **DRY** — Eliminar duplicação extraindo abstrações compartilhadas
4. **OCP** — Facilitar adição de novos trackers sem copiar centenas de linhas
5. **Não fazer** — Não introduzir state management externo, SSR, ou abstrações genéricas prematuras

## Features

| Feature | Descrição |
|---------|-----------|
| [FE-13.1](../features/FE-13.1-limpeza-codigo-morto.md) | Limpeza de código morto e duplicações |
| [FE-13.2](../features/FE-13.2-componentes-reutilizaveis.md) | Componentes reutilizáveis (WeekBarChart, TrackerDrawer, EventLogList) |
| [FE-13.3](../features/FE-13.3-hooks-compartilhados.md) | Hooks compartilhados (useTrackerEvents) |
| [FE-13.4](../features/FE-13.4-quebra-arquivos-grandes.md) | Quebra de arquivos grandes em módulos |
| [FE-13.5](../features/FE-13.5-tipagem-e-higiene.md) | Tipagem e higiene de código |

## Impacto estimado

| Métrica | Antes | Depois |
|---------|-------|--------|
| Linhas em `pages/` | ~9.500 | ~5.500 (-40%) |
| Arquivos em `ui/` | 48 | 6-8 |
| Implementações de chart semanal | 7 | 1 componente |
| Boilerplate drawer | 16 cópias | 1 wrapper |
| `eventMappers.ts` | 729 linhas | ~6 módulos, ~120 linhas cada |
| `LogSheet.tsx` | 826 linhas | ~200 (orquestrador) + 7 forms |

## QA / Definition of Done

- `npm run build` passa sem erros após cada fase
- Zero regressão visual nas páginas existentes
- Nenhuma funcionalidade removida ou alterada
