import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#d8ff3e",
          color: "#090a0a",
          border: "3px solid #090a0a",
          borderRadius: 12,
          fontSize: 30,
          fontFamily: "Arial Black, sans-serif",
          fontWeight: 900,
        }}
      >
        EA
      </div>
    ),
    size,
  );
}
