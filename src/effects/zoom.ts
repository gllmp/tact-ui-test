import { createBrush } from "../utils/canvas";
import { raf } from "../utils/time";
import { Effect } from "./typings";

export const zoom: Effect =
  (srcCanvas) =>
  async ({ touch: { x, y }, params: { radius = 10 } }) => {
    if (!srcCanvas || !srcCanvas.image || !srcCanvas.context) return;
    const ctx = createBrush({ x, y, radius }, srcCanvas.image);
    const [drawX, drawY] = [x, y].map((v) => (v - (radius as number) / 2 > 0 ? v - (radius as number) / 2 : 0));
    const draw = async () => {
      srcCanvas.context.save();
      ctx.scale(2, 2);
      ctx.translate(-radius, -radius);
      srcCanvas.draw(ctx.canvas, drawX, drawY);
      srcCanvas.context.restore();
    };
    return raf(draw);
  };
