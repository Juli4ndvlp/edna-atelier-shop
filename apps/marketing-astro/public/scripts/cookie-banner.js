(() => {
  const STORAGE_KEY = "edna-atelier-cookie-consent-v1";

  function parseConsent(value) {
    if (!value) return null;
    try {
      const parsed = JSON.parse(value);
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof parsed.analytics === "boolean" &&
        typeof parsed.marketing === "boolean"
      ) {
        return parsed;
      }
    } catch {
      // Una preferencia corrupta se trata como ausencia de consentimiento.
    }
    return null;
  }

  function initializeCookieBanner() {
    const banner = document.querySelector("[data-cookie-banner]");
    const settings = banner?.querySelector("[data-cookie-settings]");
    const acceptAll = banner?.querySelector("[data-cookie-accept-all]");
    const saveSelection = banner?.querySelector("[data-cookie-save]");
    const acceptNecessary = banner?.querySelector("[data-cookie-necessary]");
    const configure = banner?.querySelector("[data-cookie-configure]");
    const analyticsInput = banner?.querySelector("[data-cookie-analytics]");
    const marketingInput = banner?.querySelector("[data-cookie-marketing]");
    const status = document.querySelector("[data-cookie-status]");

    if (
      !banner ||
      !settings ||
      !acceptAll ||
      !saveSelection ||
      !acceptNecessary ||
      !configure ||
      !analyticsInput ||
      !marketingInput
    ) {
      return;
    }

    let focusAfterClose = null;
    const showSettings = (returnFocusTo = null) => {
      banner.hidden = false;
      settings.hidden = false;
      configure.hidden = true;
      configure.setAttribute("aria-expanded", "true");
      saveSelection.hidden = false;
      focusAfterClose = returnFocusTo;

      let saved = null;
      try {
        saved = parseConsent(window.localStorage.getItem(STORAGE_KEY));
      } catch {
        // Si el navegador bloquea localStorage, mostramos valores sin guardar.
      }
      analyticsInput.checked = saved?.analytics ?? false;
      marketingInput.checked = saved?.marketing ?? false;
      analyticsInput.focus();
    };

    const persist = (analytics, marketing) => {
      const consent = {
        necessary: true,
        analytics,
        marketing,
        updatedAt: new Date().toISOString(),
      };

      try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
        const secure = window.location.protocol === "https:" ? "; Secure" : "";
      document.cookie = `edna_consent=${encodeURIComponent(
        analytics || marketing ? "accepted" : "necessary",
      )}; Path=/; Max-Age=15552000; SameSite=Lax${secure}`;
      window.dispatchEvent(new CustomEvent("edna:consent-changed"));
      } catch {
        if (status) status.textContent = "No se pudieron guardar las preferencias en este navegador.";
        return;
      }

      banner.hidden = true;
      if (status) status.textContent = "Preferencias de cookies guardadas.";
      requestAnimationFrame(() => {
        if (focusAfterClose?.isConnected) focusAfterClose.focus();
        else document.getElementById("contenido")?.focus({ preventScroll: true });
        focusAfterClose = null;
      });
    };

    try {
      if (parseConsent(window.localStorage.getItem(STORAGE_KEY))) banner.hidden = true;
    } catch {
      // Si el navegador bloquea localStorage, mantenemos visible el banner.
    }

    acceptAll.addEventListener("click", () => persist(true, true));
    acceptNecessary.addEventListener("click", () => persist(false, false));
    configure.addEventListener("click", () => showSettings());
    saveSelection.addEventListener("click", () =>
      persist(analyticsInput.checked, marketingInput.checked),
    );
    window.addEventListener("edna:open-cookies", (event) => {
      showSettings(event.detail?.returnFocusTo ?? null);
    });
    window.addEventListener("storage", (event) => {
      if (event.key !== STORAGE_KEY) return;
      const focusIsInBanner = banner.contains(document.activeElement);
      const consent = parseConsent(event.newValue);
      if (consent) {
        analyticsInput.checked = consent.analytics;
        marketingInput.checked = consent.marketing;
        banner.hidden = true;
        settings.hidden = true;
        saveSelection.hidden = true;
        configure.hidden = false;
        configure.setAttribute("aria-expanded", "false");
        acceptNecessary.hidden = false;
        if (focusIsInBanner) {
          document.getElementById("contenido")?.focus({ preventScroll: true });
        }
      } else {
        analyticsInput.checked = false;
        marketingInput.checked = false;
        banner.hidden = false;
        settings.hidden = true;
        saveSelection.hidden = true;
        configure.hidden = false;
        configure.setAttribute("aria-expanded", "false");
        acceptNecessary.hidden = false;
        if (focusIsInBanner) configure.focus();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeCookieBanner, { once: true });
  } else {
    initializeCookieBanner();
  }

  document.querySelector("[data-open-cookie-settings]")?.addEventListener("click", (event) => {
    window.dispatchEvent(
      new CustomEvent("edna:open-cookies", {
        detail: { returnFocusTo: event.currentTarget },
      }),
    );
  });
})();
