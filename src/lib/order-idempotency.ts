const KEY_PREFIX = "edna-order-key:";
const PENDING_PREFIX = "edna-order-pending:";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Huella corta: evita guardar dirección, correo o teléfono en sessionStorage. */
function fnv1a(bytes: Uint8Array, offset: number, step: number): number {
  let hash = 0x811c9dc5;
  for (let index = offset; index < bytes.length; index += step) {
    hash = Math.imul(hash ^ bytes[index], 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function fingerprint(signature: string): string {
  const bytes = new TextEncoder().encode(signature);
  // Dos recorridos alternos dan 64 bits sin depender de BigInt (target ES2017).
  return (
    fnv1a(bytes, 0, 2).toString(16).padStart(8, "0") +
    fnv1a(bytes, 1, 2).toString(16).padStart(8, "0")
  );
}

function createKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Reutiliza la clave mientras la firma del carrito no cambie, incluso tras recargar. */
export function getOrCreateOrderIdempotencyKey(cartSignature: string): string | null {
  if (typeof window === "undefined") return null;
  const storageKey = `${KEY_PREFIX}${fingerprint(cartSignature)}`;
  try {
    const saved = window.sessionStorage.getItem(storageKey);
    if (saved && UUID_PATTERN.test(saved)) return saved;
    const key = createKey();
    window.sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return null;
  }
}

/** Marca la navegación confirmada; la clave se borra al cargar la página del pedido. */
export function markOrderRedirect(cartSignature: string, orderCode: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(`${PENDING_PREFIX}${fingerprint(cartSignature)}`, orderCode);
  } catch {
    // Almacenamiento no disponible: la clave sigue sirviendo para repetir el envío.
  }
}

/** Solo se llama después de que el navegador haya abierto /pedido/[code]. */
export function clearRedirectedOrderKey(orderCode: string): void {
  if (typeof window === "undefined") return;
  try {
    const pending: string[] = [];
    for (let index = 0; index < window.sessionStorage.length; index += 1) {
      const key = window.sessionStorage.key(index);
      if (key?.startsWith(PENDING_PREFIX)) pending.push(key);
    }
    for (const key of pending) {
      if (window.sessionStorage.getItem(key) !== orderCode) continue;
      window.sessionStorage.removeItem(`${KEY_PREFIX}${key.slice(PENDING_PREFIX.length)}`);
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // No afecta a la orden ya creada.
  }
}
