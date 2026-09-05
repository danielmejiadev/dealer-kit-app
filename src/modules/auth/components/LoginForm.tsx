"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useLoginWithMagicLink } from "../hooks/useLoginWithMagicLink";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const magicLinkMutation = useLoginWithMagicLink();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    magicLinkMutation.mutate(email, { onSuccess: () => setSentToEmail(email) });
  }

  if (sentToEmail) {
    return (
      <Card className="flex max-w-sm flex-col gap-2">
        <h1 className="text-lg font-semibold text-ink">Revisa tu correo</h1>
        <p className="text-sm text-ink-dim">
          Te enviamos un link de acceso a <strong>{sentToEmail}</strong>. Ábrelo desde este mismo
          dispositivo para entrar al panel.
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex max-w-sm flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold text-ink">Entrar al panel</h1>
        <p className="text-sm text-ink-dim">Te enviamos un link de acceso a tu correo, sin contraseña.</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          type="email"
          name="email"
          placeholder="tucorreo@compraventa.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {magicLinkMutation.isError ? (
          <p className="text-sm text-danger">{magicLinkMutation.error.message}</p>
        ) : null}
        <Button type="submit" disabled={magicLinkMutation.isPending}>
          {magicLinkMutation.isPending ? "Enviando..." : "Enviar link de acceso"}
        </Button>
      </form>
    </Card>
  );
}
