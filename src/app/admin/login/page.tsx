import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Acceso Taller",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  "1": "Contraseña incorrecta.",
  rate: "Demasiados intentos. Espera unos minutos.",
  config: "ADMIN_PASSWORD y ADMIN_SESSION_SECRET independientes son obligatorias en producción.",
  proxy_ip: "Falta configurar TRUSTED_CLIENT_IP_HEADER para validar la IP real del proxy.",
  rate_unavailable: "El limitador compartido en base de datos no está disponible.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = isAdminConfigured();
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form action={loginAction} className="glass-surface w-full max-w-sm rounded-xl p-8">
        <p className="font-display text-3xl font-bold">
          EDNA <span className="text-clay-dark">ATELIER</span>
        </p>
        <h1 className="font-display mt-4 text-xl font-bold">Acceso al panel del taller</h1>
        <p className="mt-1 text-sm text-ink/75">Panel privado del taller</p>
        {!configured && (
          <p className="mt-4 rounded-lg border border-ink bg-volt/35 p-3 text-sm text-ink">
            Define <code>ADMIN_PASSWORD</code> (16+ caracteres) y{" "}
            <code>ADMIN_SESSION_SECRET</code> (32+ caracteres independientes) para habilitar el
            acceso en producción.
          </p>
        )}
        <label className="mt-6 block">
          <span className="mb-1 block text-sm font-medium">Contraseña</span>
          <input name="password" type="password" required className="input" />
        </label>
        {errorMessage && (
          <p role="alert" className="mt-3 text-sm font-semibold text-clay-dark">
            {errorMessage}
          </p>
        )}
        <button disabled={!configured} className="btn-primary mt-6 w-full">
          Entrar
        </button>
      </form>
    </div>
  );
}
