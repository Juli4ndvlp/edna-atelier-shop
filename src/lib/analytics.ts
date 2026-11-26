"use client";

export type Ga4EventName = "add_to_cart" | "begin_checkout" | "generate_lead";

type Ga4Arguments = [command: string, ...parameters: unknown[]];

declare global {
  interface Window {
    dataLayer?: Ga4Arguments[];
    gtag?: (...args: Ga4Arguments) => void;
    __ednaAnalyticsEnabled?: boolean;
  }
}

export function trackGa4Event(eventName: Ga4EventName): void {
  if (!window.__ednaAnalyticsEnabled || !window.gtag) return;
  // Deliberately send event names only. No product, customer, order, or message data.
  window.gtag("event", eventName);
}
