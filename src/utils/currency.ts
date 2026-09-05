// Pure formatting helper — no external calls. See AGENTS.md, "utils/".

const copFormatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("es-CO");

/** Formats an integer amount of Colombian pesos, e.g. 35000000 -> "$ 35.000.000". */
export function formatCOP(amountInPesos: number): string {
  return copFormatter.format(amountInPesos);
}

/** Formats an odometer reading with thousands separators, e.g. 45000 -> "45.000 km". */
export function formatKilometraje(kilometraje: number): string {
  return `${numberFormatter.format(kilometraje)} km`;
}
