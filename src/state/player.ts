import { atom, selector } from "recoil";

export const playerState = atom<"playing" | "recording" | "stopped">({
  key: "playerState",
  default: "stopped",
});

export const isNotStopped = selector({
  key: "player.isNotStopped",
  get: ({ get }) => get(playerState) !== "stopped",
});
export const isRecording = selector({
  key: "player.isRecording",
  get: ({ get }) => get(playerState) === "recording",
});
export const isPlaying = selector({
  key: "player.isPlaying",
  get: ({ get }) => {
    const state = get(playerState);
    return state === "playing" || state === "recording";
  },
});
