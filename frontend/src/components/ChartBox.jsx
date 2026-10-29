import React from "react";

import SensorChart from "./SensorChart";

function ChartBox({ chartData }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: 320,
      }}
    >
      <SensorChart data={chartData} />
    </div>
  );
}

export default React.memo(ChartBox);
