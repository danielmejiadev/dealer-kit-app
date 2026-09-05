import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "../../../_lib/requireDealerMember";
import { listPhotosForVehicle, uploadVehiclePhoto } from "@/modules/vehicles/services/vehiclePhotoService";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireDealerMember();
    const { id } = await params;
    const photos = await listPhotosForVehicle(Number(id));
    return NextResponse.json(photos);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    const { dealer } = await requireDealerMember();
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Falta el archivo de la foto." }, { status: 400 });
    }

    const photo = await uploadVehiclePhoto(dealer.id, Number(id), file);
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
