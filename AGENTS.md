# AGENTS.md — Cobijo / EDNA ATELIER

Tienda de pijamas, buzos y remates en Bogotá (San Victorino). Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript, Drizzle ORM + Postgres, Zod.

## Comandos

- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npx drizzle-kit push` — aplicar esquema (requiere `DATABASE_URL`)
- `drizzle/0001_order_safety.sql` — cambios aditivos para idempotencia y rate limit compartido; aplicar primero solo tras confirmar la base de datos destino.
- `drizzle/0002_reservation_expiry.sql` — añade vencimiento de reservas de 24 h; las órdenes abiertas existentes reciben al menos 24 h desde la migración.
- Caducidad automática: `GET /api/cron/expire-orders`, protegido con `Authorization: Bearer $CRON_SECRET` (secreto de al menos 32 caracteres); programar cada 15 minutos en el proveedor de despliegue.

## Identidad visual (no negociable)

- Deportivo premium: blanco/negro + un solo acento volt `#d8ff3e`.
- Acento legible sobre claro: `text-clay-dark` = `#4f6b00`.
- Display grotesk 900 en mayúsculas; radios pequeños; chips deportivos.
- Liquid glass visible: rejilla de fondo, manchas volt/negras, doble borde y specular highlight.
- Prohibido volver a borgoña, oliva, crema, arena o stone/amber como base.
- Los estilos personalizados viven en `@layer components` para no pisar los `hover:` de Tailwind.

## Reglas de lógica

- Los precios y totales se calculan en el servidor; el carrito de `localStorage` solo aporta `productId`, `variantId` y `quantity`.
- Un pedido debe ser idempotente y el stock no puede sobrevenderse: reservar al confirmar, liberar al cancelar, reponer al devolver.
- WhatsApp se abre con un `<a href>` real; nunca `window.open` después de un `await`.
- `/pedido/[code]` no se cachea y no expone más PII de la necesaria.
- El admin solo suma revenue de pedidos pagados y usa la IP real del proxy de forma segura.
- Cualquier error de DB no debe degradar silenciosamente a datos semilla en producción.
- Los datos semilla son solo para desarrollo/demo. En producción, `DATABASE_URL` y un catálogo real cargado son requisitos; una base vacía o inaccesible debe fallar visiblemente y nunca mostrar productos de muestra.
- No incluir credenciales predeterminadas en `.env.example`. Producción requiere `ADMIN_PASSWORD`, un `ADMIN_SESSION_SECRET` independiente y fuerte, y `CRON_SECRET`; cada entorno debe usar valores propios.
- Rate limit por IP solo puede confiar en una cabecera que el proxy de producción sanee. Configurar `TRUSTED_CLIENT_IP_HEADER` después de confirmar que el proxy reemplaza o añade la IP de cliente y descarta una cabecera homónima enviada por quien hace la solicitud.
- CSP de producción: nonce por request para scripts, sin `unsafe-inline`/`unsafe-eval` en scripts; conservar el nonce en cualquier JSON-LD inline nuevo.

- En producciÃ³n, `NEXT_PUBLIC_WHATSAPP_NUMBER` debe ser el nÃºmero internacional real del negocio (10-15 dÃ­gitos), nunca el destino demo `573000000000`. Si falta o es invÃ¡lido, fallar visiblemente; ningÃºn enlace puede enviar a un destino de muestra.

## Skills instaladas

AutoSkills dejó 12 skills en `.agents/skills/` (react-best-practices, composition-patterns, next-cache-components-adoption, tailwind-css-patterns, typescript-advanced-types, zod, nodejs-backend-patterns, nodejs-best-practices, drizzle, frontend-design, accessibility, seo). Consúltalas antes de tocar su área.

## Agentes del proyecto

- `cobijo-logic-guardian` — auditoría de pedidos, stock, precios, admin y PII.
- `cobijo-design-qa` — identidad, glass, contraste y accesibilidad.
- `astro-migration-scout` — qué rutas pueden pasar a Astro sin riesgo.
- `release-verifier` — typecheck, lint, build y smoke test con evidencia.
