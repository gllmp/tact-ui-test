/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { RangeNumber } from "./number";

export const getCoordForCanvas = (e: { clientX: number; clientY: number }, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.round(((e.clientX - rect.left) / rect.width) * canvas.width),
    y: Math.round(((e.clientY - rect.top) / rect.height) * canvas.height),
  };
};

export const createBrush = (
  { x, y, radius }: { x: number; y: number; radius?: RangeNumber | number },
  canvas: CanvasImageSource
): CanvasRenderingContext2D => {
  const ctx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
  return copy({ x, y, size: Math.max(1, Number(radius ?? 0)) }, canvas, ctx) as CanvasRenderingContext2D;
};

/**
 * Takes an image and returns a rounded context filled with a portion of it
 */
export const copy = (
  {
    x,
    y,
    size,
    operation = "source-over",
  }: {
    x: number;
    y: number;
    size: number;
    operation?: string;
  },
  image: CanvasImageSource,
  dstCtx?: CanvasRenderingContext2D
) => {
  const dstCanvas = dstCtx?.canvas ?? document.createElement("canvas");
  dstCanvas.width = size;
  dstCanvas.height = size;
  const safeDstCtx = dstCtx ?? (dstCanvas.getContext("2d") as CanvasRenderingContext2D);
  if (!image) return safeDstCtx;
  const { srcX, srcY, width, height } = getRectangleCanvas(safeDstCtx.canvas, image, {
    x,
    y,
  });

  if (width <= 0 || height <= 0) return safeDstCtx;

  safeDstCtx.save();
  safeDstCtx.globalCompositeOperation = operation;
  safeDstCtx.beginPath();
  safeDstCtx.arc(width / 2, height / 2, Math.min(width / 2, height / 2), 0, Math.PI * 2);
  safeDstCtx.clip();
  safeDstCtx.drawImage(image, srcX, srcY, width, height, 0, 0, width, height);
  safeDstCtx.restore();
  return safeDstCtx;
};

export const setupLine = (x: number, y: number, targetX: number, targetY: number) => {
  const deltaX = targetX - x;
  const deltaY = targetY - y;
  const deltaRow = Math.abs(deltaX);
  const deltaCol = Math.abs(deltaY);
  const counter = Math.max(deltaCol, deltaRow);
  const axis = counter === deltaCol ? 1 : 0;

  // setup a line draw.
  return {
    position: [x, y],
    delta: [deltaX, deltaY],
    deltaPerp: [deltaRow, deltaCol],
    inc: [Math.sign(deltaX), Math.sign(deltaY)],
    accum: Math.floor(counter / 2),
    counter,
    endPnt: counter,
    axis,
    u: 0,
  };
};

export const advanceLine = (line: ReturnType<typeof setupLine>) => {
  // eslint-disable-next-line no-plusplus
  --line.counter;
  line.u = 1 - line.counter / line.endPnt;
  if (line.counter <= 0) {
    return false;
  }
  const { axis } = line;
  const perp = 1 - axis;
  line.accum += line.deltaPerp[perp];
  if (line.accum >= line.endPnt) {
    line.accum -= line.endPnt;
    line.position[perp] += line.inc[perp];
  }
  line.position[axis] += line.inc[axis];
  return true;
};

export const createTransparentGradient = (ctx: CanvasRenderingContext2D, stops: [number, number][]): CanvasGradient => {
  const innerRadius = Math.min(ctx.canvas.width, ctx.canvas.height);
  const outerRadius = Math.max(ctx.canvas.width, ctx.canvas.height);
  const [centerX, centerY] = [ctx.canvas.width, ctx.canvas.height].map((e) => e / 2);
  const gradient = ctx.createRadialGradient(
    centerX,
    centerY,
    innerRadius,
    centerX,
    centerY,
    outerRadius
  ) as CanvasGradient;
  for (const [stop, opacity] of stops) {
    gradient.addColorStop(stop, `rgba(0, 0, 0, ${Math.min(opacity, 1)})`);
  }
  return gradient;
};

export const getRectangleCanvas = (
  canvas: HTMLCanvasElement,
  baseCanvas: CanvasImageSource,
  { x, y }: { x: number; y: number }
): {
  height: number;
  width: number;
  srcX: number;
  srcY: number;
} => {
  let { width, height } = canvas;
  let srcX = x - width / 2;
  let srcY = y - height / 2;

  // clear the brush canvas
  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.clearRect(0, 0, width, height);

  // clip the rectangle to be inside
  if (srcX < 0) {
    width += srcX;
    srcX = 0;
  }
  const overX = srcX + width - (baseCanvas.width as number);
  if (overX > 0) {
    width -= overX;
  }

  if (srcY < 0) {
    height += srcY;
    srcY = 0;
  }
  const overY = srcY + height - (baseCanvas.height as number);
  if (overY > 0) {
    height -= overY;
  }
  return { width, height, srcX, srcY };
};

export const pickColor = ({ x, y }: { x: number; y: number }, canvas: HTMLCanvasElement): string => {
  const imageData = canvas.getContext("2d")?.getImageData(x, y, 1, 1);
  if (!imageData || !imageData.data || !imageData.data.length) return "transparent";
  const [r, g, b, a] = imageData.data;
  return `rgba(${r}, ${g}, ${b}, ${a ?? 1})`;
};
