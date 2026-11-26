# Runbook de puesta en marcha — EDNA ATELIER

Orden recomendado para abrir tráfico real. No usar CLI de Netlify: los deploys se
hacen desde el panel. No copiar secretos al repositorio ni a `.env.example`.

## 1. Supabase

1. Crear proyecto en el plan Free, región **South America (São Paulo)** y guardar
   la contraseña de base de datos en el gestor de secretos.
2. En **Project Settings → Database** activar **Enforce SSL**.
3. Copiar dos cadenas de **Connect**:
   - **Direct connection** (`:5432`): solo para `drizzle-kit` y el cargador.
   - **Transaction pooler** (`:6543`): la que usará Next.js en Netlify.
4. El plan Free pausa el proyecto tras 7 días sin actividad. Verificar que esté
   activo antes de cada revisión o configurar una alerta.

## 2. Esquema y catálogo (local)

En `.env.local`, en la raíz del repositorio:

```dotenv
MIGRATION_DATABASE_URL=<direct-connection-5432>
DATABASE_URL=<transaction-pooler-6543>
```

`MIGRATION_DATABASE_URL` tiene prioridad para cambios de esquema y para el
cargador; `drizzle.config.ts` rechaza el pooler `:6543` para migraciones.

```powershell
npx drizzle-kit push
npm run seed:real-catalog
```

En una base nueva no hay que aplicar `drizzle/0001_order_safety.sql` ni
`drizzle/0002_reservation_expiry.sql`: `push` ya crea `admin_audit`,
`reservation_expires_at` y la restricción de idempotencia. Esos SQL son solo para
bases preexistentes. Revisar el plan de Drizzle antes de aceptarlo.

Verificar que haya 3 categorías y 12 productos. Las tres prendas con foto
provisional están marcadas en sus `details`; reemplazarlas cuando lleguen las
fotos propias.

## 3. Netlify

En **Site configuration → Environment variables**, agregar o confirmar:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Transaction pooler de Supabase (`:6543`) |
| `ADMIN_PASSWORD` | Contraseña fuerte del panel (16+ caracteres) |
| `ADMIN_SESSION_SECRET` | Aleatoria, 32+ caracteres, independiente |
| `CRON_SECRET` | Aleatoria, 32+ caracteres, independiente |
| `TRUSTED_CLIENT_IP_HEADER` | `x-nf-client-connection-ip` |
| `NEXT_PUBLIC_SITE_URL` | `https://edna-atelier-shop.netlify.app` |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `3153840957` |

`NEXT_PUBLIC_GA_MEASUREMENT_ID` se agrega **solo** cuando exista la propiedad GA4
real. Sin ese valor no se carga ni se mide nada.

El build ya está fijado en `netlify.toml` (`npm run build`, publish `.next`,
Node 22). Hacer **Trigger deploy → Deploy site** desde el panel.

Antes de confiar en el rate limit, confirmar en el panel/proxy que Netlify
sobrescribe la cabecera `x-nf-client-connection-ip` enviada por el visitante: si
no la sanea, cualquier persona podría falsificar su IP. El código falla cerrado
si la cabecera falta o es inválida.

## 4. Cron de expiración

En GitHub, **Settings → Secrets and variables → Actions**:

- `COBIJO_CRON_URL`: `https://edna-atelier-shop.netlify.app/api/cron/expire-orders`
- `COBIJO_CRON_SECRET`: el mismo valor que `CRON_SECRET` de Netlify.

El workflow `.github/workflows/expire-orders.yml` corre cada 15 minutos y valida
la respuesta JSON `ok: true`. No marcar completo hasta ver una ejecución real en
la pestaña **Actions**.

## 5. Verificación tras el deploy

1. `GET /api/health` → HTTP 200 y
   `{"ok":true,"mode":"database","siteUrlConfigured":true,"whatsappConfigured":true}`.
2. `/` y `/tienda` muestran las 12 prendas reales, nunca datos semilla. Si la DB
   falla, debe verse un error visible, no catálogo de demostración.
3. `/checkout`, `/privacidad`, `/cookies`, `/terminos` responden 200.
4. En el HTML: canonical `https://edna-atelier-shop.netlify.app` y enlaces
   `https://wa.me/3153840957`. Ningún enlace al número demo.
5. Las respuestas incluyen CSP con nonce por request, HSTS y
   `X-Frame-Options: DENY`.
6. En el navegador, sin consentimiento no hay solicitudes a Google; al revocar,
   se expiran las cookies `_ga`.
7. Probar una orden controlada: recotización, reserva de stock, WhatsApp y
   resumen `/pedido/[code]`. Avisar al negocio antes de generarla o usar un
   deploy de preview con base separada. Cancelar/devolver para liberar stock y
   comprobar que no se repone dos veces.
8. Revisar `/admin`: login, cambio de estado y stock, y registros en
   `admin_audit`.

## 6. Después de abrir tráfico

- Crear propiedad y stream de GA4, obtener el Measurement ID y recién entonces
  configurar `NEXT_PUBLIC_GA_MEASUREMENT_ID` y repetir la prueba de consentimiento.
- Enviar `sitemap.xml` a Search Console y revisar indexación/canonicales.
- Medir Core Web Vitals en campo antes de decidir migrar rutas a Astro. El pilot
  legal de Astro sigue siendo solo preview; no enrutarlo a producción todavía.
