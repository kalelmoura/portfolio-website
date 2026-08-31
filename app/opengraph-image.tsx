import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = `${SITE_NAME} — Software Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px",
          background: "#f6f9f7",
          position: "relative",
        }}
      >
        {/* accent blobs, echoing the site's background */}
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 620,
            height: 620,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(34,197,94,0.34), rgba(34,197,94,0) 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -220,
            left: -140,
            width: 640,
            height: 640,
            borderRadius: 999,
            background: "radial-gradient(circle, rgba(37,99,235,0.28), rgba(37,99,235,0) 70%)",
          }}
        />

        <div
          style={{
            display: "flex",
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#16a34a",
          }}
        >
          Portfolio
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "#0b1530",
          }}
        >
          Gabriel Kalel
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 82,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-0.035em",
            color: "#0b1530",
          }}
        >
          Rosa Moura
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 34,
            fontSize: 34,
            color: "#41506b",
          }}
        >
          Software Engineer · Computer Science student
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 54,
            gap: 16,
          }}
        >
          {["Machine Learning", "AI Engineering", "Full-Stack"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                borderRadius: 999,
                border: "2px solid rgba(11,21,48,0.10)",
                background: "rgba(255,255,255,0.75)",
                padding: "12px 26px",
                fontSize: 26,
                color: "#41506b",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
