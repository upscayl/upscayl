import { useEffect, useRef } from "react";

const DOT_SPACING = 24;
const DOT_RADIUS = 1.25;
const SPREAD_RADIUS = 140;
const SPREAD_DISTANCE = 18;
const SPREAD_EASING = 0.16;

export default function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let offsets = new Float32Array(0);
    let mouse: { x: number; y: number } | null = null;
    let frame = 0;

    const draw = () => {
      context.clearRect(0, 0, width, height);
      context.fillStyle = "currentColor";
      context.beginPath();

      let settled = true;
      for (let row = 0; row < rows; row++) {
        for (let column = 0; column < columns; column++) {
          const baseX = column * DOT_SPACING;
          const baseY = row * DOT_SPACING;
          const index = (row * columns + column) * 2;

          let targetX = 0;
          let targetY = 0;
          if (mouse) {
            const dx = baseX - mouse.x;
            const dy = baseY - mouse.y;
            const distance = Math.hypot(dx, dy);
            if (distance < SPREAD_RADIUS && distance > 0.001) {
              const strength = (1 - distance / SPREAD_RADIUS) ** 2;
              targetX = (dx / distance) * strength * SPREAD_DISTANCE;
              targetY = (dy / distance) * strength * SPREAD_DISTANCE;
            }
          }

          offsets[index] += (targetX - offsets[index]) * SPREAD_EASING;
          offsets[index + 1] += (targetY - offsets[index + 1]) * SPREAD_EASING;
          if (
            Math.abs(targetX - offsets[index]) > 0.02 ||
            Math.abs(targetY - offsets[index + 1]) > 0.02
          ) {
            settled = false;
          }

          const x = baseX + offsets[index];
          const y = baseY + offsets[index + 1];
          context.moveTo(x + DOT_RADIUS, y);
          context.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
        }
      }

      context.fill();
      return settled;
    };

    const tick = () => {
      frame = draw() ? 0 : requestAnimationFrame(tick);
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      columns = Math.ceil(width / DOT_SPACING) + 1;
      rows = Math.ceil(height / DOT_SPACING) + 1;
      offsets = new Float32Array(columns * rows * 2);
      draw();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (reduceMotion || event.pointerType !== "mouse") return;
      const { left, top } = canvas.getBoundingClientRect();
      mouse = { x: event.clientX - left, y: event.clientY - top };
      start();
    };

    const handlePointerLeave = () => {
      mouse = null;
      start();
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const themeObserver = new MutationObserver(() => {
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("pointermove", handlePointerMove);
    document.documentElement.addEventListener(
      "pointerleave",
      handlePointerLeave,
    );

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener(
        "pointerleave",
        handlePointerLeave,
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full [mask-image:radial-gradient(80%_65%_at_50%_0%,black,transparent)] text-foreground opacity-25 dark:opacity-15"
    />
  );
}
