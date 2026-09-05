import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <Card className="flex max-w-md flex-col items-start gap-3">
        <Badge tone="success">Scaffolding listo</Badge>
        <h1 className="text-2xl">DealerKit</h1>
        <p>
          Fase 1 completa: Next.js, el design kit, y los componentes base están
          funcionando. El catálogo público y el panel admin llegan en las
          próximas fases.
        </p>
        <Button>Botón de prueba</Button>
      </Card>
    </main>
  );
}
