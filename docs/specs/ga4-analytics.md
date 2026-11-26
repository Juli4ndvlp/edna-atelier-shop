# Integración de Google Analytics 4

## Contexto

EDNA ATELIER quiere medir el tráfico y las conversiones de la tienda, en especial
las interacciones que llevan a una consulta o pedido por WhatsApp. Next.js sigue
siendo el sitio activo; Astro es un piloto aislado. GA4 debe respetar las
preferencias existentes y no recibir datos personales ni detalles de pedidos.

## Criterios de aceptación

- Dado que no existe consentimiento analítico, cuando se visita una página, no se
  descarga el tag de Google ni se envía ninguna solicitud de medición.
- Dado que el usuario acepta analítica, cuando visita páginas públicas, se carga
  GA4 y se registran vistas de página incluso al navegar dentro de Next.js.
- Dado que el usuario rechaza o revoca analítica, cuando confirma “Solo
  necesarias” o desmarca analítica, desde ese momento no se envían más pageviews
  ni eventos GA4 en esa pestaña ni en otras pestañas abiertas. No se inserta un
  tag nuevo hasta una aceptación posterior. La aceptación posterior puede
  cargar GA4 de nuevo. “Dejar de enviar” se verifica por ausencia de solicitudes
  de medición después de confirmar la revocación; no se presupone que el código
  ya descargado se pueda retirar de la memoria del navegador.
- Dado que la persona añade un producto, inicia checkout o pulsa un CTA de
  WhatsApp, se registran respectivamente `add_to_cart`, `begin_checkout` y
  `generate_lead`, sin incluir nombre, teléfono, correo, dirección, contenido del
  mensaje, código de pedido ni URL con identificadores.
- Dado que la ruta es `/admin`, `/api` o `/pedido/[code]`, no se envían pageviews
  ni eventos a GA4.
- La medición usa una variable de entorno pública de configuración (`G-...`), no
  un ID hardcodeado; si falta, el sitio funciona sin tracking ni errores.
- Next.js y el preview Astro usan el mismo ID cuando el piloto se habilite, y la
  política CSP permite solo los destinos de Google que requiera el tag.
- La política de privacidad/cookies describe GA4 y las categorías que controla;
  no se afirma que esto sea asesoría ni certificación legal.

## Fuera de alcance

- Google Tag Manager, Google Ads, remarketing, Consent Mode avanzado o medición
  sin consentimiento.
- Eventos de compra/ingresos: los pedidos por WhatsApp no confirman por sí solos
  un pago y no hay una pasarela de pago conectada.
- Tracking del panel admin, PII, códigos de pedido, grabación de sesiones o
  perfiles de usuario.
- Publicar el piloto Astro o cambiar el enrutamiento del dominio.

## Supuestos

- Se usará el tag directo de GA4, no un contenedor de Google Tag Manager.
- El consentimiento será “básico”: GA4 no se carga hasta que la persona acepte
  analítica; rechazar marketing no habilita GA4.
- La elección analítica ya se conserva en
  `edna-atelier-cookie-consent-v1`; se conectará sin cambiar la semántica de
  “Solo necesarias”.
- La configuración del stream web y su Measurement ID se crea en la cuenta
  Google de EDNA ATELIER; el agente no tiene acceso a esa cuenta.

## Preguntas abiertas

- Falta crear el stream web de GA4 y proporcionar su Measurement ID `G-...`.
- Antes de producción se debe confirmar el proveedor de hosting para la CSP y
  cargar la variable en sus entornos; Astro no recibe aún los headers de Next.

## Impacto

`CookieBanner`, `src/proxy.ts`, layout y eventos de Next; script/consentimiento,
variables de entorno y política de privacidad/cookies. Al habilitar el preview,
también `apps/marketing-astro`. No requiere cambios de base de datos.

## Verificación

- Prueba de navegador/red: sin consentimiento no se solicita ningún recurso o
  endpoint de Google; con consentimiento se carga y reporta vistas/eventos.
- Prueba de revocación en la misma pestaña y entre pestañas: aceptar analítica,
  confirmar una solicitud de prueba, revocar, navegar/disparar eventos y
  comprobar que no aparecen solicitudes nuevas; repetir con dos pestañas y
  confirmar que solo una nueva aceptación vuelve a habilitar medición.
- Inspección de payloads para confirmar ausencia de PII, códigos y mensajes.
- Desde `C:\Users\Julian\Documents\cobijo`: `npm run typecheck`,
  `npm run lint` y `npm run build` (Next.js).
- Desde `C:\Users\Julian\Documents\cobijo\apps\marketing-astro`:
  `npm run check` y `npm run build` (Astro).
- Guardar evidencia con fecha, URL/entorno, commit o `sin commit`, versión de
  herramienta y artefacto de resultados. Probar CSP real antes de producción.
