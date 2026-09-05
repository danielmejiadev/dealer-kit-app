"use client";

import { useRef, type ChangeEvent } from "react";
import { useVehiclePhotos } from "../../hooks/useVehiclePhotos";
import { useUploadVehiclePhoto } from "../../hooks/useUploadVehiclePhoto";
import { useDeleteVehiclePhoto } from "../../hooks/useDeleteVehiclePhoto";
import { getVehiclePhotoUrl } from "../../utils/vehiclePhotoUrl";
import type { VehiclePhoto } from "../../services/vehiclePhotoService";

interface VehiclePhotoUploaderProps {
  vehicleId: number;
  initialPhotos: VehiclePhoto[];
}

export function VehiclePhotoUploader({ vehicleId, initialPhotos }: VehiclePhotoUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: photos } = useVehiclePhotos(vehicleId, initialPhotos);
  const uploadMutation = useUploadVehiclePhoto(vehicleId);
  const deleteMutation = useDeleteVehiclePhoto(vehicleId);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) uploadMutation.mutate(file);
    event.target.value = "";
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-ink">Fotos</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo.id} className="group relative aspect-4/3 overflow-hidden rounded-md bg-surface-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- bucket público, sin optimización de Next Image por ahora */}
            <img
              src={getVehiclePhotoUrl(photo.storage_path)}
              alt=""
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={() => deleteMutation.mutate(photo.id)}
              disabled={deleteMutation.isPending}
              className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-bg opacity-0 transition-opacity group-hover:opacity-100"
            >
              Borrar
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="flex aspect-4/3 items-center justify-center rounded-md border border-dashed border-line-strong text-sm text-ink-faint hover:border-accent hover:text-accent"
        >
          {uploadMutation.isPending ? "Subiendo..." : "+ Agregar foto"}
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {uploadMutation.isError ? <p className="text-sm text-danger">{uploadMutation.error.message}</p> : null}
    </div>
  );
}
