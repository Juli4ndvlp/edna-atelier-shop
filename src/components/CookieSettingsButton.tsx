"use client";

import { openCookieSettings } from "@/lib/consent";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="inline-flex min-h-11 items-center text-left underline underline-offset-4 hover:text-volt"
    >
      Configurar cookies
    </button>
  );
}
