# Fases, validaciones y pendientes finales

Este registro evita dar por cerrados los puntos que se dejaron para después. Los
ítems marcados como pendientes requieren validación o decisión; no se consideran
fallos ya comprobados.

## Estado por fase

| Fase | Estado | Validación / nota |
| --- | --- | --- |
| 0. Inventario y base del proyecto | Hecha | AutoSkills instalado; instrucciones del repo y agentes de Cobijo creados. |
| 1. Identidad visual | Hecha | Blanco/negro + volt, liquid glass, foco visible y movimiento reducido. Falta revisión visual manual en varios móviles. |
| 2. Pedidos, precios y stock | Código hecho; operación pendiente | Idempotencia, recotización y reserva transaccional. Faltan migraciones y pruebas concurrentes contra Postgres no productivo. |
| 3. Seguridad y administración | Código implementado; validación de hosting pendiente | CSP con nonce, control de estado y PII reducida. Rate limit, secretos, límite de cuerpos y confianza en proxy están implementados; hosting, cron y secretos de producción siguen sin confirmar. Parte del código está en `main` y parte tiene cambios locales sin commit. |
| 4. SEO, accesibilidad y conversión | Cambios de código en `main`; validación pendiente | Las reglas de indexación de filtros y el estado accesible de controles activos están implementados. Falta revisión manual y evidencia; Search Console, WCAG y Core Web Vitals de campo siguen pendientes. |
| 5. Astro incremental | Piloto legal completo; rollout pendiente | Las tres páginas legales y su paridad están completas en preview. No hay rutas ni headers de producción; falta confirmar hosting, estrategia de rutas, CSP/HSTS y Measurement ID real. |

## Evidencia y alcance de validaciones

Los resultados históricos de Lighthouse y de pruebas locales que aparecen más abajo
son referencias, no una aprobación de esta ronda. Para cerrar una validación nueva,
registrar: fecha/hora, URL y entorno, commit o identificador del árbol, comando y
versión de herramienta, resultado, y ruta al reporte o captura. Si no existe commit,
indicar explícitamente `sin commit` y conservar el reporte en un artefacto del proyecto.
Una puntuación Lighthouse local no demuestra indexación, cumplimiento WCAG ni métricas
de campo.

El catálogo de muestra solo corresponde a desarrollo/demo. En producción se requiere
`DATABASE_URL`, un catálogo real y cargado antes de publicar; un error o una base vacía
no debe hacer que el sitio muestre productos semilla. Los secretos de producción se
configuran por entorno, nunca copiando valores de ejemplo: `ADMIN_PASSWORD`, un
`ADMIN_SESSION_SECRET` independiente de al menos 32 caracteres y `CRON_SECRET` de al
menos 32 caracteres.

## Pendientes que se harán al cierre

### Pedidos, stock y base de datos

- [ ] **DB-01 — Destino confirmado:** revisar `DATABASE_URL` de producción y aplicar, en ese orden, `drizzle/0001_order_safety.sql` y `drizzle/0002_reservation_expiry.sql`. No ejecutar `drizzle-kit push` a ciegas.
- [ ] **DB-02 — Validar datos existentes:** revisar órdenes abiertas antes de la migración. `0002` da a las órdenes `pendiente`/`whatsapp` existentes al menos 24 horas desde que se aplica.
- [ ] **ORD-01 — Regla comercial:** confirmar que 24 horas es el plazo correcto y definir si se avisa al cliente antes/después de cancelar por expiración.
- [ ] **ORD-02 — Pagos:** los métodos tarjeta/transferencia/contraentrega no implican una pasarela integrada. Decidir qué métodos se ofrecerán realmente y probar sus flujos.
- [ ] **ORD-03 — Devoluciones/cancelación:** confirmar la regla de reponer stock al cancelar pedidos ya pagados y definir el proceso/estado de devolución; probar que nunca reponga unidades dos veces.
- [ ] **TEST-DB — Integración:** probar con Postgres no productivo idempotencia concurrente, compras simultáneas del último artículo, cancelación y liberación por cron.
- [x] **DB-03 — Herramienta segura:** `drizzle-kit` se actualizó a `0.31.11` porque la versión `0.18.1` no ofrecía `push` para Postgres; `drizzle.config.ts` ahora exige `DATABASE_URL` y ya no apunta a `localhost` con credenciales fijas. No se ejecutó ningún comando contra una base real.

