import { Effect } from "./typings";
import { setupLine, advanceLine, createBrush } from "../utils/canvas";
import { raf, sleep } from "../utils/time";

export const fall: Effect<{ wait?: number }> =
  (srcCanvas) =>
  async ({ touch, params, brush, ...opts }) => {
    const { x, y, moveX = 0, moveY = 0 } = touch;
    const dstX = x + moveX;
    const dstY = y + moveY;
    const { radius } = params;
    if (typeof x !== "number" || x < 0) return;
    if (!srcCanvas || !srcCanvas.context || !brush) return;
    const line = setupLine(x, y, dstX, dstY);

    const draw = async () => {
      const [drawX, drawY] = line.position;
      const ctx = createBrush({ x: drawX, y: drawY, radius }, brush.canvas);
      srcCanvas.draw(ctx.canvas, drawX, drawY);
      if (advanceLine(line)) {
        if (opts.wait) await sleep(((opts.wait as number) /= 1.1), 1);
        await draw();
      }
    };
    return raf(draw);
  };
