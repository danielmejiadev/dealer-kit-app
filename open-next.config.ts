import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Sin incrementalCache de R2 por ahora: esta app no usa ISR (todo se lee de
// Supabase por request, sin `revalidate`), así que no vale la pena depender
// de un bucket de R2 que aún no existe. Si Fase 2+ agrega páginas con ISR,
// crear el bucket (`wrangler r2 bucket create <nombre>`), agregar el binding
// `NEXT_INC_CACHE_R2_BUCKET` a wrangler.jsonc, y volver a poner
// r2IncrementalCache aquí.
export default defineCloudflareConfig({});