### Despliegue y seguridad

- [ ] **OPS-05 — Readiness y configuración de proxy:** el código devuelve `503` en producción si falta `DATABASE_URL` o falla la consulta de salud; las rutas con rate limit fallan de forma cerrada si falta una IP válida desde la cabecera confiable configurada y no usan la cubeta `unknown` en producción. Pendiente validar en hosting la respuesta de salud y la cabecera real del proxy. No marcar como verificado hasta obtener evidencia.

- [ ] **OPS-04 — WhatsApp de negocio:** el negocio confirmó el número el 2026-11-25 (10 dígitos, Colombia). Falta cargarlo únicamente como `NEXT_PUBLIC_WHATSAPP_NUMBER` en Netlify y validar que no se use el destino demo `573000000000`; no se copiará de `.env.local` ni se guardará en el repo.

- [x] **SEC-03 — Rate limit de newsletter:** `POST /api/newsletter` ahora espera `checkRateLimit`; prueba HTTP local confirmó `400` en las primeras 10 solicitudes inválidas y `429` en la 11.ª.
- [x] **REL-03 — Build sin variables locales:** al simular un entorno Netlify sin `.env.local`, el build fallaba porque `db` podía ser `null` en `src/lib/catalog.ts`; se añadió una verificación explícita y el build con `NODE_ENV=production` y sin `DATABASE_URL` vuelve a pasar.
- [x] **REL-04 — Verificación previa al deploy:** el 2026-11-25 pasaron `npm run typecheck`, `npm run lint`, `npm test` (8/8) y `npm run build` con `NODE_ENV=production`, `DATABASE_URL` vacía y `NEXT_PUBLIC_SITE_URL=https://prueba.netlify.app`. El lint había detectado el bundle temporal generado por las pruebas; `tests/.tmp/**` quedó excluido de ESLint. Typecheck y build no se ejecutaron en paralelo porque competen por `.next/types`.
- [ ] **OPS-01 — Hosting:** Netlify está elegido. Falta confirmar dominio/canonical definitivo y validar en producción la configuración del proxy y sus cabeceras.
- [ ] **OPS-03 — Variables de producción:** confirmar catálogo real y `DATABASE_URL`; crear contraseñas/secrets únicos por entorno, validar `ADMIN_SESSION_SECRET` independiente y no usar valores de `.env.example`.
- [ ] **OPS-02 — Cron:** el workflow `.github/workflows/expire-orders.yml` está en la rama local. Confirmar que está en la rama por defecto de GitHub, configurar `COBIJO_CRON_URL` y `COBIJO_CRON_SECRET` como secrets del repositorio, y verificar una ejecución real cada 15 minutos, incluidos errores y alertas. La URL debe ser HTTPS y apuntar exactamente a `/api/cron/expire-orders`; el workflow valida también la respuesta JSON `ok: true`. No marcar completo hasta comprobar una ejecución del workflow.
- [ ] **SEC-01 — CSP real:** revisar reportes/consola en el dominio desplegado; validar nonce en rutas dinámicas, imágenes, enlaces externos y posibles integraciones futuras. Habilitar HSTS con `includeSubDomains`/`preload` solo cuando todos los subdominios estén listos para HTTPS.
- [ ] **SEC-02 — Proxy/IP:** para Netlify se configuró el soporte de `x-nf-client-connection-ip`; no configurar `x-forwarded-for` sin demostrar que el proxy sanea la cadena. Hay pruebas unitarias de lectura/validación del header, pero falta confirmar en el sitio desplegado que los endpoints reciben el valor esperado y que una cabecera enviada por el cliente no puede influir.
- [ ] **SEC-05 — Cuerpos API:** verificar el límite de bytes para pedidos/newsletter, incluyendo solicitudes sin `Content-Length`, y confirmar el límite equivalente del hosting.

