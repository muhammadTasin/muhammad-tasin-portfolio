"use client";

import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
}

interface ClickSparkProps {
  color?: string;
  sparkCount?: number;
  sparkSize?: number;
}

export default function ClickSpark({
  color,
  sparkCount = 12,
  sparkSize = 2.5,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    let lastTime = performance.now();
    let animationId: number;
    const animate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      // 16.67ms is the standard 60fps frame duration
      const timeScale = Math.min(delta / 16.67, 3);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sparks = sparksRef.current;

      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];

        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size * spark.life, 0, Math.PI * 2);
        ctx.fillStyle = spark.color;
        ctx.fill();

        // Scale updates by timeScale
        spark.x += spark.vx * timeScale;
        spark.y += spark.vy * timeScale;
        spark.vy += 0.04 * timeScale;
        spark.life -= 0.025 * timeScale;

        if (spark.life <= 0) {
          sparks.splice(i, 1);
        }
      }

      animationId = requestAnimationFrame(animate);
    };
    // Bootstrap first frame
    animationId = requestAnimationFrame((t) => {
      lastTime = t;
      animate(t);
    });

    const handleClick = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      const resolvedColor =
        color ||
        (typeof window !== "undefined"
          ? getComputedStyle(document.documentElement).getPropertyValue("--acid").trim() || "#c8ff43"
          : "#c8ff43");

      const count = sparkCount;
      const sparks = sparksRef.current;

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = 1.5 + Math.random() * 3.5;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1,
          size: sparkSize + Math.random() * 2,
          color: resolvedColor,
        });
      }
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("click", handleClick);
      cancelAnimationFrame(animationId);
    };
  }, [color, sparkCount, sparkSize]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 99999,
      }}
    />
  );
}
