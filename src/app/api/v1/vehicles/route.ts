import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "../_lib/requireDealerMember";
import { isUniqueConstraintViolation } from "../_lib/postgresErrors";
import { createVehicle, listVehiclesForDealer } from "@/modules/vehicles/services/vehicleService";
import {
  validateVehicleForm,
  vehicleFormValuesToInsert,
  type VehicleFormValues,
} from "@/modules/vehicles/utils/vehicleValidation";

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
    const values = (await request.json()) as VehicleFormValues;
    const { valid, errors } = validateVehicleForm(values);

    if (!valid) {
      return NextResponse.json({ error: "Datos inválidos.", fieldErrors: errors }, { status: 400 });
    }

    const vehicle = await createVehicle(vehicleFormValuesToInsert(values, dealer.id));
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
