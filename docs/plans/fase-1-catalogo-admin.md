## Entregable final de este plan

Al terminar las dos fases de abajo, esto queda **en vivo** en
`dealer-kit-app.luisdanielmejia.workers.dev`, funcionando de verdad (no un
mockup):

- **Deploy automático**: cada push/merge a `main` publica solo, sin pasos
  manuales.
- **Catálogo público** (`/`): grid real de vehículos de "Mi Compraventa" (el
  único dealer que existe en esta fase) — foto, marca/línea/modelo, precio en
  COP, km, combustible, transmisión — con el color de acento y la tipografía
  del dealer aplicados. Solo se ven los vehículos en estado `published`.
- **Página de detalle** por vehículo (`/vehiculos/[id]`).
- **Login de admin** (`/admin/login`) por magic link — sin contraseña.
- **Panel admin** (`/admin`, protegido): lista de todos los vehículos (borrador,
  publicado, vendido, archivado) con su estado; crear un vehículo nuevo con un
  formulario que recoge los mismos campos de la tarjeta de propiedad
  colombiana; subir/borrar sus fotos; editar; borrar; cambiar su estado
  (publicar/despublicar) — y ese cambio se refleja de inmediato en el catálogo
  público.
- **Seguridad real, no solo de fachada**: verificado con RLS de Postgres — un
  visitante anónimo nunca ve borradores ni puede escribir nada; solo el dueño
  autenticado de ese dealer puede tocar sus propios vehículos.

**Explícitamente fuera de este entregable** (fases futuras, no se construyen
ahora): más de un dealer / multi-tenant real (Fase 2), pantalla para que el
dealer cambie su color/tipografía él mismo (Fase 2 — hoy el mecanismo de
renderizado existe pero se configura a mano en la BD), IA que arma la
publicación a partir de fotos (Fase 3), cobros/planes (Fase 4).

---

# Fase 0.5 — Formalizar deploy a Cloudflare Workers (antes de Fase 1)

## Contexto

El usuario ya conectó el repo de GitHub (`danielmejiadev/dealer-kit-app`) a un
Worker de Cloudflare (`dealer-kit-app`, en `dealer-kit-app.luisdanielmejia.workers.dev`)
y ya deployó 2 veces sin errores desde el dashboard. Pero: (a) no hay ningún
archivo de configuración commiteado en el repo — el build/bindings los generó
Cloudflare automáticamente al detectar Next.js, así que hoy es una caja negra
no reproducible localmente; (b) ambas versiones dicen "Manually deployed", no
"deployed from push" — el trigger de auto-deploy en push a `main` no está
confirmado. El objetivo de esta fase es que **commitear a `main` (o mergear a
`main`) despliegue solo**, de forma versionada y depurable.

Verificado contra la doc oficial de OpenNext (no memoria): los bindings que ya
aparecen en el dashboard (`ASSETS`, `IMAGES`, un service binding
`WORKER_SELF_REFERENCE`) coinciden exactamente con lo que genera
`@opennextjs/cloudflare` — confirma que la auto-detección de Cloudflare ya está
usando ese adaptador por debajo. `@cloudflare/next-on-pages` (mencionado en un
comentario viejo de `next.config.ts`) está deprecado y no se usa — ese
comentario hay que corregirlo.

**Decisión importante ligada a Fase 1**: no se crea `proxy.ts` para gatear
`/admin`. Next.js 16 fuerza `proxy.ts` a runtime `nodejs`, y hay un issue
abierto sin resolver (`cloudflare/workers-sdk#13755`) donde eso rompe con
`async_hooks` no disponible en Workers. Como ya establecimos que `proxy.ts`
sería solo conveniencia de UX (RLS es la seguridad real), el chequeo de sesión
se hace directo en `admin/layout.tsx` (Server Component) — evita el bug sin
perder nada.

## Cambios a commitear

- **`package.json`**: agregar `@opennextjs/cloudflare` (dependencies) y
  `wrangler` (devDependencies, ≥3.99.0). Scripts nuevos: `preview`, `deploy`,
  `upload` (todos `opennextjs-cloudflare build && opennextjs-cloudflare <cmd>`)
  y `cf-typegen` (`wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`).
