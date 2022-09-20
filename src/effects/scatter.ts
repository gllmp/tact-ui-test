import { unveil } from "./unveil";
import { Effect, EffectRunner } from "./typings";

type ScatterParams = {
  srcX: number;
  srcY: number;
  wait?: number;
};
export const scatter: Effect<
  ScatterParams & {
    fx?: EffectRunner<ScatterParams>;
  }
> =
  (srcCanvas) =>
  async ({ touch, params, ...opts }) => {
    if (!srcCanvas) return;
    const { x, y } = touch;
    const { srcX = x, srcY = y } = opts;
    if (srcCanvas.has({ x, y }, 15)) {
      return unveil(srcCanvas)({ params, touch: { x: srcX, y: srcY } });
    }
    if (typeof opts.fx === "function") return opts.fx({ params, touch, srcX, srcY, wait: 100 });
  };
