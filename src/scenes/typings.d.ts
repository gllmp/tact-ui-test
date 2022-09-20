import { TouchNode, ExtendedTouch } from "../utils/touch";

type Gestures = "onMove" | "onTap" | "onHold";
type AfterGestures = "afterMove" | "afterTap" | "afterHold";
export type Instruction = {
  params: { radius: number; hardness: number; alpha: number };
  touch: ExtendedTouch;
  brush?: CanvasRenderingContext2D;
};
type FXHandler = Record<
  Gestures,
  (
    node: TouchNode,
    params?: Instruction["params"],
    opts?: Record<string, number | string | boolean>
  ) => Instruction & { fx: string }
>;
type AfterFXHandler = Record<
  AfterGestures,
  (
    node: TouchNode,
    params?: Instruction["params"],
    opts?: Record<string, number | string | boolean>
  ) => AsyncGenerator<Instruction & { fx: string }>
>;

export type GestureHandlers = FXHandler & AfterFXHandler & { cleanup?: () => void };

// type Transition = number | string | ((canvas: HTMLCanvasElement, image: HTMLImageElement) => Promise<void>);
type Transition = number;
export type Scene = {
  name: string;
  title: string;
  composer?: string;
  designer?: string;
  photographer?: string;
  assistantComposer?: string;
  imageSrc: string;
  duration: number;
  transitionIn?: Transition;
  transitionOut?: Transition;
  next?: string;
};
