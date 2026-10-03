/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * page.tsx
 * ========
 * Main page of the Dental Segmentation application.
 *
 * Flow:
 *  1. User uploads a dental X-ray (drag-and-drop or file picker).
 *  2. User adjusts the confidence threshold slider (default 0.35).
 *  3. User clicks "Analisar" — the image is sent to the FastAPI backend
 *     via POST /predict (multipart/form-data).
 *  4. The backend returns the annotated image (base64 PNG) and the list
 *     of detected FDI tooth classes with their colours.
 *  5. PredictionResult shows the annotated image with a download button.
 *  6. DetectionLegend shows each tooth name, colour swatch, and confidence bar.
 */

"use client";

import React, { useState } from "react";
import DetectionLegend, { type Detection } from "@/components/DetectionLegend";
import ImageUploader from "@/components/ImageUploader";
import PredictionResult from "@/components/PredictionResult";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

interface PredictResponse {
  image_b64:  string;
  detections: Detection[];
}

export default function HomePage() {
  const [file, setFile]             = useState<File | null>(null);
  const [conf, setConf]             = useState<number>(0.35);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [result, setResult]         = useState<PredictResponse | null>(null);
  const [resetUploader, setReset]   = useState(false);

  // Submit
  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("conf", String(conf));

      const response = await fetch(`${BACKEND_URL}/predict`, {
        method: "POST",
        body:   formData,
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.detail ?? `Error ${response.status}: ${response.statusText}`);
      }

      const data: PredictResponse = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setConf(0.35);
    setReset((v) => !v);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1100px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
      }}
    >
      {/* Title */}
      <div>
        <h2
          style={{
            color: "var(--text-primary)",
            fontSize: "1.4rem",
            fontWeight: 700,
            marginBottom: "6px",
          }}
        >
          Automatic Dental Segmentation
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", lineHeight: 1.6 }}>
          Send a panoramic radiography and the YOLOv8m-seg model will identify
          and segment each tooth according to the FDI system (32 classes).
        </p>
      </div>

      {/* Input panel */}
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        {/* Upload */}
        <ImageUploader
          onFileSelected={setFile}
          reset={resetUploader}
        />

        {/* Confidence slider */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label
              htmlFor="conf-slider"
              style={{ color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Confidence threshold
            </label>
            <span
              style={{
                color: "var(--accent)",
                fontSize: "0.85rem",
                fontWeight: 700,
                fontFamily: "monospace",
                background: "rgba(59,130,246,0.12)",
                padding: "2px 10px",
                borderRadius: "6px",
              }}
            >
              {conf.toFixed(2)}
            </span>
          </div>
          <input
            id="conf-slider"
            type="range"
            min={0.10}
            max={0.95}
            step={0.05}
            value={conf}
            onChange={(e) => setConf(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--accent)", cursor: "pointer" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
              0.10 — more detections
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: "0.72rem" }}>
              more selective — 0.95
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleSubmit}
            disabled={!file || loading}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: "10px",
              border: "none",
              background: !file || loading ? "var(--border)" : "var(--accent)",
              color: !file || loading ? "var(--text-muted)" : "#fff",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: !file || loading ? "not-allowed" : "pointer",
              transition: "background 0.2s",
            }}
          >
            {loading ? "⏳ Analyzing..." : "🔍 Analyze"}
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            style={{
              padding: "11px 18px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "transparent",
              color: "var(--text-muted)",
              fontSize: "0.9rem",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            ↺ Clear
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid var(--danger)",
              borderRadius: "8px",
              padding: "10px 14px",
              color: "var(--danger)",
              fontSize: "0.83rem",
            }}
          >
            ⚠ {error}
          </div>
        )}
      </div>

      {/* Results panel */}
      {result && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "24px",
            alignItems: "start",
          }}
        >
          {/* Annotated image */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "20px",
            }}
          >
            <PredictionResult imageB64={result.image_b64} />
          </div>

          {/* Legend */}
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "20px",
              position: "sticky",
              top: "16px",
            }}
          >
            <DetectionLegend detections={result.detections} />
          </div>
        </div>
      )}

    </div>
  );
}
