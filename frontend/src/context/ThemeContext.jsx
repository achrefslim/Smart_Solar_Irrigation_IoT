import { createContext, useContext, useEffect, useMemo, useState } from "react";

export const darkTheme = {
  mode: "dark",
  bg: "#070d1a",
  card: "#0d1321",
  text: "#f0f4ff",
  border: "rgba(0,229,255,0.15)",
  secondary: "#9ca3af",
  shadow: "0 20px 45px rgba(0,0,0,0.28)",
  panelTint: "transparent",
  accent: "#00e5ff",
  success: "#22c55e",
  danger: "#ef4444",
  neutral: "#94a3b8",
  userBubble: "rgba(0,229,255,0.16)",
  botBubble: "rgba(255,255,255,0.06)",
  buttonText: "#0f172a",
  weatherFallback: "#f0f4ff",
  gaugeTrack: "rgba(0,229,255,0.15)",
  gaugeValue: "#00e5ff",
  gaugeFillStart: "#00e5ff",
  gaugeFillEnd: "#00ff88",
  gaugeGradientShade: "dark",
};

export const lightTheme = {
  mode: "light",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  border: "rgba(0,0,0,0.06)",
  secondary: "#64748b",
  shadow: "0 4px 20px rgba(0,0,0,0.04)",
  panelTint: "#f1f5f9",
  accent: "#00e5ff",
  success: "#22c55e",
  danger: "#ef4444",
  neutral: "#94a3b8",
  userBubble: "rgba(14,165,233,0.08)",
  botBubble: "rgba(148,163,184,0.08)",
  buttonText: "#0f172a",
  weatherFallback: "#64748b",
  gaugeTrack: "rgba(0,0,0,0.06)",
  gaugeValue: "#0f172a",
  gaugeFillStart: "#7dd3fc",
  gaugeFillEnd: "#38bdf8",
  gaugeGradientShade: "light",
};

export const ThemeContext = createContext({
  theme: darkTheme,
  darkMode: true,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("dashboard_dark_mode");
    return saved === null ? true : saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("dashboard_dark_mode", String(darkMode));
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      darkMode,
      toggleTheme,
    }),
    [darkMode, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
