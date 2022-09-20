import { useCallback, useEffect, useMemo, useRef } from "react";

export type RafLoopReturns = [(id: number) => void, (id: number) => void, (id: number) => boolean];

export const useRafLoop = (
  callback: (time: DOMHighResTimeStamp, id: number) => void,
  initiallyActive = true
): RafLoopReturns => {
  const raf = useRef<Record<number, number | null>>({ 0: null });
  const rafActivity = useRef<Record<number, boolean>>({ 0: false });
  const rafCallback = useRef(callback);
  rafCallback.current = callback;

  const step = useCallback((time: number, id: number) => {
    if (rafActivity.current[id]) {
      rafCallback.current(time, id);
      raf.current[id] = requestAnimationFrame((time) => step(time, id));
    }
  }, []);

  const result = useMemo(
    () =>
      [
        // start
        (id) => {
          if (!rafActivity.current[id]) {
            rafActivity.current[id] = true;
            raf.current[id] = requestAnimationFrame((time) => step(time, id));
          }
        },
        // stop
        (id) => {
          if (rafActivity.current[id]) {
            rafActivity.current[id] = false;
            raf.current && typeof raf.current[id] === "number" && cancelAnimationFrame(raf.current[id] as number);
          }
        },
        // isActive
        (id): boolean => rafActivity.current[id],
      ] as RafLoopReturns,
    [step]
  );

  useEffect(() => {
    if (initiallyActive) {
      result[0](0);
    }
    const activity = rafActivity.current;

    return () => {
      Object.keys(activity).forEach((id) => result[1](+id));
    };
  }, [initiallyActive, result]);

  return result;
};
