import React, { useEffect } from "react";

import { useTheme } from "../context/ThemeContext";

function ElectricBg() {
  const { darkMode } = useTheme();

  useEffect(() => {
    const container = document.getElementById("electric-global-bg");
    if (!darkMode || !container) return undefined;

    const lineCount = 7;
    const flowCount = 25;
    let animationFrame = null;

    for (let index = 0; index < lineCount; index += 1) {
      const line = document.createElement("div");
      line.className = "pulse-line";
      container.appendChild(line);
    }

    const flows = [];

    for (let index = 0; index < flowCount; index += 1) {
      const el = document.createElement("div");
      el.className = "electric-flow";
      el.style.left = `${Math.random() * window.innerWidth}px`;
      el.style.top = `${Math.random() * window.innerHeight}px`;
      container.appendChild(el);
      flows.push(el);
    }

    const animateFlow = () => {
      flows.forEach((el) => {
        let y = parseFloat(el.style.top);
        y += 1 + Math.random() * 2;
        if (y > window.innerHeight) y = -10;
        el.style.top = `${y}px`;
      });

      animationFrame = window.requestAnimationFrame(animateFlow);
    };

    animateFlow();

    return () => {
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }

      container.innerHTML = "";
    };
  }, [darkMode]);

  if (!darkMode) return null;

  return <div id="electric-global-bg" />;
}

export default React.memo(ElectricBg);
