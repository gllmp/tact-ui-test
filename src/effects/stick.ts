import { Effect } from "./typings";

export const stick: Effect =
  (srcCanvas) =>
  async ({ touch: { x, y }, brush }) => {
    if (!srcCanvas || !srcCanvas.context || !brush) return;
    const { width, height } = brush.canvas;
    const drawX = x - width / 2 > 0 ? x - width / 2 : 0;
    const drawY = y - height / 2 > 0 ? y - height / 2 : 0;
    srcCanvas.draw(brush.canvas, drawX, drawY);
  };