### Calidad, SEO y conversión

- [ ] **A11Y-01 — Recorrido manual:** navegar portada, tienda, producto, carrito, checkout, banner de cookies y admin con teclado; comprobar foco no oculto, lector de pantalla, zoom 200% y móvil.
- [ ] **A11Y-02 — Navegadores/dispositivos:** revisar Chrome, Safari iOS y Android real; Lighthouse local no sustituye pruebas manuales ni WCAG completo.
- [ ] **UX-01 — Compra real controlada:** recorrer desde selección de talla hasta WhatsApp/confirmación con datos de prueba y revisar mensajes de errores, recotización, stock y abandono.
- [ ] **UX-02 — GA4/consentimiento:** integración de código lista en modo básico; spec aprobado. Falta crear stream/obtener Measurement ID, validar payloads/red con propiedad real y configurar CSP/variables del hosting. Sin ID, GA4 permanece apagado.
- [ ] **SEO-01 — Indexación:** comprobar que solo base de tienda, categorías y remates individuales acordados son indexables; combinaciones no canónicas deben ser `noindex` y canonicalizarse a su ruta limpia. Search Console, sitemap publicado, inspección de URLs, datos enriquecidos y resultados reales quedan pendientes; Lighthouse local no predice rankings.
- [ ] **SEO-02 — Rendimiento de campo:** medir Core Web Vitals en producción y comparar el coste de SSR dinámico requerido por la CSP con el piloto Astro.

### Astro

- [x] **ASTRO-01 — Preview base:** `/privacidad` estático compila, comparte `src/app/globals.css`, responde HTTP 200 y Lighthouse da 100/100 en SEO/accesibilidad.
- [x] **ASTRO-02 — Consentimiento/GA4:** opciones, revocación a “Solo necesarias” y sincronización entre pestañas; script GA4 externo solo se solicita con consentimiento y `PUBLIC_GA_MEASUREMENT_ID`. No se verificó CSP del hosting.
- [x] **ASTRO-03a — Paridad de privacidad:** texto, fecha, correo y enlaces del piloto comparados con Next; nombre y correo ahora vienen de `src/lib/site.ts`.
- [x] **ASTRO-03b — Paridad legal restante:** `/terminos` y `/cookies` ya compilan en el preview Astro y se compararon con sus páginas Next; contenido y enlaces legales están alineados.
- [ ] **ASTRO-04 — Rutas:** confirmar cómo el proveedor enruta solo páginas migradas a Astro y mantiene API/checkout/admin en Next; documentar rollback y validar rutas antes de tráfico real.
- [ ] **ASTRO-05 — CSP:** demostrar que Astro recibe encabezados compatibles; el script externo puede bloquearse bajo la CSP `strict-dynamic` actual si se hereda sin política específica.
- [ ] **ASTRO-06 — Catálogo:** no importar `lib/catalog.ts` en Astro; diseñar y probar contrato de API antes de migrar portada/tienda/producto.
- [x] **ASTRO-07a — Paridad de páginas legales:** canonical, Open Graph, navegación y Lighthouse comparados en las tres páginas editoriales; no usan JSON-LD ni imágenes de contenido.
- [ ] **ASTRO-07b — Paridad para nuevas rutas:** mantener la comparación de sitemap y assets al migrar más páginas; el sitemap de producción sigue siendo responsabilidad de Next hasta decidir el hosting.

### Release y mantenimiento

