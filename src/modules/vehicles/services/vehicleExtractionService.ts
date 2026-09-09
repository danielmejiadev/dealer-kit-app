import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createAnthropicClient } from "@/lib/anthropicClient";
import { vehicleExtractionSchema, type VehicleExtractionResult } from "../utils/vehicleExtractionSchema";

export type VehicleExtractionImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface VehicleExtractionPhoto {
  base64: string;
  mediaType: VehicleExtractionImageMediaType;
}

const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente que ayuda a un administrador de una compraventa de vehículos usados en Colombia a llenar la ficha de un vehículo a partir de fotos.

Te llegan fotos del vehículo y, casi siempre, una foto de la tarjeta de propiedad colombiana — un documento oficial que trae explícitamente placa, marca, línea, modelo (año), color y cilindraje.

Reglas:
- Si ves la tarjeta de propiedad, prioriza sus datos escritos sobre lo que puedas inferir de las fotos del carro — son la fuente más confiable.
- Para "descripcion", escribe una frase corta y objetiva sobre el estado visible del vehículo (ej. "Sedán en buen estado general, sin golpes visibles"), basada solo en lo que se ve.
- Nunca inventes ni adivines un valor. Si no puedes determinar un campo con confianza a partir de las fotos, devuelve null en ese campo — un administrador humano siempre revisa y completa el formulario antes de guardar.`;

export async function extractVehicleFromPhotos(
  photos: VehicleExtractionPhoto[]
): Promise<VehicleExtractionResult> {
  const client = createAnthropicClient();

  const response = await client.messages.parse({
    model: "claude-opus-5",
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          ...photos.map((photo) => ({
            type: "image" as const,
            source: { type: "base64" as const, media_type: photo.mediaType, data: photo.base64 },
          })),
          { type: "text" as const, text: "Extrae los datos de este vehículo a partir de las fotos." },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(vehicleExtractionSchema) },
  });

  if (!response.parsed_output) {
    throw new Error("No se pudo interpretar la respuesta de la IA.");
  }

  return response.parsed_output;
}
