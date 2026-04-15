import * as React from "react";
import { Button } from "@/components/ui/button";

export function CanvasDrawing({ onClose }: { onClose: () => void }) {
  return <CanvasDraw onClose={onClose} />;
}

const CanvasDraw = ({ onClose }: { onClose: () => void }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const ctxRef = React.useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = React.useRef(false);

  React.useEffect(() => {
    const canvas = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;

    const detail = document.querySelector(".detail_page") as HTMLElement;
    if (!detail) return;

    const cssWidth = detail.clientWidth;
    const cssHeight = detail.scrollHeight;

    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.strokeStyle = "red";

    ctxRef.current = ctx;
  }, []);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scrollTop = document.querySelector(".detail_page")!.scrollTop;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top + scrollTop,
    };
  };

  const startDrawing = (e: any) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    const ctx = ctxRef.current;
    if (!ctx) return;

    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current;
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
      className="bg_transparent"
    >
      <canvas
        ref={canvasRef}
        style={{
          border: "1px solid #cccccc",
          position: "absolute",
          top: 0,
          left: 0,
          touchAction: "none",
          pointerEvents: "auto",
        }}
        className="bg_transparent"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <div style={{ position: "fixed", top: 0, right: 0, zIndex: 999, display: "flex", gap: 2 }}>
        <Button onClick={onClose} variant="default">
          关闭画板
        </Button>
        <Button onClick={clearCanvas} variant="default">
          清空
        </Button>
      </div>
    </div>
  );
};