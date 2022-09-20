import { useEffect, useMemo, useState } from "react";
import * as effects from "../effects";
import { EffectRunner } from "../effects/typings";
import { GestureHandlers } from "../scenes/typings";
import { CanvasGrid } from "../utils/grid";
import { noop } from "../utils/time";

export type Effects = Record<keyof typeof effects, EffectRunner>;
type VFXHookResult = [Effects, GestureHandlers | undefined];

export const useVFX = (grid: CanvasGrid, scene: string): VFXHookResult => {
  const [gestures, setGestures] = useState<GestureHandlers>();
  const vfx = useMemo<Effects>(
    () => Object.fromEntries(Object.entries(effects).map(([name, fx]) => [name, grid ? fx(grid) : noop])) as Effects,
    [grid]
  );

  useEffect(() => {
    if (grid && scene) import(`../scenes/${scene}`).then((mod) => setGestures(mod.default(grid)));
  }, [grid, scene]);

  return [vfx, gestures];
};
