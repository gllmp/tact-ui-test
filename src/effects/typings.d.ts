import { CanvasGrid } from "../utils/grid";
import { RangeNumber } from "../utils/number";

export interface Coordinates {
  x: number;
  y: number;
  moveX?: number;
  moveY?: number;
}
export interface BaseEffectParams {
  radius: RangeNumber | number;
  hardness: RangeNumber | number;
  alpha: RangeNumber | number;
}

interface EffectBaseOpts {
  touch: Coordinates;
  params: BaseEffectParams;
  brush?: CanvasRenderingContext2D;
}
type EffectCustomOpts = Record<
  Exclude<string, keyof EffectBaseOpts>,
  RangeNumber | number | boolean | string | unknown
>;

export type EffectRunner<T = EffectCustomOpts> = (opts: EffectBaseOpts & T) => Promise<void>;

export type EffectParams<T = EffectCustomOpts> = BaseEffectParams & T;

export type Effect<T extends EffectCustomOpts = EffectCustomOpts> = (baseCanvas?: CanvasGrid) => EffectRunner<T>;
