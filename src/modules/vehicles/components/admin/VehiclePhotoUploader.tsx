"use client";

import { useRef, type ChangeEvent } from "react";
import clsx from "clsx";
import { Spinner } from "@/components/ui/Spinner";
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
        {photos.map((photo) => {
          const isDeletingThisPhoto = deleteMutation.isPending && deleteMutation.variables === photo.id;

          return (
            <div
              key={photo.id}
              className={clsx(
                "group relative aspect-4/3 overflow-hidden rounded-md bg-surface-2",
                isDeletingThisPhoto && "opacity-50"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- public bucket, no Next Image optimization for now */}
              <img
                src={getVehiclePhotoUrl(photo.storage_path)}
                alt=""
                className="h-full w-full object-cover"
              />
              {isDeletingThisPhoto ? (
                <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
                  <Spinner tone="inverted" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(photo.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute right-1 top-1 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-bg opacity-0 transition-opacity group-hover:opacity-100"
                >
                  Borrar
                </button>
              )}
            </div>
          );
        })}
        {uploadMutation.isPending ? (
          <div className="flex aspect-4/3 items-center justify-center rounded-md bg-surface-2">
            <Spinner />
          </div>
        ) : null}
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
