import { Effect } from "./typings";
import { smudge } from "./smudge";
import { setupLine, advanceLine, copy, createBrush } from "../utils/canvas";
import { divide, lerp, random } from "../utils/number";
import { raf, sleep } from "../utils/time";

export const drip: Effect<{ wait?: number }> =
  (srcCanvas) =>
  async ({ touch, params, brush, ...opts }) => {
    const { x, y, moveX = 0, moveY = 0 } = touch;
    const dstX = x + moveX;
    const dstY = y + moveY;
    const { radius, hardness, alpha } = params;
    if (typeof x !== "number" || x < 0) return;
    if (!srcCanvas || !srcCanvas.context || !srcCanvas.image) return;
    const ctx = brush ?? createBrush({ x, y, radius }, srcCanvas.image);
    const { width, height } = ctx.canvas;
    ctx.clearRect(0, 0, width, height);
    const line = setupLine(
      x,
      y ?? random(srcCanvas.height / 5),
      (dstX as number) ?? x,
      (dstY as number) ?? srcCanvas.height
    );
    const mainCtx = srcCanvas.context;
    const [centerX, centerY] = [width, height].map(divide(2));

    const draw = async () => {
      const [drawX, drawY] = line.position;
      mainCtx.save();
      mainCtx.globalAlpha = (alpha as number) * lerp(hardness as number, 1, line.u);
      srcCanvas.draw(ctx.canvas, drawX - centerX, drawY - centerY);
      copy(
        {
          x: drawX,
          y: drawY,
          size: radius as number,
        },
        srcCanvas.image,
        ctx
      );
      smudge(
        {
          radius,
          stops: [
            [0, 1],
            [1, 0],
          ],
          translate: true,
        },
        ctx
      );
      mainCtx.restore();
      if (advanceLine(line)) {
        if (opts.wait) await sleep(((opts.wait as number) /= 1.1), 1);
        await draw();
      }
    };
    return raf(draw);
  };
