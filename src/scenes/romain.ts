import { GestureHandlers } from "./typings";
import { sleep } from "../utils/time";
import { createBrush } from "../utils/canvas";
import { CanvasGrid } from "../utils/grid";
import { findImage } from ".";

const DEFAULT_PARAMS = {
  radius: 32,
  hardness: 0.5,
  alpha: 1,
};
const TAP_PARAMS = {
  ...DEFAULT_PARAMS,
  radius: 16,
};
const MAX_RADIUS = 120;
const clear = new Image();
const clearCtx = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
clear.src = findImage("romain-02");

export default (grid: CanvasGrid): GestureHandlers => {
  clearCtx.canvas.width = grid.width;
  clearCtx.canvas.height = grid.height;
  clear.onload = () => clearCtx.drawImage(clear, 0, 0);
  return {
    onMove: (node, params = DEFAULT_PARAMS) => {
      const fx = "stick";
      const touch = node.getTouch();
      const brush = createBrush({ ...touch, ...params }, clear);
      return { fx, params, touch, brush };
    },
    afterTap: async function* (node, params = TAP_PARAMS) {
      const gesture = node.fallErratically(8);
      const fx = "fall";
      for (const renode of gesture.toArray()) {
        if (!renode.isLast) await sleep(renode.elapsed);
        const touch = renode.getTouch();
        yield { fx, params, touch, wait: 15, brush: clearCtx };
      }
    },
    onHold: (node, params = DEFAULT_PARAMS) => {
      const fx = "stick";
      const touch = node.getTouch();
      const radius = Math.min((params.radius * node.elapsed) / 2000, MAX_RADIUS);
      const brush = createBrush({ ...touch, ...params, radius }, clear);
      return { fx, touch, brush, params };
    },
  } as GestureHandlers;
};
