import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js";

import { useTheme } from "../context/ThemeContext";

function HistoricalChart({ data }) {
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
            label: "Real (Wh)",
            data: data.real,
            borderWidth: 3,
            tension: 0.3,
            yAxisID: "y",
            fill: false,
            borderColor: theme.success,
          },
          {
            label: "Prediction (Wh)",
            data: data.predicted,
            borderWidth: 3,
            tension: 0.3,
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
            title: { display: true, text: "Real (W)", color: theme.text },
            ticks: { color: theme.secondary },
            grid: { color: theme.border },
          },
          y1: {
            position: "right",
            title: { display: true, text: "Prediction (Wh)", color: theme.text },
            ticks: { color: theme.secondary },
            grid: { drawOnChartArea: false },
          },
        },
        plugins: {
          legend: {
            labels: { color: theme.text, padding: 15 },
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
    chartInstance.current.data.datasets[0].data = data.real;
    chartInstance.current.data.datasets[1].data = data.predicted;
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

function AccuracyChart({ chartData }) {
  return (
    <div style={{ width: "100%", minHeight: 320 }}>
      <HistoricalChart data={chartData} />
    </div>
  );
}

export default React.memo(AccuracyChart);
