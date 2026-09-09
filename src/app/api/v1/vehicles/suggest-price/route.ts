import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "@/lib/api/v1/requireDealerMember";
import { fieldErrorsResponse } from "@/lib/api/v1/fieldErrorsResponse";
import { suggestVehiclePrice } from "@/modules/vehicles/services/priceSuggestionService";
import { priceSuggestionRequestSchema } from "@/modules/vehicles/utils/priceSuggestionSchema";

export async function POST(request: NextRequest) {
  try {
    await requireDealerMember();

    const body = await request.json();
    const parsed = priceSuggestionRequestSchema.safeParse(body);

    if (!parsed.success) {
      return fieldErrorsResponse(parsed.error);
    }

    const suggestion = await suggestVehiclePrice(parsed.data);
    return NextResponse.json(suggestion);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
