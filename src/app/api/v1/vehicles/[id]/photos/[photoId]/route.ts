import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "../../../../_lib/requireDealerMember";
import { deleteVehiclePhoto } from "@/modules/vehicles/services/vehiclePhotoService";

interface RouteContext {
  params: Promise<{ id: string; photoId: string }>;
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireDealerMember();
    const { photoId } = await params;
    await deleteVehiclePhoto(Number(photoId));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
