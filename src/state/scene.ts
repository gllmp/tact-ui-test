import { atom, selectorFamily } from "recoil";
import { Scene } from "../scenes/typings";

export const sceneState = atom<Scene>({
  key: "sceneState",
  default: { name: "" } as Scene,
});

export const hasNext = selectorFamily<boolean, string>({
  key: "scene.hasNext",
  get:
    (creation) =>
    ({ get }) => {
      const current = get(sceneState);
      if (current.name === "credits") return false;
      if ((current.name ?? "").indexOf(creation) === 0) {
        return !!current.next;
      }
      return false;
    },
});
