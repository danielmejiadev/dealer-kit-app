# DealerKit — app

El producto real: catálogo público + panel de administración (con AI de
precio sugerido) para compraventas de vehículos en Colombia. Repo separado
de la landing de marketing (`dealerkit`/`tucompraventa`), donde se validó
la propuesta y se diseñó toda la arquitectura de este repo.

Ver `AGENTS.md` para las convenciones de código, la arquitectura de capas
(Server Components + `services/` + Route Handlers), y el design kit —
todo lo que se decide ahí aplica siempre, sin excepción.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, design kit propio en `src/styles/`
- Supabase (Postgres, Auth, Storage) — ver `src/lib/supabaseClient.ts`
- `@base-ui/react` como base de accesibilidad para Modal/Select/Toast
- `@tanstack/react-query` para datos que el cliente pide después de la
  carga inicial

## Desarrollo local

```bash
pnpm install
cp .env.local.example .env.local   # y llenar con las keys reales
pnpm dev
```

## Estado

Fase 1 (scaffolding) en curso. Ver el plan completo:
https://claude.ai/code/artifact/40cd00d6-2e72-4e9d-ab4a-7b700e2e5fef
