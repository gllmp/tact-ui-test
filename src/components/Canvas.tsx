import React, { useCallback, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useGesture, UserGestureConfig } from "@use-gesture/react";
import { useRecoilValue } from "recoil";

import CreditsStep from "./Credits";
import { useCanvas } from "../hooks/canvas";
import { useRegistry, TouchHandler } from "../hooks/registry";
import { useVFX } from "../hooks/vfx";
import { GESTURE_ENUM } from "../hooks/xebra";
import { useRafLoop } from "../hooks/raf";
import { getCoordForCanvas } from "../utils/canvas";
import { TouchItem, TouchNode } from "../utils/touch";
import { Instruction } from "../scenes/typings";
import { hasNext } from "../state";

const Canvas: React.FC = () => {
  const { scene } = useParams<{ scene: string }>();
  const [mainCanvas, grid] = useCanvas({ scene });
  const [vfx, gestures] = useVFX(grid, scene);
  const { read, write, clear } = useRegistry();
  const isInteractive = useRecoilValue(hasNext(scene));
  const options = useMemo<UserGestureConfig>(
    () => ({
      transform: ([clientX, clientY]) => {
        const canvas = mainCanvas.current as HTMLCanvasElement;
        if (!canvas) return [clientX, clientY];
        const { x, y } = getCoordForCanvas({ clientX, clientY }, canvas);
        return [x, y];
      },
      target: mainCanvas,
      eventOptions: { passive: false },
      enabled: true,
      preventDefault: true,
      pointer: { touch: true },
    }),
    [mainCanvas]
  );

  const [startLoop, stopLoop, isActive] = useRafLoop((time, id) => {
    const node = read(id);
    if (!node || typeof gestures?.onHold !== "function") return;
    const elapsed = Math.round(time - node.t);
    if (elapsed <= TouchNode.SPEED_THRESHOLD) return;
    const { fx, ...instruction } = gestures.onHold(node);
    vfx[fx as keyof typeof vfx](instruction as Instruction);
  });

  const activeMovingNode = useCallback<(t: TouchItem) => boolean>(
    (touch) => {
      const { h: isHolding } = touch;
      return !isHolding && !grid?.isMarked(touch);
    },
    [grid]
  );

  const onStart = useCallback<TouchHandler>(
    (node) => {
      if (!isActive(node.id)) startLoop(node.id);
    },
    [isActive, startLoop]
  );
  const onMove = useCallback<TouchHandler>(
    (node) => {
      if (node.elapsed < 2 || typeof gestures?.onMove !== "function") return;
      stopLoop(node.id);
      const { fx, ...instruction } = gestures.onMove(node);
      vfx[fx as keyof typeof vfx](instruction as Instruction);
    },
    [gestures, vfx, stopLoop]
  );
  const onEnd = useCallback<TouchHandler>(
    async (node) => {
      const { id, isTap = false, move = 0 } = node.getGesture();
      const isMoving = !isTap && Math.abs(move) > TouchNode.TAP_THRESHOLD;
      const isHolding = !isTap && !isMoving && isActive(id);
      stopLoop(id);

      if (isTap && !isHolding) {
        if (typeof gestures?.onTap === "function") {
          const { fx, ...instruction } = gestures.onTap(node);
          await vfx[fx as keyof typeof vfx](instruction as Instruction);
        }
        if (typeof gestures?.afterTap === "function") {
          for await (const { fx, ...inst } of gestures.afterTap(node)) {
            await vfx[fx as keyof typeof vfx](inst as Instruction);
          }
        }
      }

      clear(id);
      // After effects (closed on new gesture)
      if (isHolding && typeof gestures?.afterHold === "function") {
        for await (const { fx, ...instruction } of gestures.afterHold(node)) {
          if (read(id)) break;
          await vfx[fx as keyof typeof vfx](instruction as Instruction);
        }
      } else if (isMoving && typeof gestures?.afterMove === "function") {
        for await (const { fx, ...instruction } of gestures.afterMove(node)) {
          if (read(id)) break;
          await vfx[fx as keyof typeof vfx](instruction as Instruction);
        }
      }
    },
    [isActive, stopLoop, clear, gestures, vfx, read]
  );

  useEffect(
    () => () => {
      if (typeof gestures?.cleanup === "function") gestures.cleanup();
    },
    [gestures]
  );

  useGesture<{
    onTouchStart: TouchEvent;
    onTouchMove: TouchEvent;
    onTouchEnd: TouchEvent;
    onPointerDown: PointerEvent;
    onPointerMove: PointerEvent;
    onPointerUp: PointerEvent;
  }>(
    {
      onTouchStart: ({ event }) => {
        write(event, GESTURE_ENUM.pointerdown).forEach(onStart);
      },
      onTouchMove: ({ event }) => {
        write(event, GESTURE_ENUM.pointermove).filter(activeMovingNode).forEach(onMove);
      },
      onTouchEnd: ({ event }) => {
        write(event, GESTURE_ENUM.pointerup).filter(activeMovingNode).forEach(onEnd);
      },
      onPointerDown: ({ event }) => {
        write(event, GESTURE_ENUM.pointerdown);
      },
      onPointerMove: ({ event }) => {
        write(event, GESTURE_ENUM.pointermove).filter(activeMovingNode).forEach(onMove);
      },
      onPointerUp: ({ event }) => {
        write(event, GESTURE_ENUM.pointerup).filter(activeMovingNode).forEach(onEnd);
      },
    },
    options
  );

  return (
    <div style={{ width: "100%", backgroundColor: scene === "panorama" ? "white" : "black" }}>
      {isInteractive || scene === "panorama" ? <canvas id="foreground" ref={mainCanvas} /> : <CreditsStep />}
    </div>
  );
};

export default Canvas;
