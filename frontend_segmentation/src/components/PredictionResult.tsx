/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * PredictionResult.tsx
 * =====================
 * Displays the annotated X-ray image returned by the backend.
 *
 * The image arrives as a base64-encoded PNG string and is rendered
 * directly via a data URL — no server round-trip needed for the image.
 *
 * Also provides a one-click download button so the user can save the
 * annotated result locally.
 */

"use client";

import React from "react";

interface PredictionResultProps {
  imageB64: string;  // base64 PNG string (without prefix)
}

export default function PredictionResult({ imageB64 }: PredictionResultProps) {
  const dataUrl = `data:image/png;base64,${imageB64}`;

  const handleDownload = () => {
    const link      = document.createElement("a");
    link.href       = dataUrl;
    link.download   = `dental_segmentation_${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <h3
        style={{
          color: "var(--text-primary)",
          fontSize: "0.875rem",
          fontWeight: 600,
          letterSpacing: "0.02em",
        }}
      >
        Result of the Segmentation
      </h3>

      {/* Annotated image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dataUrl}
        alt="Panoramic dental radiography with segmentation masks"
        style={{
          width: "100%",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          objectFit: "contain",
        }}
      />

      {/* Download button */}
      <button
        onClick={handleDownload}
        style={{
          alignSelf: "flex-end",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
          borderRadius: "8px",
          padding: "6px 14px",
          fontSize: "0.78rem",
          cursor: "pointer",
          transition: "color 0.2s, border-color 0.2s",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color       = "var(--text-primary)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color       = "var(--text-muted)";
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        }}
      >
        ⬇ Download image
      </button>
    </div>
  );
}
