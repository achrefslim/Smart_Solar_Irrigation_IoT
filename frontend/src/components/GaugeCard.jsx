import React, { useEffect, useMemo, useState } from "react";
import Chart from "react-apexcharts";

import { useTheme } from "../context/ThemeContext";

function GaugeCard({ value = 0 }) {
  const { theme } = useTheme();
  const maxValue = 2;
  const [safeValue, setSafeValue] = useState(0);
  const percentage = (safeValue / maxValue) * 100;

  useEffect(() => {
    const clamped = Math.max(0, Math.min(maxValue, Number(value) || 0));
    setSafeValue(clamped);
  }, [value]);

  const options = useMemo(
    () => ({
      chart: {
        type: "radialBar",
        sparkline: { enabled: true },
        animations: { enabled: true },
      },
      plotOptions: {
        radialBar: {
          startAngle: -120,
          endAngle: 120,
          hollow: { margin: 0, size: "55%", background: "transparent" },
          track: {
            background: theme.gaugeTrack,
            margin: 0,
            strokeWidth: "100%",
          },
          dataLabels: {
            name: { show: false },
            value: {
              offsetY: 12,
              fontSize: "26px",
              fontWeight: 700,
              color: theme.gaugeValue,
              formatter: () => `${((safeValue / maxValue) * 100).toFixed(0)}%`,
            },
          },
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: theme.gaugeGradientShade,
          type: "horizontal",
          gradientToColors: [theme.gaugeFillEnd],
          stops: [0, 100],
        },
        colors: [theme.gaugeFillStart],
      },
      stroke: {
        lineCap: "round",
      },
      labels: ["Performance"],
    }),
    [safeValue, theme]
  );

  const cardStyle = useMemo(
    () => ({
      backgroundColor: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: 18,
      padding: 20,
      minHeight: 260,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textAlign: "center",
      boxShadow: theme.shadow,
    }),
    [theme]
  );

  return (
    <div style={cardStyle}>
      <div
        style={{
          color: theme.secondary,
          fontSize: 12,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: 8,
        }}
      >
        Performance
      </div>

      <Chart options={options} series={[percentage]} type="radialBar" height={240} />

      <div
        style={{
          color: theme.secondary,
          fontSize: 13,
          marginTop: 6,
        }}
      >
        Performance compared to max output
      </div>
    </div>
  );
}

export default React.memo(GaugeCard);
