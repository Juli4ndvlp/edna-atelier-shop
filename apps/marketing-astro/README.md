# EDNA ATELIER — Astro marketing preview

Piloto estático aislado que genera `/privacidad`, `/terminos` y `/cookies`. No
modifica ni reemplaza rutas de Next.js y no debe recibir tráfico de producción
todavía.

## Comandos

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
```

Desde esta carpeta, el preview local sirve `/privacidad` en el puerto 4321.
Define `ASTRO_SITE_URL` al compilar si el preview necesita canonical/OG de otro
dominio. Si deseas habilitar GA4 en este preview, define
`PUBLIC_GA_MEASUREMENT_ID=G-...`; el tag externo solo se solicita con
consentimiento analítico. La hoja compartida es `../../src/app/globals.css`; no
copiar sus tokens.

El preview trae un banner con preferencias guardadas; analítica solo se habilita
tras opt-in y marketing no tiene integraciones. Antes de enrutar tráfico:
verificar CSP/HSTS fuera del proxy de Next y configurar las reglas del hosting.
Ver `../../ASTRO_MIGRATION_PLAN.md` y `../../QUALITY_ROADMAP.md`.
