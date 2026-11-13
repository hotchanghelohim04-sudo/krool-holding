import { readFile } from "node:fs/promises";
import path from "node:path";

import { getTranslations } from "next-intl/server";
import { ImageResponse } from "next/og";

/** Image de partage (réseaux sociaux, messageries) générée au build pour chaque langue. */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Krool Holding";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const logo = await readFile(path.join(process.cwd(), "public/brand/logo-mark.svg"));
  const logoSrc = `data:image/svg+xml;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0d0d0f",
          color: "#f7f5f0",
          borderBottom: "12px solid #c9a24b",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- rendu dans une image, pas dans le DOM */}
          <img src={logoSrc} width={96} height={96} alt="" />
          <div style={{ display: "flex", fontSize: 40, letterSpacing: 8, color: "#c9a24b" }}>KROOL HOLDING</div>
        </div>
        <div style={{ display: "flex", fontSize: 60, lineHeight: 1.15, maxWidth: 1000 }}>{t("title")}</div>
        <div style={{ display: "flex", fontSize: 26, color: "#a1a7b0" }}>krool-holding.com</div>
      </div>
    ),
    size,
  );
}
