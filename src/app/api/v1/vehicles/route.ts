import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "@/lib/api/v1/vehicles/requireDealerMember";
import { isUniqueConstraintViolation } from "@/lib/api/v1/vehicles/postgresErrors";
import { createVehicle, listVehiclesForDealer } from "@/modules/vehicles/services/vehicleService";
import { vehicleFormSchema, vehicleFormValuesToInsert } from "@/modules/vehicles/utils/vehicleFormSchema";
import { fieldErrorsResponse } from "@/lib/api/v1/vehicles/fieldErrorsResponse";

export async function GET() {
  try {
    const { dealer } = await requireDealerMember();
    const vehicles = await listVehiclesForDealer(dealer.id);
    return NextResponse.json(vehicles);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { dealer } = await requireDealerMember();
    const body = await request.json();
    const parsed = vehicleFormSchema.safeParse(body);

    if (!parsed.success) {
      return fieldErrorsResponse(parsed.error);
    }

    const vehicle = await createVehicle(vehicleFormValuesToInsert(parsed.data, dealer.id));
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    const guardResponse = authGuardErrorResponse(error);
    if (guardResponse) return guardResponse;

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json({ error: "Ya existe un vehículo con esa placa." }, { status: 409 });
    }

    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
