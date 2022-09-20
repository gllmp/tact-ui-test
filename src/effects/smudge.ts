import { RangeNumber } from "../utils/number";

export const smudge = (
  {
    x = 0,
    y = 0,
    radius = 0,
    hardness = 1,
    stops = [
      [0, 1],
      [1, 0],
    ],
    translate,
    operation = "source-atop",
    filter = () => false,
  }: {
    radius?: number | RangeNumber;
    x?: number;
    y?: number;
    hardness?: number | RangeNumber;
    stops?: [number, number][];
    operation?: string;
    translate?: boolean;
    filter?: boolean | ((rad: number) => boolean);
  },
  ctx: CanvasRenderingContext2D
): void => {
  const { width, height } = ctx.canvas;
  const innerRadius = Number(radius ?? 0) * 0.75 ?? Math.min(width, height) / 2;
  const outerRadius = Number(radius ?? Math.max(width, height) / 2);
  const centerX = x + outerRadius;
  const centerY = y + outerRadius;
  ctx.save();
  ctx.globalCompositeOperation = operation;
  if (typeof filter === "function" ? filter(innerRadius) : filter) {
    ctx.filter = `blur(${Math.max(
      1,
      80 * Math.max(0.25, 1 - (hardness as number)) * Math.max(0.1, 1 - (radius as number) / 80)
    ).toFixed(0)}px)`;
  }
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
  const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius * 1.5);
  for (const [stop, opacity] of stops) {
    gradient.addColorStop(stop, `rgba(0, 0, 0, ${Math.min((hardness as number) * opacity, 1)})`);
  }
  ctx.fillStyle = gradient;
  if (translate) {
    ctx.translate(-outerRadius, -outerRadius);
    ctx.fillRect(-outerRadius, -outerRadius, width, height);
  } else ctx.fill();
  ctx.restore();
};
