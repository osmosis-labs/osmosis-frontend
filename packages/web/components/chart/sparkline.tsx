import { FunctionComponent, useRef, useCallback, useEffect } from "react";

function invertCoordinates(n: number, height: number) {
  return Math.abs(n - height);
}

function scaleToRange(max: number, min: number, height: number, value: number) {
  return ((value - min) / (max - min)) * height;
}

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.style.width = "100%";
  canvas.style.height = "100%";

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}

function getTrendColor(data: number[]) {
  return data[data.length - 1] - data[0] >= 0 ? "#6BDEC9" : "#E91F4F";
}

export const Sparkline: FunctionComponent<{
  width?: number;
  height?: number;
  lineWidth?: number;
  color?: string;
  data: number[];
}> = ({ width, height, color, data, lineWidth = 1 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const trendColor = color ?? getTrendColor(data);

  const shouldFillContainer = !width && !height;

  const drawSparkline = useCallback(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const color = trendColor;
    const height = canvas.height;
    const width = canvas.width;

    const total = data.length;
    const max = Math.max(...data);
    const min = Math.min(...data);

    const xStep = width / total;

    let x = 0;
    let y = invertCoordinates(scaleToRange(max, min, height, data[0]), height);

    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    for (let i = 0; i <= total - 1; i++) {
      const price = data[i];

      x += xStep;
      y = invertCoordinates(
        scaleToRange(max, min, height / 1.2, price),
        height / 1.1
      );

      ctx.lineTo(x, y);
    }

    ctx.stroke();
  }, [data, trendColor]);

  useEffect(() => {
    if (shouldFillContainer) resizeCanvas(canvasRef.current!);
    drawSparkline();
  }, [drawSparkline, shouldFillContainer]);

  useEffect(() => {
    if (!shouldFillContainer) return;

    const _resizeCanvas = () => {
      resizeCanvas(canvasRef.current!);
      drawSparkline();
    };

    window.addEventListener("resize", _resizeCanvas, false);

    return () => window.removeEventListener("resize", _resizeCanvas, false);
  }, [drawSparkline, shouldFillContainer]);

  return (
    <div className="relative h-full">
      <canvas width={width} height={height ?? 230} ref={canvasRef} />
    </div>
  );
};
