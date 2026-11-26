import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "EDNA ATELIER · Pijamas, Buzos y Remates en Bogotá (San Victorino)";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #090a0a 0%, #20241a 72%, #d8ff3e 170%)",
          color: "#ffffff",
          fontFamily: "Arial Black, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontSize: 44, fontWeight: 900, display: "flex" }}>
            EDNA <span style={{ color: "#d8ff3e", marginLeft: 12 }}>ATELIER</span>
          </div>
          <div
            style={{
              fontSize: 22,
              fontFamily: "sans-serif",
              padding: "10px 22px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.16)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            Taller Bogotá · San Victorino
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
          <div style={{ fontSize: 64, fontWeight: 900, lineHeight: 1.08 }}>
            Pijamas, buzos perchados y remates directos de taller.
          </div>
          <div style={{ fontSize: 28, fontFamily: "sans-serif", color: "#d8ff3e" }}>
            Ventas al detal y por mayor en Bogotá · Pedidos rápidos por WhatsApp
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            fontSize: 22,
            fontFamily: "sans-serif",
            color: "#ffffff",
          }}
        >
          <span>Envío gratis desde $180.000</span>
          <span>·</span>
          <span>Despachos a toda Colombia</span>
        </div>
      </div>
    ),
    size,
  );
}
