# Conectar Cobijo a Supabase y Netlify

Cobijo ya incluye su backend en Next.js: las rutas `/api/*` procesan productos,
pedidos, newsletter y tareas programadas. Drizzle se conecta directamente a
PostgreSQL; no hace falta instalar `supabase-js` para esta arquitectura.

## 1. Crear la base de datos

1. Crea un proyecto PostgreSQL en Supabase y guarda la contraseña de base de datos.
2. En el panel del proyecto, abre **Connect** y copia la cadena **Transaction pooler**.
   La cadena usa el puerto `6543`; conserva el host y el usuario exactamente como
   aparecen en el panel. Si la contraseña tiene caracteres especiales, codifícalos
   para URL antes de insertarla.
3. En `.env.local` en la raíz del proyecto, configura esa cadena como
   `DATABASE_URL`. No uses una clave `service_role` o `anon`: esta app conecta con
   el usuario PostgreSQL del servidor.
4. Para preparar el esquema inicial, copia también la cadena **Direct connection**
   como `MIGRATION_DATABASE_URL`. Si la red local no admite IPv6, usa **Session
   pooler** para migraciones.

Las cadenas son secretos. No las guardes en Git ni las pongas en variables
`NEXT_PUBLIC_*`.

## 2. Crear las tablas

En PowerShell, desde la raíz del proyecto:

```powershell
npx drizzle-kit push
```

El comando carga `.env.local`; `drizzle.config.ts` prefiere
`MIGRATION_DATABASE_URL` para el cambio de esquema. Revisa el plan que muestra
Drizzle antes de aceptar. Esto aplica el esquema definido en `src/db/schema.ts`.

Para una base de datos que ya contiene pedidos o productos, haz primero una copia
de seguridad y revisa el esquema antes de aplicar cambios. No uses `push` a ciegas
sobre una base con datos reales.

`drizzle.config.ts` rechaza el Transaction pooler (`:6543`) para cambios de
esquema: usa siempre la conexión directa o la de sesión en
`MIGRATION_DATABASE_URL`. El esquema incluye `admin_audit` para registrar cambios
de estado y stock del panel. En una base anterior a esa tabla, la auditoría se
omite con un aviso en logs y no revierte el cambio administrativo; aplica `push`
para crearla.

## 3. Configurar Netlify

En la configuración del sitio de Netlify, agrega estas variables para el contexto
de producción:

- `DATABASE_URL`: Transaction pooler de Supabase.
- `ADMIN_PASSWORD`: contraseña fuerte del panel; mínimo 16 caracteres.
- `ADMIN_SESSION_SECRET`: secreto aleatorio independiente de al menos 32 caracteres.
- `CRON_SECRET`: secreto aleatorio independiente de al menos 32 caracteres.
- `NEXT_PUBLIC_SITE_URL`: URL pública final del sitio.
- `NEXT_PUBLIC_WHATSAPP_NUMBER`: teléfono real del negocio en formato internacional,
  solo dígitos (10–15 caracteres).
- `TRUSTED_CLIENT_IP_HEADER`: configura `x-nf-client-connection-ip` para Netlify.

El build ya está configurado en `netlify.toml`. Tras desplegar, abre
`https://TU-DOMINIO/api/health`; debe responder `{"ok":true,"mode":"database"}`.
Si la conexión no funciona, la ruta devuelve HTTP 503 sin revelar credenciales.

## 4. Preparar el catálogo

El catálogo de demostración sirve solo en desarrollo. En producción Cobijo exige
productos reales en las tablas `categories` y `products`; carga y revisa el
catálogo antes de publicar ventas. Nunca configures la base de datos de producción
con productos, stock o precios de muestra.

El catálogo real está definido en `src/db/real-catalog.ts`: 5 pijamas, 3 hoodies,
2 chaquetas y 2 sudaderas. Las sudaderas se cargan en la categoría `buzos`. Las
fotos entregadas por el taller ya están en `public/collections`. Tres prendas
(«Hoodie Oversize Sombra», «Hoodie Doble Capa Noche» y «Chaqueta Térmica Andina»)
usan una referencia visual provisional porque aún no tienen foto propia; está
anotado en sus `details` y debe reemplazarse antes de publicarlas.

Tras crear el esquema, carga o actualiza el catálogo con:

```powershell
npm run seed:real-catalog
```

El script usa transacciones y `ON CONFLICT (slug)`, así que puede repetirse sin
duplicar productos. Revisa los precios y el stock en `/admin` después de cargarlo.

La expiración automática de reservas usa el endpoint
`/api/cron/expire-orders`. El workflow de GitHub existente requiere los secretos
`COBIJO_CRON_URL` (URL HTTPS completa del endpoint) y `COBIJO_CRON_SECRET`
(`CRON_SECRET` de Netlify).

## Recursos

- [Conexiones a PostgreSQL en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Drizzle ORM con Supabase](https://supabase.com/docs/guides/database/drizzle)
