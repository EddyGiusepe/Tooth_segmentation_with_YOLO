/**
 * Senior Data Scientist/AI Engineering.: Dr. Eddy Giusepe Chirinos Isidro
 *
 * ThemeToggle.tsx
 * ===============
 * Button that switches between dark and light themes.
 *
 * Key implementation details:
 *
 * 1. MOUNTED CHECK
 *    useTheme() returns `resolvedTheme: undefined` during server render and
 *    before the first client paint (localStorage doesn't exist on the server).
 *    Rendering a sun/moon icon based on `undefined` causes a React hydration
 *    mismatch — the icon visibly flips after mount. The `mounted` flag prevents
 *    this: we render a same-size placeholder until the component mounts, then
 *    replace it with the real icon. This is the officially recommended pattern.
 *
 * 2. resolvedTheme (not theme)
 *    `theme` can be "system", "dark", or "light".
 *    `resolvedTheme` is always "dark" or "light" — it resolves "system" using
 *    the OS preference. Always use `resolvedTheme` for rendering icons and
 *    conditional styles so the toggle works correctly when defaultTheme="system".
 *
 * 3. aria-label
 *    Describes what the button *will do* (not the current state) for screen
 *    readers — standard accessible pattern for toggle buttons.
 */

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted]       = useState(false);

  // Only set mounted after hydration — avoids server/client mismatch
  useEffect(() => { setMounted(true); }, []);

  // Placeholder before mounting
  // The server and the first render of the client (before the useEffect) must
  // render exactly the same element — a static <div> without dynamic attributes.
  // Any attribute that depends on the theme (aria-label, title, icon)
  // MUST be outside this block; putting them inside the <button> before mounting
  // causes hydration mismatch because the server doesn't know the theme.
  if (!mounted) {
    return (
      <div
        aria-hidden="true"
        style={{
          width:        "36px",
          height:       "36px",
          borderRadius: "8px",
          border:       "1px solid var(--border)",
          background:   "var(--bg-card)",
          flexShrink:   0,
        }}
      />
    );
  }

  // From here on only executes on the client, after hydration — no risk of mismatch.
  const isDark    = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Change to light theme" : "Change to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
      onClick={() => setTheme(nextTheme)}
      style={{
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        width:          "36px",
        height:         "36px",
        borderRadius:   "8px",
        border:         "1px solid var(--border)",
        background:     "var(--bg-card)",
        cursor:         "pointer",
        fontSize:       "1.1rem",
        transition:     "border-color 0.2s, background 0.2s",
        flexShrink:     0,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLButtonElement).style.background   = "var(--bg-secondary)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
        (e.currentTarget as HTMLButtonElement).style.background   = "var(--bg-card)";
      }}
    >
      {isDark ? (
        /* Dark → show sun (click to change to light) */
        <span role="img" aria-hidden="true">☀️</span>
      ) : (
        /* Light → show moon (click to change to dark) */
        <span role="img" aria-hidden="true">🌙</span>
      )}
    </button>
  );
}
