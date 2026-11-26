"use client";

import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useCookieBannerVisible } from "@/lib/consent";
import { buildSafeWhatsAppUrl, formatSupportWhatsAppMessage } from "@/lib/whatsapp";

export function WhatsAppButton() {
  const pathname = usePathname();
  const bannerOpen = useCookieBannerVisible();

  if (pathname.startsWith("/admin") || bannerOpen) return null;

  const href = buildSafeWhatsAppUrl(formatSupportWhatsAppMessage());
  if (!href) {
    return (
      <div
        role="status"
        className="glass-surface fixed bottom-4 right-4 z-40 rounded-lg border border-ink px-3.5 py-2.5 text-xs font-semibold text-ink sm:bottom-5 sm:right-6"
      >
        WhatsApp no configurado en producción
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Hacer consulta o pedido por WhatsApp"
      className="btn-whatsapp fixed bottom-4 right-4 z-40 !px-4 !py-2.5 text-sm sm:bottom-5 sm:right-6"
    >
      <WhatsAppIcon size={20} />
      <span className="hidden sm:inline">Pedir por WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}
