import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRecoilState } from "recoil";
import { getScene } from "../scenes";
import { Scene } from "../scenes/typings";
import { sceneState } from "../state";
import { CanvasGrid } from "../utils/grid";
import { fade$ } from "../utils/time";

export type DrawFn = (ctx: CanvasRenderingContext2D, frame: number) => void;
export interface CanvasHookArgs {
  context?: "2d" | "3d";
  predraw?: (context: CanvasRenderingContext2D) => void;
  postdraw?: (context: CanvasRenderingContext2D) => void;
  scene: string;
  recorderRef?: React.ForwardedRef<HTMLCanvasElement>;
}
export type CanvasHookResult = [React.RefObject<HTMLCanvasElement>, CanvasGrid];

export const useCanvas = ({ scene: sceneName }: CanvasHookArgs): CanvasHookResult => {
  const [grid, setGrid] = useState<CanvasGrid>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [current, setScene] = useRecoilState(sceneState);
  const { name, imageSrc, transitionIn } = useMemo(() => current as Scene, [current]);

  const loadBackground = useCallback(
    (src: string): void => {
      const image = new Image();
      image.src = src;
      image.onload = function () {
        if (!canvasRef.current) return;
        const { width, height } = image;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        const ctx = canvasRef.current.getContext("2d") as CanvasRenderingContext2D;

        if (typeof transitionIn === "number") {
          ctx.canvas.style.opacity = "0";
          ctx.drawImage(image, 0, 0);
          fade$(transitionIn).subscribe({
            next: (alpha) => {
              ctx.canvas.style.opacity = alpha.toString();
            },
          });
        } else {
          ctx.drawImage(image, 0, 0);
          ctx.canvas.style.opacity = "1";
        }
      };
    },
    [transitionIn]
  );

  useEffect(() => {
    if (imageSrc) loadBackground(imageSrc);
  }, [loadBackground, imageSrc]);

  useEffect(() => {
    if (name !== "credits" && name.indexOf(sceneName) < 0) setScene(getScene(sceneName + "01"));
  }, [name, sceneName, setScene]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!grid) setGrid(canvasRef.current ? new CanvasGrid(canvasRef.current) : undefined);
    return () => grid?.clear();
  });

  return [canvasRef, grid as CanvasGrid];
};
