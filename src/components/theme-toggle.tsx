"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle theme">
      <span className="theme-toggle-label">{theme === "light" ? "Light" : "Dark"}</span>
      <span className="theme-toggle-icon">{theme === "light" ? "Sun" : "Moon"}</span>
    </button>
  );
}
