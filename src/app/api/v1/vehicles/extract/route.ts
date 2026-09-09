import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "@/lib/api/v1/requireDealerMember";
import {
  extractVehicleFromPhotos,
  type VehicleExtractionImageMediaType,
  type VehicleExtractionPhoto,
} from "@/modules/vehicles/services/vehicleExtractionService";

const MAX_PHOTOS = 6;
const ACCEPTED_MEDIA_TYPES = new Set<VehicleExtractionImageMediaType>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function isAcceptedMediaType(mediaType: string): mediaType is VehicleExtractionImageMediaType {
  return ACCEPTED_MEDIA_TYPES.has(mediaType as VehicleExtractionImageMediaType);
}

export async function POST(request: NextRequest) {
  try {
    await requireDealerMember();

    const formData = await request.formData();
    const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "Sube al menos una foto." }, { status: 400 });
    }
    if (files.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `Sube máximo ${MAX_PHOTOS} fotos.` }, { status: 400 });
    }

    const photos: VehicleExtractionPhoto[] = [];
    for (const file of files) {
      if (!isAcceptedMediaType(file.type)) {
        return NextResponse.json({ error: `Tipo de archivo no soportado: ${file.type}` }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      photos.push({ base64: buffer.toString("base64"), mediaType: file.type });
    }

    const extraction = await extractVehicleFromPhotos(photos);
    return NextResponse.json(extraction);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
