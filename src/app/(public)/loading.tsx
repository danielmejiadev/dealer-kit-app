import { Skeleton } from "@/components/ui/Skeleton";

const SKELETON_CARD_INDEXES = [0, 1, 2, 3, 4, 5];

// Fallback de Suspense para este segmento mientras VehicleCatalogGrid
// resuelve dealer + vehículos + fotos en el servidor — convención de
// Next.js (`loading.js`), no un sistema de loading propio. Ver
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md.
export default function CatalogLoading() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {SKELETON_CARD_INDEXES.map((cardIndex) => (
        <div key={cardIndex} className="overflow-hidden rounded-lg bg-surface shadow-soft">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="flex flex-col gap-2 p-4">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
