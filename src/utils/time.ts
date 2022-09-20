import { animationFrames, map, Observable, takeWhile } from "rxjs";

/**
 * @param duration Sleep time in milliseconds
 */
export const sleep = (duration: number, max = 0): Promise<void> =>
  new Promise((res) => setTimeout(res, Math.max(duration, max)));

export const repeat = (cb: (...args: unknown[]) => void, delay: number, limit?: number): (() => void) => {
  let counter = 0;
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    counter++;
    if (limit && counter > limit) return clearInterval(interval);
    cb();
  }, delay);
  return () => {
    if (interval) clearInterval(interval);
  };
};

export const raf = (cb: (...args: unknown[]) => Promise<void>): Promise<void> =>
  new Promise((res, rej) => {
    try {
      requestAnimationFrame(() => cb().then(res));
    } catch (err) {
      rej(err);
    }
  });

export const noop = async (): Promise<void> => void 0;

export const fade$ = (duration: number): Observable<number> =>
  animationFrames().pipe(
    map(({ elapsed }) => elapsed / duration),
    takeWhile((alpha) => alpha >= 0 && alpha <= 1)
  );
