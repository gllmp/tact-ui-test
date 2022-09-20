import { GestureHandlers } from "./typings";
import { sleep } from "../utils/time";
import { createBrush, pickColor } from "../utils/canvas";
import { CanvasGrid } from "../utils/grid";
import { TouchNode } from "../utils/touch";

const DEFAULT_PARAMS = {
  radius: 32,
  hardness: 0.5,
  alpha: 1,
};
const MAX_RADIUS = 120;

export default (grid: CanvasGrid): GestureHandlers => {
  return {
    onMove: (node, params = DEFAULT_PARAMS) => {
      const fx = node.velocity.v[0] > TouchNode.SPEED_THRESHOLD ? "drip" : "spread";
      const touch = node.getTouch();
      const base = (fx === "spread" ? node.getFirst() : node).getTouch();
      const brush = createBrush({ ...base, ...params }, grid.image);
      return { fx, params, touch, brush };
    },
    afterTap: async function* (node, params = DEFAULT_PARAMS) {
      const gesture = node.rain(grid.height);
      const fx = "drip";
      for (const renode of gesture.toArray()) {
        const touch = renode.getTouch();
        const brush = createBrush({ ...touch, ...params }, grid.image);
        if (!renode.isLast) await sleep(node.elapsed);
        yield { fx, params, touch, brush };
      }
    },
    onHold: (node, params = DEFAULT_PARAMS) => {
      const fx = "stick";
      const touch = node.getTouch();
      const radius = Math.min((params.radius * node.elapsed) / 4000, MAX_RADIUS);
      const brush = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
      const width = radius;
      const height = radius * 2;
      brush.canvas.width = width;
      brush.canvas.height = height;
      brush.fillStyle = pickColor(touch, grid.image);
      brush.fillRect(0, 0, width, height);
      return { fx, touch, brush, params: { ...params, radius } };
    },
  } as GestureHandlers;
};
