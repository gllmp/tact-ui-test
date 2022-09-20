import { useCallback, useMemo } from "react";
import { BaseEffectParams } from "../effects/typings";
import { RangeNumber } from "../utils/number";
import { sleep } from "../utils/time";
import { getTouchesFromPointerEvent, getTouchesFromTouchEvent, TouchNode } from "../utils/touch";
import { useParameters } from "./parameters";
import { GESTURE_ENUM, useXebra } from "./xebra";

export type TouchHandler = (node: TouchNode) => void | Promise<void>;
interface TouchRegistry {
  clear: (id: number) => void;
  write: (event: TouchEvent | PointerEvent, type: GESTURE_ENUM) => TouchNode[];
  read: (id: number) => TouchNode | null;
  replay: (
    id: number,
    op: "flip-x" | "flip-y" | "flip" | "translate" | "rotate" | "rain" | "unveil",
    cb: (t: TouchNode) => Promise<void>,
    speed?: number
  ) => Promise<void>;
  scale: (id?: number) => BaseEffectParams;
  onUnveilAll: (cb: () => void) => boolean;
}

const touchEvents = ["touchstart", "touchmove", "touchend"];
const isTouchEvent = (e: Event): e is TouchEvent => touchEvents.includes(e.type);

export const useRegistry = (): TouchRegistry => {
  const nodes = useMemo(() => new Map<number, TouchNode>(), []);
  const stops = useMemo(() => new Map<number, boolean>(), []);
  const parameters = useParameters();
  const { sendTouch } = useXebra();

  const read = useCallback<TouchRegistry["read"]>((id) => nodes.get(id) ?? null, [nodes]);

  const getActiveTouches = useCallback(
    (id?: number) => [...nodes.keys()].filter((key) => (typeof id === "number" ? key !== id : true)),
    [nodes]
  );

  const onUnveilAll = useCallback<TouchRegistry["onUnveilAll"]>(
    (cb) => {
      sendTouch(GESTURE_ENUM.auto, { id: -2, t: 0, touches: [] });
      cb();
      return false;
    },
    [sendTouch]
  );

  const scale = useCallback<TouchRegistry["scale"]>(
    () => parameters,
    [parameters]
    // (id) =>
    //   [...nodes.entries()]
    //     .filter(([key]) => (typeof id === "number" ? id === key : true))
    //     .reduce(
    //       (acc, [, node]) => ({
    //         ...acc,
    //         radius: (acc.radius as RangeNumber).grow(node.holding / 1000),
    //       }),
    //       parameters as EffectParams
    //     ),
    // [nodes, parameters]
  );

  const write = useCallback<TouchRegistry["write"]>(
    (event, type) =>
      (isTouchEvent(event) ? getTouchesFromTouchEvent(event) : getTouchesFromPointerEvent(event)).map((touch) => {
        const { id, h: isHolding } = touch;
        const node = new TouchNode(touch, nodes.get(id));
        !isHolding &&
          sendTouch(type, {
            ...node.getTouch(),
            touches: [...((event as TouchEvent).targetTouches ?? [])].map(({ identifier: id }) => id),
          });
        nodes.set(id, node);
        stops.set(id, true);
        return node;
      }),
    [nodes, stops, sendTouch]
  );

  const replay = useCallback<TouchRegistry["replay"]>(
    async (id, op, cb, sRate = 1) => {
      const chain = nodes.get(id);
      if (!chain) return;

      stops.delete(id);
      let updatedNode = chain.size >= 3 ? chain.slice(Math.floor(chain.size * 0.65)) : chain;
      if (!updatedNode) return;
      switch (op) {
        case "flip-x":
        case "flip-y":
          const [, mode] = op.split("-");
          updatedNode = updatedNode.getFirst().flip(mode);
          break;
        case "flip":
          updatedNode = updatedNode.getFirst().flip("xy");
          break;
        case "translate":
          const { moveX, moveY } = updatedNode.getGesture();
          updatedNode = updatedNode.getFirst().translate(moveX, moveY);
          break;
        case "rotate":
          const rotation = Math.PI / 4;
          updatedNode = updatedNode.getFirst().rotate(rotation);
          break;
        case "rain":
          // @FIXME find a way to provide the maximum height of the rain drops
          updatedNode = updatedNode.getFirst().rain(1600);
          break;
        case "unveil":
          updatedNode = updatedNode.getLast().slice(-1) as TouchNode;
          break;
      }

      const startTime = op === "rain" ? Infinity : new Date().getTime();
      for (const node of updatedNode.toArray()) {
        if (stops.has(id) || !node || new Date().getTime() - startTime > 3000) break;
        const touches = getActiveTouches(id);
        const { x, y, t } = node.getItem();
        sendTouch(GESTURE_ENUM.auto, { id, t, x, y, touches });
        if (!node.isLast) await sleep(node.elapsed / sRate);
        await cb(node);
      }
    },
    [nodes, stops, sendTouch, getActiveTouches]
  );

  const clear = useCallback<TouchRegistry["clear"]>(
    (id) => {
      [nodes, stops].forEach((e) => e.delete(id));
      Object.values(parameters).forEach((param) => (param as RangeNumber).reset());
    },
    [nodes, stops, parameters]
  );

  return {
    clear,
    write,
    read,
    replay,
    scale,
    onUnveilAll,
  };
};
