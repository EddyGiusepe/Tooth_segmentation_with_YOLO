/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * DetectionLegend.tsx
 * ====================
 * Renders the list of FDI teeth detected by the model.
 *
 * Each entry shows:
 *  - A colour swatch matching the mask colour in the annotated image.
 *  - The FDI tooth name (e.g. UR1_T1, LL4_T27).
 *  - The model's confidence score as a percentage bar.
 */

"use client";

import React from "react";

export interface Detection {
  name:       string;
  confidence: number;  // 0 to 1
  color:      string;  // hex, e.g. "#e63946"
}

interface DetectionLegendProps {
  detections: Detection[];
}

export default function DetectionLegend({ detections }: DetectionLegendProps) {
  if (detections.length === 0) {
    return (
      <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
        No teeth detected with the current threshold.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-2">
      <h3
        style={{
          color: "var(--text-primary)",
          fontSize: "0.875rem",
          fontWeight: 600,
          marginBottom: "4px",
          letterSpacing: "0.02em",
        }}
      >
        Detected teeth ({detections.length})
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          maxHeight: "420px",
          overflowY: "auto",
          paddingRight: "4px",
        }}
      >
        {detections.map((d) => (
          <div
            key={d.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--bg-secondary)",
              borderRadius: "8px",
              padding: "8px 10px",
              border: "1px solid var(--border)",
            }}
          >
            {/* Colour swatch */}
            <span
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "3px",
                backgroundColor: d.color,
                flexShrink: 0,
              }}
            />

            {/* FDI name */}
            <span
              style={{
                color: "var(--text-primary)",
                fontSize: "0.8rem",
                fontFamily: "monospace",
                minWidth: "80px",
                flexShrink: 0,
              }}
            >
              {d.name}
            </span>

            {/* Confidence bar */}
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  flex: 1,
                  height: "6px",
                  background: "var(--border)",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.round(d.confidence * 100)}%`,
                    backgroundColor: d.color,
                    borderRadius: "3px",
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.72rem",
                  minWidth: "34px",
                  textAlign: "right",
                }}
              >
                {Math.round(d.confidence * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
