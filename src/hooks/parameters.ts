import { useMemo } from "react";
import { BaseEffectParams } from "../effects/typings";
import { RangeNumber } from "../utils/number";

export const useParameters = (): BaseEffectParams => {
  const radius = useMemo(() => new RangeNumber(20, { min: 20, max: 80 }), []);
  const hardness = useMemo(() => new RangeNumber(0.5, { min: 0.1 }), []);
  const alpha = useMemo(() => new RangeNumber(0.5, { min: 0.25, max: 0.8 }), []);

  return useMemo(() => ({ radius, hardness, alpha }), [radius, hardness, alpha]);
};
