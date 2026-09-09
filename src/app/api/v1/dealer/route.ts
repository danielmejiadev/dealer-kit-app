import { type NextRequest, NextResponse } from "next/server";
import { requireDealerMember, authGuardErrorResponse } from "@/lib/api/v1/requireDealerMember";
import { fieldErrorsResponse } from "@/lib/api/v1/fieldErrorsResponse";
import { updateDealerTheme } from "@/modules/dealer/services/dealerService";
import { dealerThemeFormSchema } from "@/modules/dealer/utils/dealerThemeFormSchema";

export async function PATCH(request: NextRequest) {
  try {
    const { dealer } = await requireDealerMember();
    const body = await request.json();
    const parsed = dealerThemeFormSchema.safeParse(body);

    if (!parsed.success) {
      return fieldErrorsResponse(parsed.error);
    }

    const updatedDealer = await updateDealerTheme(dealer.id, parsed.data);
    return NextResponse.json(updatedDealer);
  } catch (error) {
    return (
      authGuardErrorResponse(error) ??
      NextResponse.json({ error: (error as Error).message }, { status: 500 })
    );
  }
}
