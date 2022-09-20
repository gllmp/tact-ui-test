import { createBrush, pickColor } from "../utils/canvas";
import { CanvasGrid } from "../utils/grid";
import { sleep } from "../utils/time";
import { TouchNode } from "../utils/touch";
import { GestureHandlers } from "./typings";

const DEFAULT_PARAMS = {
  radius: 20,
  hardness: 0.5,
  alpha: 1,
};

export default (grid: CanvasGrid): GestureHandlers => {
  const palette = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;

  return {
    onMove: (node, params = DEFAULT_PARAMS) => {
      const fx = "drip";
      const touch = node.getTouch();
      const brush = createBrush({ ...touch, ...params }, grid.image);
      return { fx, params, touch, brush };
    },
    afterMove: async function* (node, params = DEFAULT_PARAMS) {
      const isHorizontal = Math.abs(node.getGesture().moveY) < 200;
      if (!isHorizontal) return;
      const dots = node
        .toArray()
        .filter((t) => t.pos === 1 || t.pos % 8 === 0)
        .concat(node.getLast());

      for (const dot of dots) {
        yield* this.afterTap(new TouchNode(dot.getItem()), {
          ...params,
          radius: 20,
        });
      }
    },
    afterTap: async function* (node, params = DEFAULT_PARAMS, opts = {}) {
      const gesture = node.rain(grid.height);
      const fx = opts.fx || "drip";
      for (const renode of gesture.toArray()) {
        if (!renode.isLast) await sleep((opts.wait as number) || renode.elapsed);
        const touch = renode.getTouch();
        const brush = createBrush({ ...touch, ...params }, grid.image);
        yield { fx, params, touch, brush, wait: 1 };
      }
    },
    onHold: (node, params = DEFAULT_PARAMS) => {
      const fx = "stick";
      const touch = node.getTouch();
      const radius = Math.min((params.radius * node.elapsed) / 1000, 60);
      palette.canvas.width = radius * 2;
      palette.canvas.height = radius * 2;
      palette.arc(radius, radius, radius, 0, Math.PI * 2);
      palette.clip();
      palette.fillStyle = pickColor(touch, grid.image);
      palette.fillRect(0, 0, radius * 2, radius * 2);
      return {
        fx,
        touch,
        brush: palette,
        params,
      };
    },
  } as GestureHandlers;
};
