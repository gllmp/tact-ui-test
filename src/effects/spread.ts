import { Effect } from "./typings";
import { advanceLine, setupLine } from "../utils/canvas";
import { raf } from "../utils/time";
import { lerp, divide } from "../utils/number";

export const spread: Effect =
  (srcCanvas) =>
  async ({ touch, params, brush }) => {
    const { x, y, moveX = 0, moveY = 0 } = touch;
    const dstX = x + moveX;
    const dstY = y + moveY;
    if (typeof x !== "number" || x < 0) return;
    if (typeof y !== "number" || y < 0) return;
    if (!srcCanvas || !srcCanvas.image || !srcCanvas.context || !brush) return;

    const { hardness = 1, alpha = 0.5 } = params;
    const { width, height } = brush.canvas;
    const line = setupLine(x, y, (dstX as number) ?? x, (dstY as number) ?? y);
    const [centerX, centerY] = [width, height].map(divide(4));

    const draw = async (): Promise<void> => {
      const [drawX, drawY] = line.position;
      srcCanvas.context.save();
      srcCanvas.context.globalAlpha = (alpha as number) * lerp(hardness as number, 1, line.u);
      srcCanvas.draw(brush.canvas, drawX - centerX, drawY - centerY);
      srcCanvas.context.restore();
      if (advanceLine(line)) return draw();
    };
    return raf(draw);
  };
