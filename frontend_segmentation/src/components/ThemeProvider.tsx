/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * ThemeProvider.tsx
 * =================
 * Client-side wrapper around next-themes ThemeProvider.
 *
 * Must be a "use client" component because next-themes reads localStorage
 * and applies the theme class to <html> — operations that only exist in
 * the browser.
 *
 * Configuration:
 *  - attribute="class"         → next-themes adds/removes the "dark" class on <html>
 *  - defaultTheme="dark"       → dark is the default (matches our CSS variables)
 *  - enableSystem={false}      → we offer manual toggle only (dark / light)
 *  - disableTransitionOnChange → prevents flash of unstyled transition on theme switch
 *
 * Usage in layout.tsx (Server Component):
 *   <ThemeProvider>
 *     {children}
 *   </ThemeProvider>
 */

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
