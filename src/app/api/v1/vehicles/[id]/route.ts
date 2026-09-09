import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "@/lib/api/v1/requireDealerMember";
import { isUniqueConstraintViolation } from "@/lib/api/v1/vehicles/postgresErrors";
import { deleteVehicle, getVehicleById, setVehicleStatus, updateVehicle } from "@/modules/vehicles/services/vehicleService";
import {
  isValidVehicleStatus,
  vehicleFormSchema,
  vehicleFormValuesToUpdate,
} from "@/modules/vehicles/utils/vehicleFormSchema";
import { fieldErrorsResponse } from "@/lib/api/v1/fieldErrorsResponse";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireDealerMember();
    const { id } = await params;
    const vehicle = await getVehicleById(Number(id));

    if (!vehicle) {
      return NextResponse.json({ error: "Vehículo no encontrado." }, { status: 404 });
    }

    return NextResponse.json(vehicle);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireDealerMember();
    const { id } = await params;
    const vehicleId = Number(id);
    const body = (await request.json()) as Record<string, unknown>;

    // Quick status change from the admin list: body only carries `status`, none of the rest of the form.
    if (Object.keys(body).length === 1 && "status" in body) {
      if (!isValidVehicleStatus(body.status)) {
        return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
      }
      const vehicle = await setVehicleStatus(vehicleId, body.status);
      return NextResponse.json(vehicle);
    }

    const parsed = vehicleFormSchema.safeParse(body);

    if (!parsed.success) {
      return fieldErrorsResponse(parsed.error);
    }

    const vehicle = await updateVehicle(vehicleId, vehicleFormValuesToUpdate(parsed.data));
    return NextResponse.json(vehicle);
  } catch (error) {
    const guardResponse = authGuardErrorResponse(error);
    if (guardResponse) return guardResponse;

    if (isUniqueConstraintViolation(error)) {
      return NextResponse.json({ error: "Ya existe un vehículo con esa placa." }, { status: 409 });
    }

    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireDealerMember();
    const { id } = await params;
    await deleteVehicle(Number(id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
