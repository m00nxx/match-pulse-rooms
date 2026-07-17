import { ImageResponse } from "next/og";

export const alt =
  "Match Pulse Rooms — Feel the match. See the reason.";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

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
          padding: "62px",
          color: "#eff7f0",
          background:
            "radial-gradient(circle at 80% 10%, rgba(200,255,61,.22), transparent 35%), #07110f",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              border: "2px solid #c8ff3d",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c8ff3d",
              fontSize: "22px",
            }}
          >
            M
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "25px",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}
          >
            Match Pulse Rooms
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: "94px",
              fontWeight: 800,
              letterSpacing: "-0.07em",
              lineHeight: 0.93,
            }}
          >
            Feel the match.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "94px",
              fontWeight: 800,
              letterSpacing: "-0.07em",
              lineHeight: 1,
              color: "#8fa49a",
            }}
          >
            See the reason.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "20px",
            color: "#92a59d",
          }}
        >
          <span>Explainable momentum · fan calls · TxLINE signals</span>
          <span
            style={{
              display: "flex",
              borderRadius: "999px",
              background: "#c8ff3d",
              color: "#07110f",
              padding: "12px 20px",
              fontWeight: 700,
            }}
          >
            NO WAGERING
          </span>
        </div>
      </div>
    ),
    size,
  );
}
