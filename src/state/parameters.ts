import { atom, selector } from "recoil";
import { EffectParams } from "../effects/typings";

export const MIN_RADIUS = 20;
export const MAX_RADIUS = 80;
export const MIN_HARDNESS = 0.1;
export const MAX_HARDNESS = 1;
export const MIN_ALPHA = 0.25;
export const MAX_ALPHA = 0.8;
export const parametersState = atom<EffectParams>({
  key: "parametersState",
  default: {
    radius: MIN_RADIUS,
    hardness: MAX_HARDNESS / 2,
    alpha: MIN_ALPHA * 2,
  },
});

export const radius = selector({
  key: "parametersState.radius",
  get: ({ get }) => get(parametersState).radius,
});
export const hardness = selector({
  key: "parametersState.hardness",
  get: ({ get }) => get(parametersState).hardness,
});
export const alpha = selector({
  key: "parametersState.alpha",
  get: ({ get }) => get(parametersState).alpha,
});
export const wait = selector({
  key: "parametersState.wait",
  get: ({ get }) => get(parametersState).wait ?? 0,
});
