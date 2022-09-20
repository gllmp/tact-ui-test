import { atom, selectorFamily } from "recoil";

export const recorderState = atom<Record<number, boolean>>({
  key: "recorderState",
  default: {},
});

export const isReady = selectorFamily({
  key: "recorder.isReady",
  get:
    (id: number) =>
    ({ get }) =>
      !!get(recorderState)[id],
});