- **`wrangler.jsonc`** (nuevo, raíz del repo):
  ```jsonc
  {
    "$schema": "node_modules/wrangler/config-schema.json",
    "main": ".open-next/worker.js",
    "name": "dealer-kit-app",
    "compatibility_date": "2026-09-04",
    "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
    "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
    "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "dealer-kit-app" }],
    "images": { "binding": "IMAGES" }
  }
  ```
  `name` debe ser exactamente `dealer-kit-app` para que los deploys actualicen
  el Worker que ya existe, no creen uno nuevo.
- **`open-next.config.ts`** (nuevo, raíz): `defineCloudflareConfig` con
  `r2IncrementalCache` (config estándar de OpenNext, del doc oficial).
- **`next.config.ts`**: corregir el comentario (ya no menciona
  `@cloudflare/next-on-pages`) y agregar `initOpenNextCloudflareForDev()` para
  que `pnpm dev` también use los bindings de Cloudflare en local.
- **`.gitignore`**: agregar `.open-next` y `.dev.vars` (este último es el
  equivalent de `.env.local` para `wrangler dev`, nunca se commitea).
- **Variables de entorno del Worker desplegado**: `NEXT_PUBLIC_SUPABASE_URL` y
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` como `vars` en `wrangler.jsonc` (no son
  secretas, van al cliente de todos modos); `SUPABASE_SERVICE_ROLE_KEY` **solo**
  como `wrangler secret put` — nunca en un archivo commiteado, mismo principio
  de confianza que ya rige en `AGENTS.md`.

## Lo que falta que confirme/haga el usuario (no lo puedo hacer yo desde aquí)

- **Autenticar `wrangler`**: correr `wrangler login` en una terminal real (no
  esta sesión, mismo motivo que con Supabase — necesita navegador), o generar
  un **API Token de Cloudflare** (My Profile → API Tokens, permiso
  "Edit Cloudflare Workers") y pasármelo para exportarlo como
  `CLOUDFLARE_API_TOKEN` — con eso sí puedo correr `wrangler deploy` y
  `wrangler secret put` yo mismo, sin login interactivo.
- **Confirmar "Auto-deploy on push"** en el dashboard del Worker (Settings →
  Build) para la rama `main` — no puedo verlo ni activarlo sin acceso.

## Verificación

Push de prueba a `main` con un cambio trivial (ej. un comentario) → confirmar
en el dashboard que aparece una versión nueva **no** etiquetada "Manually
deployed", sino disparada por el push, y que el sitio en
`dealer-kit-app.luisdanielmejia.workers.dev` refleja el cambio.

---

# Fase 1 — Catálogo público + panel admin (single-tenant)

## Contexto

El scaffold actual (`src/app`, `src/components/ui`, tokens de diseño, `lib/supabaseClient.ts`)
ya está commiteado ("Fase 1: scaffolding del app"), pero no existe ningún módulo de
producto todavía: `src/modules/`, `src/hooks/`, `src/services/`, `src/utils/` y
`src/app/api/` no existen, y el proyecto de Supabase está completamente vacío (0
tablas, 0 migraciones, confirmado por MCP). Esta es la primera pieza real de
producto: un catálogo público de vehículos (grid) y un panel admin con CRUD manual,
para **un solo** dealer (el multi-tenant real es Fase 2), pero modelando el dato
desde ya con una tabla `dealers` para no tener que migrar el esquema después.

La IA de foto→ficha es Fase 3 — el formulario admin de esta fase es 100% manual,
pero recoge exactamente los mismos campos que trae la tarjeta de propiedad
colombiana, para que Fase 3 no requiera cambiar el esquema.

Investigado y verificado contra la versión real instalada (Next 16.3.4 rompe el
soporte síncrono de `params`/`searchParams`/`context.params`; `middleware.ts` se
renombró a `proxy.ts`) y contra los docs vivos de Supabase vía MCP (`getClaims()`
es el método actual recomendado para gatear rutas en `proxy.ts`, coincide con que
el usuario ya tiene `SUPABASE_JWKS_URL` — su proyecto usa firma asimétrica de JWT).

## Esquema de base de datos (migración `supabase/migrations/0001_create_core_schema.sql`)

Tablas: `dealers`, `dealer_members`, `vehicles`, `vehicle_photos` + bucket de
Storage `vehicle-photos`. PKs `bigint generated always as identity` (no UUID v4).

- **`dealers`**: `id`, `name`, `slug` (unique), `theme jsonb` (ver abajo),
  `contact_phone/email/whatsapp`, `city`, `address`, timestamps. Se siembra una
  sola fila (`'Mi Compraventa'`, slug `'default'`).
- **`dealers.theme`** — jsonb, no tabla aparte (mismo ciclo de vida y RLS que el
  resto de `dealers`, se lee siempre junto con el dealer, nunca se filtra por
  separado — separarlo en otra tabla sería normalizar sin beneficio real).
  Shape actual, validado con un `CHECK` a nivel de Postgres (no "lo que sea"):
  ```sql
  theme jsonb not null default
    '{"accentColorHex":"#b8842e","headingFont":"inter","bodyFont":"inter"}'::jsonb,
  constraint dealers_theme_shape check (
    theme ? 'accentColorHex' and theme->>'accentColorHex' ~ '^#[0-9a-fA-F]{6}$'
    and theme->>'headingFont' in ('inter','ibm-plex-sans','sora','fraunces')
    and theme->>'bodyFont' in ('inter','ibm-plex-sans','sora')
  )
  ```
  Tipografía limitada a una lista curada (no texto libre) porque las fuentes se
  cargan en build-time vía `next/font/google` — no se puede pedir una fuente de
  Google arbitraria en tiempo de request. Logo y color secundario quedan fuera
  de esta migración a propósito: al ser jsonb, agregarlos después es extender
  el `CHECK` en una migración nueva, no rediseñar el esquema.
- **`dealer_members`**: `dealer_id` → `dealers`, `user_id` → `auth.users`, `role`
  (`owner`|`admin`). Es el join tenant↔usuario que Fase 2 necesita igual — se
  construye ya para no renombrar `profiles` después.
- **`vehicles`**: `dealer_id`, `status` (`draft`|`published`|`sold`|`archived`),
  `placa` (check de formato colombiano: `ABC123` o `ABC12A`, unique por dealer),
  `marca`, `linea`, `modelo` (smallint), `color`, `cilindraje` (nullable, para
  eléctricos), `clase_vehiculo`, `combustible`, `transmision`, `kilometraje`,
  `precio_cop` (bigint, sin decimales), `descripcion`, timestamps +
  `published_at`. Índice parcial `(dealer_id, published_at desc) where status =
  'published'` para el catálogo público.
- **`vehicle_photos`**: `vehicle_id`, `storage_path`, `position` — tabla propia
  (no `photo_urls text[]`) para que Fase 3 pueda anotar por-foto (cuál es la
  tarjeta de propiedad, estado de procesamiento) sin romper el esquema.
- Trigger compartido `set_updated_at()` en `dealers` y `vehicles`.
- Bucket `vehicle-photos` público en lectura (catálogo usa `<img src>` directo,
  sin URLs firmadas); escritura sigue gateada por RLS de `storage.objects`.

## RLS (misma migración)

Función helper `private.is_dealer_member(dealer_id)` (y su variante por
`vehicle_id`) en un schema `private` no expuesto, `security definer`,
`set search_path = ''`, `execute` revocado a `anon`/`public`, otorgado solo a
`authenticated` — sigue el checklist de seguridad del skill de Supabase (nunca
`security definer` sin `auth.uid()` adentro, nunca en `public`).

- `dealers`: lectura pública (`anon`+`authenticated`, el storefront necesita el
  nombre/contacto); update solo para miembros del dealer. Sin insert/delete —
  provisionar dealers nuevos es Fase 2.
- `dealer_members`: cada usuario solo ve su propia fila de membresía.
- `vehicles`: lectura pública solo `status = 'published'`; miembros ven/crean/
  editan/borran todo lo de su propio dealer (`with check` en update, como exige
  el checklist para no permitir reasignar `dealer_id`).
- `vehicle_photos`: espejo de `vehicles` (público ve fotos de vehículos
  publicados; miembros gestionan las de su dealer).
- `storage.objects` del bucket `vehicle-photos`: insert/update/delete solo si el
  primer segmento de la ruta (`{dealer_id}/...`) coincide con un dealer del que
  el usuario es miembro.

## Autenticación del admin

**Magic link** (`signInWithOtp`), no password — un dueño de compraventa que entra
pocas veces por semana no necesita gestión de contraseñas ni flujo de reset.

**Gateo: `proxy.ts`** en la raíz del repo (reemplazo de `middleware.ts` en Next
16), `matcher: ["/admin/:path*"]` — no corre en el catálogo público. Llama
`supabase.auth.getClaims()` inmediatamente después de crear el cliente (sin
código entre medio, por la advertencia explícita de los docs de Supabase) y
redirige a `/admin/login` si no hay claims. Esto es solo conveniencia de UX — la
seguridad real la sigue haciendo RLS.

Flujo respetando "hooks nunca llaman a Supabase directo": `LoginForm` → hook →
`POST /api/v1/auth/magic-link` → `authService.sendMagicLink()`. El único punto
que rompe la convención `api/v1` a propósito es `GET /auth/callback` — es un
redirect de navegador desde el correo, no un `fetch()` de un hook, así que
`services/authService.ts:exchangeMagicLinkCode()` se llama ahí directamente.

**Paso manual único de Fase 1** (no hay UI de provisioning todavía): después del
primer login por magic link, hay que insertar a mano la fila de
`dealer_members` con `execute_sql` para vincular ese usuario al dealer sembrado
— si no, autentica pero no ve ni puede escribir nada (RLS lo bloquea).

## Resolución de dealer (aclaración: no hay ruteo multi-tenant en Fase 1)

`dealerService.getCurrentDealer()` hace literal `select * from dealers limit 1`
— Fase 1 es una sola compraventa, no hay forma de "entrar" a la de otra porque
no existe ninguna otra. El `slug` en el esquema ya deja la puerta abierta para
Fase 2 (ruteo por subdominio, ej. `eldorado.dealerkit.co`, resuelto en
`proxy.ts` — coherente con el pitch de "tu propia compraventa" en vez de un
listado dentro de un sitio compartido), pero esa resolución por slug/subdominio
es explícitamente trabajo de Fase 2, no de esta.

## Estructura de módulos

```
src/
  utils/color.ts                      # deriveAccentTokens(hex) — puro
  utils/currency.ts                   # formatCOP(value) — puro
  modules/
    dealer/services/dealerService.ts
    dealer/utils/theme.ts             # DealerTheme type + parseDealerTheme() —
                                       # valida/normaliza el jsonb (defaults si
                                       # faltan llaves, descarta llaves
                                       # desconocidas), mapea headingFont/
                                       # bodyFont a los --font-* de next/font
    dealer/components/TenantThemeProvider.tsx   # Server Component, setea
                                       # --tenant-accent/-accent-ink (via
                                       # utils/color.ts) y --tenant-font-
                                       # heading/-body (via dealer/utils/theme.ts)
    auth/services/authService.ts
    auth/hooks/{useLoginWithMagicLink,useLogout}.ts
    auth/components/LoginForm.tsx
    vehicles/services/{vehicleService,vehiclePhotoService}.ts
    vehicles/utils/{vehicleValidation,vehicleOptions}.ts
    vehicles/hooks/{useVehicles,useVehicle,useCreateVehicle,useUpdateVehicle,useDeleteVehicle,useUploadVehiclePhoto,useDeleteVehiclePhoto}.ts
    vehicles/components/public/{VehicleCatalogGrid,VehicleCard(+.module.css),VehicleDetail}.tsx
    vehicles/components/admin/{VehicleAdminList,VehicleForm,VehiclePhotoUploader,DeleteVehicleModal}.tsx
  app/
    (public)/layout.tsx + page.tsx + vehiculos/[id]/page.tsx
    admin/layout.tsx + login/page.tsx + page.tsx + vehiculos/nuevo/page.tsx + vehiculos/[id]/editar/page.tsx
    auth/callback/route.ts
    api/v1/auth/{magic-link,logout}/route.ts
    api/v1/vehicles/route.ts, [id]/route.ts, [id]/photos/route.ts, [id]/photos/[photoId]/route.ts
