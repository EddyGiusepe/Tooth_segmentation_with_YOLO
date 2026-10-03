/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * ImageUploader.tsx
 * =================
 * Drag-and-drop + click-to-browse file upload component.
 *
 * Responsibilities:
 *  - Accept JPEG / PNG images via drag-and-drop or file-picker dialog.
 *  - Show a live preview of the selected image.
 *  - Expose the selected File to the parent via the `onFileSelected` callback.
 *  - Reset when `reset` prop changes to true.
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

interface ImageUploaderProps {
  /** Called whenever the user selects a valid image file. */
  onFileSelected: (file: File) => void;
  /** When true, clears the current selection and preview. */
  reset?: boolean;
}

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export default function ImageUploader({ onFileSelected, reset }: ImageUploaderProps) {
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  // Reset
  useEffect(() => {
    if (reset) {
      setPreview(null);
      setError(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [reset]);

  // File validation and preview
  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        setError("Invalid format. Use JPEG or PNG.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setError("File too large. Maximum: 20 MB.");
        return;
      }
      setError(null);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelected(file);
    },
    [onFileSelected],
  );

  // Drag events
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = ()                   => setDragging(false);
  const onDrop      = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  // Input change
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Image upload area"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
          background: dragging ? "rgba(59,130,246,0.07)" : "var(--bg-card)",
          borderRadius: "12px",
          cursor: "pointer",
          transition: "border-color 0.2s, background 0.2s",
          minHeight: "160px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          padding: "20px",
        }}
      >
        {preview ? (
          /* Preview */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview of the panoramic radiography"
            style={{
              maxHeight: "240px",
              maxWidth: "100%",
              borderRadius: "8px",
              objectFit: "contain",
            }}
          />
        ) : (
          /* Placeholder — example panoramic radiography */
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/x-ray_ui.jpeg"
              alt="Example of a panoramic dental radiography"
              style={{
                maxHeight:   "180px",
                maxWidth:    "100%",
                borderRadius: "8px",
                objectFit:   "contain",
                opacity:     0.55,
              }}
            />
            <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.95rem" }}>
              Drag your panoramic radiography here
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
              or click to select · JPEG / PNG · max. 20 MB
            </p>
          </>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={onInputChange}
      />

      {/* Error message */}
      {error && (
        <p style={{ color: "var(--danger)", fontSize: "0.8rem" }}>⚠ {error}</p>
      )}

      {/* Change image hint */}
      {preview && !error && (
        <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "center" }}>
          Click on the image to select another
        </p>
      )}
    </div>
  );
}
