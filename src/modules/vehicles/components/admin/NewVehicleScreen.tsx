"use client";

import { useState } from "react";
import { VehicleForm } from "./VehicleForm";
import { VehiclePhotoExtractor } from "./VehiclePhotoExtractor";
import type { VehicleFormInput } from "../../utils/vehicleFormSchema";

// react-hook-form only reads defaultValues on mount, so a new extraction
// result (arriving async, after VehicleForm already mounted with blank
// defaults) is applied by remounting the form via `key` rather than trying
// to push values into a live form instance.
export function NewVehicleScreen() {
  const [initialValues, setInitialValues] = useState<Partial<VehicleFormInput> | undefined>(undefined);
  const [formVersion, setFormVersion] = useState(0);

  function handleExtracted(extractedValues: Partial<VehicleFormInput>) {
    setInitialValues(extractedValues);
    setFormVersion((currentVersion) => currentVersion + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <VehiclePhotoExtractor onExtracted={handleExtracted} />
      <VehicleForm key={formVersion} mode="create" initialValues={initialValues} />
    </div>
  );
}