proxy.ts
```

Patrón de primera carga del admin: `page.tsx` (Server Component, delgado) →
componente en `modules/vehicles/components/admin/` llama
`vehicleService.listVehiclesForDealer()` directo → pasa el resultado como
`initialData` al Client Component `VehicleAdminList`, que usa
`useVehicles(initialData)`. Las escrituras posteriores van por
`api/v1/vehicles` normal.

Toda ruta bajo `api/v1/**`: `createServerSupabaseClient()` → `getClaims()` (401
si falta) → `getCurrentDealerMember()` (403 si falta) → parsear/validar con
`vehicleValidation.ts` (sin zod, no está instalado) → llamar al service →
mapear `23505` (placa duplicada) a 409. `context.params` siempre `await`eado.

**Tipografía por tenant — mismo patrón de indirección que ya existe para el
color de acento:** `src/app/layout.tsx` precarga vía `next/font/google` las 4
fuentes curadas (Inter ya existe; se agregan IBM Plex Sans, Sora, Fraunces),
cada una con su propia variable (`--font-sora`, etc.). `tokens/typography.css`
gana `--font-heading: var(--tenant-font-heading, var(--font-sans))` junto al
`--font-sans`/`--font-mono` que ya existen — mismo mecanismo que
`--color-accent: var(--tenant-accent, #b8842e)`. `TenantThemeProvider` traduce
`theme.headingFont`/`theme.bodyFont` (los slugs guardados en la BD) a la
variable CSS real correspondiente y la fija inline, igual que ya hace con el
acento. No hay UI de admin para elegir tipografía/color en esta fase — el
mecanismo de renderizado queda listo, la pantalla para que el dealer lo cambie
él mismo es Fase 2 ("personalización" en el roadmap).

## Reutilización de UI existente (no recrear)

`Button`, `Input`, `Card`, `Badge`, `Modal`, `Select`, `Toast`/`useToast` de
`src/components/ui/` (ver inventario ya hecho) cubren todo lo necesario:
`VehicleAdminList` usa `Badge` por estado + `Button variant="ghost"` en acciones
de fila; `VehicleForm` usa `Input`/`Select` agrupados por los campos de la
tarjeta de propiedad; `DeleteVehicleModal` envuelve `Modal`; feedback de
create/update/delete vía `useToast()`. Único componente bespoke real:
`VehicleCard` + `VehicleCard.module.css` (aspect-ratio de foto + hover).

## Secuencia de construcción y verificación

1. **Esquema + RLS**: iterar DDL con `execute_sql`, correr `get_advisors` hasta
   estar limpio, crear bucket + políticas de storage, sembrar el dealer.
   Verificar como `anon`: 0 filas visibles hasta publicar una vía `execute_sql`.
   Confirmar con `apply_migration` + `list_migrations`.
2. **Services + lib**: `generate_typescript_types` → `src/lib/database.types.ts`,
   luego `dealerService`, `authService`, `vehicleService`, `vehiclePhotoService`,
   `utils/color.ts`, `utils/currency.ts`.
3. **Lectura pública**: layout + página + `VehicleCatalogGrid` + `VehicleCard`.
   Verificar con `pnpm dev`: `/` muestra solo publicados, color de acento
   aplicado.
4. **Auth admin**: `proxy.ts`, login, callback, rutas de auth. Verificar:
   `/admin` sin sesión redirige; el magic link completa el login; logout
   redirige de vuelta.
5. **Escritura admin**: CRUD completo + fotos, hooks, componentes admin.
   Verificar: crear→publicar un vehículo y que aparezca en `/` (paso 3);
   `GET /api/v1/vehicles` sin sesión devuelve 401.
6. **Pulido**: página de detalle, estados de loading/vacío/error, `pnpm build`
   + `pnpm lint` limpios.
