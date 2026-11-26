# Migración incremental a Astro

## Decisión

Preparar Astro como frontend de marketing/SEO, manteniendo Next.js para carrito,
checkout, API, pedidos y administración. No cambiar el enrutamiento de producción
hasta confirmar el proveedor de despliegue y validar el preview de Astro.

## Piloto actual

Hay un preview estático independiente en `apps/marketing-astro/` que sirve las
rutas `/privacidad/`, `/terminos/` y `/cookies/`. Importa `src/app/globals.css` directamente para conservar los
tokens sin duplicar su fuente de verdad. `npm run check`, `npm run build` y
Lighthouse SEO/accesibilidad pasan para esta ruta. `/privacidad` y
`/privacidad/` responden 200; la canonical permanece sin slash, alineada con
Next. No se enruta tráfico real.

El preview ya incluye navegación básica y un banner de cookies con preferencias,
revocación y sincronización entre pestañas. Las opciones de analítica/marketing
se guardan; GA4 se carga solo con `PUBLIC_GA_MEASUREMENT_ID` y consentimiento
analítico. No hay servicios de marketing conectados. El JavaScript del banner y
el loader de GA4 se sirven como archivos externos, pero Astro aún no recibe
headers CSP/HSTS del proxy Next; la CSP de producción puede bloquearlos. No
activar el reemplazo público hasta resolver headers y hosting.

Las tres rutas legales se compararon con Next. La paridad legal del preview está
completa (ASTRO-03a, ASTRO-03b y ASTRO-07a); no queda como paso futuro. Privacidad y Términos comparten
`SITE_NAME` y `CONTACT_EMAIL` desde `src/lib/site.ts`; las políticas de
Privacidad y Cookies explican GA4 y la revocación del consentimiento. Se
mantienen como preview: no hay rutas de producción configuradas.

En validaciones locales anteriores se reportó HTTP 200 y Lighthouse 100/100 en
SEO y accesibilidad para cada una. Los reportes no están adjuntos con fecha,
commit, versión de Lighthouse y URL en este documento; no tratar esos números
como verificación vigente de esta ronda. En Astro, GA4 se probó con un Measurement ID
ficticio y con los destinos de Google bloqueados en el navegador; se comprobó el
opt-in, page_view, revocación y eliminación del tag/cookies, sin enviar datos a
Google. Next se probó sin ID y permanece apagado sin solicitudes externas.

## Inventario y dependencias

| Ruta | Datos/interacción | Riesgo | Recomendación |
| --- | --- | --- | --- |
| `/privacidad`, `/terminos`, `/cookies` | Contenido editorial, sin consultas ni estado de usuario | Bajo | Primer piloto Astro; verificar paridad de texto, metadatos, navegación y estilos |
| `/` | Catálogo desde PostgreSQL (`getCategories`, destacados y novedades), JSON-LD, `next/image` | Medio | Migrar después del piloto; consumir un contrato HTTP estable o extraer una capa compartida, no importar `lib/catalog.ts` (`server-only`/Drizzle) directamente |
| `/tienda` | Filtros por query string y consulta dinámica del catálogo | Medio-alto | Mantener en Next durante el piloto |
| `/producto/[slug]` | Consulta dinámica, JSON-LD, galería e isla interactiva `AddToCart` | Alto | Mantener en Next hasta estabilizar API pública e integración de la isla |
| `/carrito`, `/checkout`, `/pedido/[code]` | `localStorage`, mutaciones, PII, idempotencia, reserva de stock | Crítico | Permanecen en Next |
| `/api/**`, `/admin/**` | Drizzle, autenticación, server actions y tareas de cron | Crítico | Permanecen en Next |

## Fuentes compartidas

- Los tokens y estilos de marca viven en `src/app/globals.css`; mantenerlos como
  fuente visual común y probar su consumo con Vite/Tailwind en Astro antes de
  trasladar componentes.
- `lib/format.ts` contiene funciones puras reutilizables; verificar que siga sin
  dependencias de Next antes de compartirlo.
- `lib/catalog.ts` no debe importarse desde Astro: es server-only y depende de
  Drizzle. Usar inicialmente `/api/products` o extraer un paquete de dominio
  agnóstico solo si se necesita compartir acceso a datos.
- `Header`, `Footer`, carrito y acciones actuales usan `next/link`,
  `next/navigation` o estado React. No son componentes Astro reutilizables tal
  cual; reconstruir la navegación pública como Astro y reservar islas React para
  interacciones que aporten valor.

## Seguridad y operación

- `src/proxy.ts` aplica CSP/HSTS al tráfico que pasa por Next; no protege por sí
  solo un despliegue servido por Astro. El proveedor debe aplicar encabezados
  comunes a ambos frontends, o Astro debe implementar y probar su propia política.
- El nonce CSP actual fuerza renderizado dinámico en Next. Las páginas editoriales
  estáticas de Astro podrían evitar JavaScript, pero deben mantener la CSP del
  dominio y no insertar scripts inline sin nonce.
- No se encontró configuración de despliegue ni de enrutamiento por prefijo. La
  migración no puede activarse con seguridad hasta saber cómo enrutar las tres
  páginas legales a Astro y dejar el resto en Next.
- Confirmar el dominio canónico, proveedor, proxy y cabecera de IP confiable.
  El proxy debe eliminar o reemplazar cualquier cabecera de IP enviada por el
  cliente antes de que la aplicación la use para rate limit.
- Confirmar que las respuestas de Next y Astro tengan políticas CSP compatibles;
  `src/proxy.ts` solo cubre el tráfico que atraviesa Next. No habilitar
  `includeSubDomains`/`preload` hasta que todos los subdominios previstos estén
  listos para HTTPS.
- Producción debe usar una base de datos con catálogo real cargado. Los datos
  semilla y la contraseña local de desarrollo no son valores de producción.

## Hitos y reversión

1. Confirmar hosting, dominio, estrategia de rutas y headers compartidos.
2. **Completado en preview:** paridad legal de `/privacidad`, `/terminos` y
   `/cookies`, incluido banner/preferencias, contenido, metadatos, navegación,
   accesibilidad y estilos (ASTRO-03a/03b/07a). Registrar evidencia reproducible
   según `QUALITY_ROADMAP.md` cuando se repita la validación.
3. Solo tras cerrar los gates de hosting, rutas, CSP y sitemap, enrutar primero `/privacidad`; ampliar después a
   `/terminos` y `/cookies` desde el proveedor. Mantener las páginas Next listas
   para volver cambiando únicamente las reglas de enrutamiento.
4. Evaluar la portada como segundo hito usando la API de catálogo y productos
   reales. No migrar
   tienda ni producto hasta tener pruebas de filtros, imágenes y carrito-isla.

En cada hito, conservar Next como fallback y verificar build, canonical,
Open Graph, JSON-LD, CSP, sitemap, Lighthouse y navegación por teclado antes de
ampliar el tráfico.
