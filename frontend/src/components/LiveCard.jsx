import React, { useMemo } from "react";

import { useTheme } from "../context/ThemeContext";

function LiveCard({ label, value, accentColor }) {
  const { theme } = useTheme();

  const cardStyle = useMemo(
    () => ({
      backgroundColor: theme.card,
      border: `1px solid ${theme.border}`,
      borderLeft: `4px solid ${accentColor}`,
      borderRadius: 16,
      padding: 18,
      minHeight: 112,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      color: theme.text,
      boxShadow: theme.shadow,
    }),
    [accentColor, theme]
  );

  return (
    <div style={cardStyle}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: theme.secondary,
          marginBottom: 10,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: accentColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default React.memo(LiveCard);
