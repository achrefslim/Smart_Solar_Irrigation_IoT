import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

import { useTheme } from "../context/ThemeContext";

function SensorChart({ data }) {
  const { theme } = useTheme();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return undefined;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: data.labels,
        datasets: [
          {
            label: "Power (W)",
            data: data.puissance,
            borderWidth: 3,
            tension: 0.35,
            yAxisID: "y",
            fill: false,
            borderColor: theme.success,
          },
          {
            label: "Energy (Wh)",
            data: data.energie,
            borderWidth: 3,
            tension: 0.35,
            yAxisID: "y1",
            fill: false,
            borderColor: theme.accent,
          },
        ],
      },
      options: {
        responsive: true,
        animation: false,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            ticks: { color: theme.secondary },
            grid: { color: theme.border },
          },
          y: {
            position: "left",
            title: { display: true, text: "Power (W)", color: theme.text },
            ticks: { color: theme.secondary },
            grid: { color: theme.border },
          },
          y1: {
            position: "right",
            title: { display: true, text: "Energy (Wh)", color: theme.text },
            ticks: { color: theme.secondary },
            grid: { drawOnChartArea: false },
          },
        },
        plugins: {
          legend: {
            labels: { color: theme.text },
          },
          tooltip: {
            backgroundColor: theme.card,
            titleColor: theme.text,
            bodyColor: theme.text,
            borderColor: theme.border,
            borderWidth: 1,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [theme]);

  useEffect(() => {
    if (!chartInstance.current) return;

    chartInstance.current.data.labels = data.labels;
    chartInstance.current.data.datasets[0].data = data.puissance;
    chartInstance.current.data.datasets[1].data = data.energie;
    chartInstance.current.update("none");
  }, [data]);

  return (
    <canvas
      ref={chartRef}
      width="650"
      height="300"
      style={{ width: "100%", maxWidth: "100%", maxHeight: "100%" }}
    />
  );
}

export default React.memo(SensorChart);