- [ ] **REL-01 — Git:** revisar el diff/estado antes de publicar y confirmar la sincronización con GitHub. En la última inspección, `main` estaba tres commits por delante de `origin/main`; la referencia remota local no permite confirmar el estado actual en GitHub.
- [ ] **REL-05 — Gestor de paquetes:** `package.json`/`package-lock.json` fijan `drizzle-kit` `^0.31.11`, pero `pnpm-lock.yaml` conserva `^0.18.1`/`0.18.1`. Confirmar si el proyecto admite pnpm y regenerar su lockfile en un entorno con pnpm/red, o documentar npm como único gestor soportado y retirar el lock/workspace obsoleto en un cambio revisado. No editar resoluciones manualmente.
- [ ] **REL-02 — Verificación final:** ejecutar typecheck, lint, builds de Next y Astro, Lighthouse, smoke tests de rutas y pruebas de integración de pedidos tras aplicar migraciones. Guardar evidencia con los campos definidos arriba y parar siempre el servidor de smoke test, incluso si falla una ruta.

## Registro de agentes

| Fase | Agente/herramienta usada | Configuración local | Resultado |
| --- | --- | --- | --- |
| 0 / preparación | AutoSkills (instalación previa) | `cobijo-logic-guardian`, `cobijo-design-qa`, `astro-migration-scout`, `release-verifier` creados en `.opencode/agents/` | Cuatro perfiles disponibles; no implica que todos se hayan ejecutado. |
| SEO | Subagente `general`, instruido con `.agents/skills/seo/SKILL.md` | No existe `.opencode/agents/seo*.md` | Auditoría de solo lectura y hallazgos corregidos. AutoSkills instaló una **skill SEO**, no un agente SEO. |
| Astro (actual) | Subagente `general`, siguiendo el perfil `astro-migration-scout`; scaffold y página piloto creados manualmente en esta sesión | Se reutiliza `astro-migration-scout.md`; no se crea otro agente | Scout recomienda empezar por legales. La llamada a `architect` falló por límite de uso y no produjo cambios; completé manualmente el piloto y sus validaciones. |
| Cookie banner Astro | Subagente `general`, siguiendo `cobijo-design-qa.md` y `.agents/skills/accessibility/SKILL.md` | Perfil preexistente, solo lectura | Revisión encontró temas de revocación, sincronización y foco; correcciones aplicadas y verificadas en Chrome. CSP del hosting sigue pendiente. |
| GA4 | Implementación directa y verificaciones locales | Sin agente adicional | Usuario aprobó `docs/specs/ga4-analytics.md`; modo básico. Astro: prueba Chrome con ID ficticio, opt-in/page_view/revocación y destinos de Google bloqueados. Next: prueba Chrome sin ID, banner y preferencias/revocación; sin solicitudes de Google. Falta probar tag Next y ambas plataformas con Measurement ID real/hosting. |
| Seguridad Netlify | Subagente `security-auditor`, solo lectura | No se editó durante auditoría | Hallazgos priorizados: IP/proxy y rate limit distribuido dependen de Netlify/DB; secretos admin; propagación CSP; endpoint de pedido y cron. Se corrigió después el `await` faltante en newsletter y se verificó por HTTP en un entorno aislado local. |
| Release | Ejecución directa de scripts y Lighthouse desde esta sesión | `release-verifier` existe | Typecheck/lint/build/Lighthouse/smoke se corrieron aquí; el agente local de release no se invocó como agente aparte. |
| Auditoría integral (2026-11-25) | Tres subagentes de solo lectura: seguridad, SEO/accesibilidad y plan/spec | Sin acceso a `.env.local`; no se inspeccionó producción | Se reportaron riesgos de cabeceras proxy, fallback del rate limit, límite de cuerpo JSON, catálogo de muestra, filtros indexables y trazabilidad del plan. Los cambios locales de código y documentación están implementados, pero no verificados con typecheck, lint, build ni hosting. No marcar las validaciones como completas sin evidencia. |
