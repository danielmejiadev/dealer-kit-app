import type Anthropic from "@anthropic-ai/sdk";
import { createAnthropicClient } from "@/lib/anthropicClient";
import {
  priceSuggestionResponseSchema,
  type PriceSuggestionValues,
  type PriceSuggestionResult,
} from "../utils/priceSuggestionSchema";
import { CLASE_VEHICULO_LABELS, COMBUSTIBLE_LABELS, TRANSMISION_LABELS } from "../utils/vehicleOptions";

const PRICE_SUGGESTION_SYSTEM_PROMPT = `Eres un tasador de vehículos usados en el mercado colombiano en 2026. Con los datos de un vehículo que te dan, usa la herramienta de búsqueda web para investigar precios reales de vehículos comparables — nunca inventes un número sin haber buscado — y sugiere un precio de venta razonable en pesos colombianos (COP).

Termina tu respuesta con un bloque \`\`\`json con exactamente esta forma, y nada más después de ese bloque:
{"suggestedPriceCop": <número entero en COP, sin puntos ni comas>, "rationale": "<explicación breve, 2-3 frases, en español, mencionando en qué te basaste>"}`;

// No structured-output support alongside server-side tools yet, so the
// contract is a ```json fence at the end of the final assistant text —
// parsed defensively below since a free-text tail isn't schema-enforced.
// A fresh literal (not a shared const) at each call site so TypeScript
// infers the tool union's literal type instead of widening to `string`.
function webSearchTool() {
  return [{ type: "web_search_20260209" as const, name: "web_search" as const }];
}

function buildUserPrompt(vehicle: PriceSuggestionValues): string {
  const claseLabel = CLASE_VEHICULO_LABELS[vehicle.claseVehiculo];
  const combustibleLabel = COMBUSTIBLE_LABELS[vehicle.combustible];
  const transmisionLabel = TRANSMISION_LABELS[vehicle.transmision];

  return `Vehículo: ${vehicle.marca} ${vehicle.linea} ${vehicle.modelo}, color ${vehicle.color}, ${vehicle.kilometraje} km, clase ${claseLabel}, combustible ${combustibleLabel}, transmisión ${transmisionLabel}. Busca precios de vehículos comparables en el mercado colombiano de segunda mano y sugiere un precio de venta en COP.`;
}

function parseSuggestionFromText(text: string): PriceSuggestionResult | null {
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
  const rawJson = jsonBlockMatch?.[1] ?? text;

  try {
    const parsedJson: unknown = JSON.parse(rawJson);
    const result = priceSuggestionResponseSchema.safeParse(parsedJson);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export async function suggestVehiclePrice(vehicle: PriceSuggestionValues): Promise<PriceSuggestionResult> {
  const client = createAnthropicClient();
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: buildUserPrompt(vehicle) }];

  let response = await client.messages.create({
    model: "claude-opus-5",
    max_tokens: 4096,
    system: PRICE_SUGGESTION_SYSTEM_PROMPT,
    tools: webSearchTool(),
    messages,
  });

  // Server-side web search runs its own sampling loop capped at 10
  // iterations; pause_turn means it hit that cap mid-research, not that
  // anything went wrong — resend as-is to let it continue.
  while (response.stop_reason === "pause_turn") {
    messages.push({ role: "assistant", content: response.content });
    response = await client.messages.create({
      model: "claude-opus-5",
      max_tokens: 4096,
      system: PRICE_SUGGESTION_SYSTEM_PROMPT,
      tools: webSearchTool(),
      messages,
    });
  }

  const textBlock = response.content.find(
    (block): block is Anthropic.TextBlock => block.type === "text"
  );
  const suggestion = textBlock ? parseSuggestionFromText(textBlock.text) : null;

  if (!suggestion) {
    throw new Error("La IA no devolvió un precio interpretable. Intenta de nuevo.");
  }

  return suggestion;
}
