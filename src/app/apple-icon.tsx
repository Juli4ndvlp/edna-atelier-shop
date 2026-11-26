import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          border: "5px solid #090a0a",
          borderRadius: 40,
          fontSize: 82,
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
