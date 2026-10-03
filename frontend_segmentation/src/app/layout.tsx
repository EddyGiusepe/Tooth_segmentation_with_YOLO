/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * layout.tsx
 * ==========
 * Root layout of the Dental Segmentation application.
 * Defines global metadata, viewport, fonts, and wraps every page with a
 * consistent dark/light shell managed by next-themes.
 *
 * Notes on suppressHydrationWarning:
 *   next-themes applies the "dark" or "light" class to <html> on the client
 *   after reading localStorage — the server has no knowledge of this class.
 *   suppressHydrationWarning tells React to ignore the class mismatch on
 *   <html> between server and client renders. It only suppresses for that
 *   single element; children are still fully hydration-checked.
 */

import type { Metadata, Viewport } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle }   from "@/components/ThemeToggle";
import "./globals.css";

// Viewport
// Exported separately from metadata as required by Next.js 14+ / 16.
// https://nextjs.org/docs/app/api-reference/functions/generate-viewport
export const viewport: Viewport = {
  width:        "device-width",
  initialScale: 1,
  colorScheme:  "dark light",   // inform the browser that both themes are supported
};

// Metadata
export const metadata: Metadata = {
  title: "Dental Segmentation | YOLOv8m-seg",
  description:
    "Tooth instance segmentation on panoramic dental X-rays using YOLOv8m-seg " +
    "with 32 FDI tooth classes. Upload a panoramic radiography and get instant AI-powered results.",
  authors:  [{ name: "Dr. Eddy Giusepe Chirinos Isidro" }],
  keywords: ["dental", "segmentation", "YOLOv8m-seg", "FDI", "X-ray", "AI", "deep learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * suppressHydrationWarning — necessário porque next-themes injeta a classe
     * "dark" ou "light" no <html> exclusivamente no client (lê localStorage).
     * O servidor não conhece o tema; React ignorará a diferença de classe
     * apenas neste elemento.
     */
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider>
          {/* Header */}
          <header
            className="w-full border-b px-6 py-4 flex items-center gap-3"
            style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
          >
            {/* Tooth icon */}
            <span className="text-2xl" role="img" aria-label="tooth">
              🦷
            </span>

            {/* Title */}
            <div className="flex-1">
              <h1
                className="text-lg font-semibold leading-none"
                style={{ color: "var(--text-primary)" }}
              >
                Dental Segmentation
              </h1>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                YOLOv8m-seg · 32 FDI classes · Panoramic Radiography
              </p>
            </div>

            {/* Theme toggle — aligned to the right */}
            <ThemeToggle />
          </header>

          {/* Main content */}
          <main
            className="flex-1 flex flex-col items-center px-4 py-10"
            style={{ background: "var(--bg-primary)" }}
          >
            {children}
          </main>

          {/* Footer */}
          <footer
            className="w-full border-t px-6 py-3 text-center text-xs"
            style={{
              borderColor: "var(--border)",
              color:       "var(--text-muted)",
              background:  "var(--bg-secondary)",
            }}
          >
            Developed by Senior Data Scientist / AI Engineering.: Dr. Eddy
            Giusepe Chirinos Isidro with ❤️
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
