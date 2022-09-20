import { createBrush, pickColor } from "../utils/canvas";
import { CanvasGrid } from "../utils/grid";
import { sleep } from "../utils/time";
import { GestureHandlers } from "./typings";

const DEFAULT_PARAMS = {
  radius: 10,
  hardness: 1,
  alpha: 0.5,
};

export default (grid: CanvasGrid): GestureHandlers =>
  ({
    onMove: (node, params = DEFAULT_PARAMS) => {
      const fx = "spread";
      const touch = node.getTouch();
      const base = node.getFirst().getTouch();
      const brush = createBrush({ ...base, ...params }, grid.image);
      return { fx, params, touch, brush };
    },
    afterTap: async function* (node, params = DEFAULT_PARAMS) {
      const fx = "spread";
      const first = node.getTouch();
      const gesture = node.rain(grid.height, false);
      for (const renode of gesture.toArray()) {
        const touch = renode.getTouch();
        const brush = createBrush({ ...first, ...params }, grid.image);
        if (!renode.isLast) await sleep(20);
        yield { fx, params, touch, brush };
      }
    },
    onHold: (node, params = DEFAULT_PARAMS) => {
      const fx = "stick";
      const touch = node.getTouch();
      const radius = Math.min((params.radius * node.elapsed) / 1000, 80);
      const brush = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      const [width, height] = Array(2).fill(radius * 2);
      brush.canvas.width = width;
      brush.canvas.height = height;
      brush.fillStyle = pickColor(touch, grid.image);
      brush.fillRect(0, 0, width, height);
      return { fx, touch, brush, params: { ...params, radius } };
    },
  } as GestureHandlers);
