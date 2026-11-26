import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isAdmin, isAdminConfigured } from "@/lib/admin-auth";
import { loginAction } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Acceso Taller",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const configured = isAdminConfigured();

  return (
    <div className="grid min-h-screen place-items-center px-4">
      <form action={loginAction} className="glass-surface w-full max-w-sm rounded-3xl p-8">
        <p className="font-display text-3xl font-bold">
          EDNA <span className="text-clay-dark">ATELIER</span>
        </p>
        <h1 className="mt-4 text-xl font-semibold">Acceso al panel del taller</h1>
        <p className="mt-1 text-sm text-ink/75">Panel privado del taller</p>
        {!configured && (
          <p className="mt-4 rounded-xl bg-volt/30 p-3 text-sm text-ink">
            Define la variable de entorno <code>ADMIN_PASSWORD</code> para habilitar el acceso en producción.
          </p>
        )}
        <label className="mt-6 block">
          <span className="mb-1 block text-sm font-medium">Contraseña</span>
          <input name="password" type="password" required autoFocus className="input" />
        </label>
        {error === "1" && <p className="mt-3 text-sm text-clay-dark">Contraseña incorrecta.</p>}
        {error === "rate" && (
          <p className="mt-3 text-sm text-clay-dark">Demasiados intentos. Espera unos minutos.</p>
        )}
        {error === "config" && (
          <p className="mt-3 text-sm text-clay-dark">ADMIN_PASSWORD no está configurada.</p>
        )}
        <button disabled={!configured} className="btn-primary mt-6 w-full">
          Entrar
        </button>
      </form>
    </div>
  );
}
