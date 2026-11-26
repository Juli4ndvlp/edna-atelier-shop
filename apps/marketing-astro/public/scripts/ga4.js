(() => {
  const consentKey = "edna-atelier-cookie-consent-v1";
  const scriptId = "edna-ga4-script";
  const loader = document.currentScript;
  const measurementId = loader?.dataset.gaMeasurementId ?? "";

  if (!/^G-[A-Z0-9]+$/.test(measurementId)) return;

  let active = false;

  function hasAnalyticsConsent() {
    try {
      const consent = JSON.parse(localStorage.getItem(consentKey) ?? "null");
      return consent?.analytics === true;
    } catch {
      return false;
    }
  }

  function clearGoogleCookies() {
    document.cookie
      .split(";")
      .map((cookie) => cookie.trim().split("=")[0])
      .filter((name) => name === "_ga" || name.startsWith("_ga_"))
      .forEach((name) => {
        document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
        if (location.protocol === "https:") {
          document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax; Secure`;
        }
      });
  }

  function disable() {
    active = false;
    document.getElementById(scriptId)?.remove();
    window.dataLayer = [];
    clearGoogleCookies();
  }

  function excludedPath(pathname) {
    return (
      pathname === "/admin" ||
      pathname.startsWith("/admin/") ||
      pathname === "/api" ||
      pathname.startsWith("/api/") ||
      pathname === "/pedido" ||
      pathname.startsWith("/pedido/")
    );
  }

  function sendPageView() {
    if (!active || excludedPath(location.pathname)) return;
    window.gtag?.("event", "page_view", {
      page_location: `${location.origin}${location.pathname}`,
      page_title: document.title,
    });
  }

  function enable() {
    if (!hasAnalyticsConsent()) {
      disable();
      return;
    }

    if (!active) {
      active = true;
      window.dataLayer = window.dataLayer ?? [];
      window.gtag = window.gtag ?? ((...args) => window.dataLayer.push(args));
      window.gtag("js", new Date());
      window.gtag("config", measurementId, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_flags: `SameSite=Lax${location.protocol === "https:" ? ";Secure" : ""}`,
      });

      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        document.head.appendChild(script);
      }

      document.addEventListener("click", onWhatsAppClick, true);
    }
    sendPageView();
  }

  function onWhatsAppClick(event) {
    if (!active || excludedPath(location.pathname) || !(event.target instanceof Element)) return;
    const link = event.target.closest("a[href]");
    if (
      link &&
      /^https:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i.test(link.href)
    ) {
      window.gtag?.("event", "generate_lead");
    }
  }

  window.addEventListener("edna:consent-changed", enable);
  window.addEventListener("storage", (event) => {
    if (event.key !== consentKey && event.key !== null) return;
    if (hasAnalyticsConsent()) enable();
    else disable();
  });

  if (hasAnalyticsConsent()) enable();
})();
