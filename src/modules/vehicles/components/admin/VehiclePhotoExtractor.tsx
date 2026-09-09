"use client";

import { useState, type ChangeEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useExtractVehicleFromPhotos } from "../../hooks/useExtractVehicleFromPhotos";
import { extractionResultToFormInitialValues } from "../../utils/vehicleExtractionSchema";
import type { VehicleFormInput } from "../../utils/vehicleFormSchema";

const MAX_PHOTOS = 6;

interface VehiclePhotoExtractorProps {
  onExtracted: (initialValues: Partial<VehicleFormInput>) => void;
}

/** Optional shortcut shown above the blank VehicleForm on "nuevo vehículo" — the admin can skip it and fill the form by hand. */
export function VehiclePhotoExtractor({ onExtracted }: VehiclePhotoExtractorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const extractMutation = useExtractVehicleFromPhotos();

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFiles(Array.from(event.target.files ?? []).slice(0, MAX_PHOTOS));
  }

  function handleAnalyze() {
    extractMutation.mutate(selectedFiles, {
      onSuccess: (extraction) => onExtracted(extractionResultToFormInitialValues(extraction)),
    });
  }

  return (
    <Card className="flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-medium text-ink">Foto → ficha (opcional)</h2>
        <p className="text-sm text-ink-dim">
          Sube fotos del vehículo y de la tarjeta de propiedad — la IA intenta pre-llenar el formulario de abajo.
          Siempre revisa y corrige los datos antes de guardar.
        </p>
      </div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="text-sm text-ink-dim file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-ink"
      />
      {selectedFiles.length > 0 ? (
        <p className="text-xs text-ink-faint">{selectedFiles.length} foto(s) seleccionadas (máx. {MAX_PHOTOS})</p>
      ) : null}
      <div>
        <Button
          type="button"
          variant="secondary"
          disabled={selectedFiles.length === 0 || extractMutation.isPending}
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2"
        >
          {extractMutation.isPending ? <Spinner size="sm" /> : null}
          {extractMutation.isPending ? "Analizando..." : "Analizar con IA"}
        </Button>
      </div>
      {extractMutation.isError ? <p className="text-sm text-danger">{extractMutation.error.message}</p> : null}
      {extractMutation.isSuccess ? (
        <p className="text-sm text-accent">Formulario pre-llenado. Revisa cada campo antes de guardar.</p>
      ) : null}
    </Card>
  );
}
