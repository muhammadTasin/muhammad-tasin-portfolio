"use client";

import React, { useMemo } from "react";

interface GradualBlurProps {
  position?: "top" | "bottom" | "left" | "right";
  strength?: number;
  divCount?: number;
  exponential?: boolean;
  curve?: "linear" | "bezier" | "ease-in";
  opacity?: number;
  height?: string;
  width?: string;
}

export default function GradualBlur({
  position = "top",
  strength = 16,
  divCount = 6,
  exponential = false,
  curve = "bezier",
  opacity = 1,
  height = "88px",
  width = "100%",
}: GradualBlurProps) {
  const layers = useMemo(() => {
    const list = [];
    for (let i = 0; i < divCount; i++) {
      const ratio = (i + 1) / divCount;
      let factor = ratio;

      if (curve === "ease-in") {
        factor = ratio * ratio;
      } else if (curve === "bezier") {
        factor = ratio * ratio * (3 - 2 * ratio);
      }

      if (exponential) {
        factor = Math.pow(ratio, 2);
      }

      const blurVal = factor * strength;
      list.push(blurVal);
    }
    return list;
  }, [divCount, strength, curve, exponential]);

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    pointerEvents: "none",
    zIndex: 90, // sit just behind the site-header
    overflow: "hidden",
    left: 0,
    right: 0,
    display: "flex",
    flexDirection:
      position === "top" || position === "bottom" ? "column" : "row",
    ...(position === "top" && { top: 0, height }),
    ...(position === "bottom" && { bottom: 0, height }),
  };

  return (
    <div style={containerStyle}>
      {layers.map((blur, idx) => {
        const percent = ((idx + 1) / divCount) * 100;
        const prevPercent = (idx / divCount) * 100;

        let mask = "";
        if (position === "bottom") {
          mask = `linear-gradient(to top, rgba(0,0,0,${opacity}) ${prevPercent}%, rgba(0,0,0,0) ${percent}%)`;
        } else if (position === "top") {
          mask = `linear-gradient(to bottom, rgba(0,0,0,${opacity}) ${prevPercent}%, rgba(0,0,0,0) ${percent}%)`;
        }

        const layerStyle: React.CSSProperties = {
          position: "absolute",
          inset: 0,
          backdropFilter: `blur(${blur}px)`,
          WebkitBackdropFilter: `blur(${blur}px)`,
          maskImage: mask,
          WebkitMaskImage: mask,
          pointerEvents: "none",
        };

        return <div key={idx} style={layerStyle} />;
      })}
    </div>
  );
}
