import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";
import { FooterNewsletterForm } from "@/components/FooterNewsletterForm";
import { buildSafeWhatsAppUrl, formatSupportWhatsAppMessage } from "@/lib/whatsapp";

export function Footer() {
  const supportWhatsAppUrl = buildSafeWhatsAppUrl(formatSupportWhatsAppMessage());

  return (
    <footer className="mt-20 border-t border-white/15 bg-gradient-to-br from-ink via-ink/80 to-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-3xl font-bold tracking-tight">
            EDNA <span className="text-volt">ATELIER</span>
          </p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/85">
            Taller de confección en Bogotá (sector San Victorino). Pijamas, buzos perchados y
            chaquetas al detal y por mayor, con remates semanales y atención directa por WhatsApp.
          </p>
          <FooterNewsletterForm />
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
            Colección Bogotá
          </p>
          <ul className="space-y-1 text-sm text-white/90">
            <li>
              <Link href="/tienda?categoria=pijamas" className="inline-flex min-h-11 items-center hover:text-volt">
                Pijamas en Bogotá
              </Link>
            </li>
            <li>
              <Link href="/tienda?categoria=buzos" className="inline-flex min-h-11 items-center hover:text-volt">
                Buzos y Hoodies
              </Link>
            </li>
            <li>
              <Link href="/tienda?categoria=chaquetas" className="inline-flex min-h-11 items-center hover:text-volt">
                Chaquetas
              </Link>
            </li>
            <li>
              <Link href="/tienda?ofertas=1" className="inline-flex min-h-11 items-center hover:text-volt">
                Remates San Victorino
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-white/80">
            Taller y Legal
          </p>
          <ul className="space-y-1 text-sm text-white/90">
            <li>
              {supportWhatsAppUrl ? (
                <a
                  href={supportWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center underline underline-offset-4 hover:text-volt"
                >
                  WhatsApp Ventas y Mayoristas
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center text-volt">
                  WhatsApp no configurado (NEXT_PUBLIC_WHATSAPP_NUMBER)
                </span>
              )}
            </li>
            <li>
              <Link href="/privacidad" className="inline-flex min-h-11 items-center hover:text-volt">
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link href="/terminos" className="inline-flex min-h-11 items-center hover:text-volt">
                Términos y Condiciones
              </Link>
            </li>
            <li>
              <Link href="/cookies" className="inline-flex min-h-11 items-center hover:text-volt">
                Política de Cookies
              </Link>
            </li>
            <li>
              <CookieSettingsButton />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/15 px-4 py-5 text-center text-xs text-white/80">
        © {new Date().getFullYear()} EDNA ATELIER · Taller de confección en Bogotá, Colombia · Sector
        San Victorino · Envíos a todo el país.
      </div>
    </footer>
  );
}
