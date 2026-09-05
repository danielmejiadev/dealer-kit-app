import { Skeleton } from "@/components/ui/Skeleton";

const SKELETON_PHOTO_INDEXES = [0, 1];
const SKELETON_ATTRIBUTE_INDEXES = [0, 1, 2, 3, 4, 5];

// Fallback de Suspense propio de este segmento — sin esto, heredaría el
// `loading.tsx` del catálogo (grilla de tarjetas), que no calza con el
// layout de una ficha individual. Ver
// node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md.
export default function VehicleDetailLoading() {
  return (
    <article className="mx-auto flex max-w-4xl flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SKELETON_PHOTO_INDEXES.map((photoIndex) => (
          <Skeleton key={photoIndex} className="aspect-4/3 w-full rounded-lg" />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-7 w-1/3" />
      </div>

      <div className="rounded-lg bg-surface p-5 shadow-soft">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {SKELETON_ATTRIBUTE_INDEXES.map((attributeIndex) => (
            <div key={attributeIndex} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
