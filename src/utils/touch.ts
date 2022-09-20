import { getCoordForCanvas } from "./canvas";
import { hypo, random, randGate, randSigned, Tuple } from "./number";
import { sleep } from "./time";

type OrNull<T = TouchNode> = T | null | undefined;

export interface TouchItem {
  id: number;
  x: number; // x-axis coordinate (X goes right)
  y: number; // y-axis coordinate (Y goes down)
  t: number; // timeStamp (ms)
  h: boolean; // is touch being held down
}

interface TouchMove {
  moveX: number;
  moveY: number;
  move: number;
}
interface TouchVelocity extends TouchMove {
  d: number;
  vx: number;
  vy: number;
  v: Tuple;
  s: number;
}
export interface ExtendedTouch extends TouchItem, TouchVelocity {
  prevX?: number;
  prevY?: number;
  isTap?: boolean;
  isFast?: boolean;
}
const emptyTouch = {
  moveX: 0,
  moveY: 0,
  move: 0,
  vx: 0,
  vy: 0,
  d: 0,
  v: [0, 0],
  s: 1,
} as ExtendedTouch;

const ifItIsNotIn =
  (touchesToRemove: Touch[]) =>
  (touch: Touch): boolean => {
    return !touchesToRemove.some((toRemove) => toRemove.identifier === touch.identifier);
  };

export const getTouches = ({
  changedTouches,
  activeTouches,
}: {
  changedTouches: Touch[];
  activeTouches: Touch[];
}): Array<Touch> => {
  const inactiveTouches = changedTouches.filter(ifItIsNotIn(activeTouches));
  return (
    [...activeTouches, ...inactiveTouches]
      // HACK: sometimes the 1st touch identifier is not 0, this is bad for audio
      .sort((a, b) => a.identifier - b.identifier)
  );
};

export const getTouchesFromTouchEvent: (e: TouchEvent) => TouchItem[] = (e) => {
  const canvas = e.target as HTMLCanvasElement;
  if (!canvas || !canvas.width || !canvas.height) return [];
  const changedTouches = Array.from(e.changedTouches);
  const activeTouches = Array.from(e.targetTouches);
  const inactiveTouches = changedTouches.filter(ifItIsNotIn(activeTouches));
  return [...activeTouches, ...inactiveTouches].map((touch, i) => ({
    id: touch.identifier ?? i,
    t: e.timeStamp,
    h: ifItIsNotIn(changedTouches)(touch),
    ...getCoordForCanvas(touch, canvas),
  }));
};
export const getTouchesFromPointerEvent: (e: PointerEvent) => TouchItem[] = (e) => {
  const canvas = e.target as HTMLCanvasElement;
  if (!canvas || !canvas.width || !canvas.height || e.pointerType === "touch") return [];

  const isMoving = e.type === "pointermove";
  if (isMoving && e.pressure <= 0) return [];
  return [
    {
      id: 0,
      t: e.timeStamp,
      // h: isMoving && e.ctrlKey,
      h: false,
      ...getCoordForCanvas(e, canvas),
    },
  ];
};

export class TouchNode {
  static SPEED_THRESHOLD = 300;
  static TAP_THRESHOLD = 4;
  static AUTO_LIMIT = 3000;
  id: number;
  x: number;
  y: number;
  t: number;
  h: boolean;
  private _t: number;
  pos: number;
  prev: OrNull;
  next?: OrNull;
  constructor(touch: TouchItem, prev: OrNull = null) {
    this.id = touch.id;
    this.x = touch.x;
    this.y = touch.y;
    this.t = touch.t;
    this.h = touch.h;
    this._t = new Date().getTime();
    this.prev = prev;
    this.pos = (this.prev?.pos ?? 0) + 1;
    if (prev) prev.next = this;
  }

  getItem(): TouchItem {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      t: this.t,
      h: this.h,
    };
  }

  getTouch(): ExtendedTouch {
    const touch = this.isFirst ? { ...emptyTouch, ...this.getItem() } : this.compare(this, this.prev);
    if (this.isFirst && touch.move === 0 && this.next) {
      touch.moveX = this.next.x - touch.x;
      touch.moveY = this.next.y - touch.y;
    }
    return touch;
  }

  getGesture(): ExtendedTouch {
    return this.compare(this.getLast(), this.getFirst());
  }

  get size(): number {
    return this.getLast().pos;
  }

  get isFirst(): boolean {
    return this.prev === null;
  }
  get isLast(): boolean {
    return this.next === null || this.next === undefined;
  }
  get isTap(): boolean {
    if (this.isFirst) return false;
    const { moveX, moveY } = this.getMove(this.getFirst(), this.getLast());
    const isMoving = Math.abs(moveX * moveY) > TouchNode.TAP_THRESHOLD;
    const isFast = this.elapsed < TouchNode.SPEED_THRESHOLD;
    return !isMoving && isFast;
  }
  get isFast(): boolean {
    const {
      v: [speed],
    } = this.getVelocity(this.getFirst(), this.getLast());
    return speed > TouchNode.SPEED_THRESHOLD;
  }

  getFirst(): TouchNode {
    const rec = (touch: TouchNode): TouchNode => {
      if (touch.prev) return touch.prev.isFirst ? touch.prev : rec(touch.prev);
      return touch;
    };
    return rec(this);
  }
  getLast(): TouchNode {
    const rec = (touch: TouchNode): TouchNode => {
      if (touch.next) return touch.next.isLast ? touch.next : rec(touch.next);
      return touch;
    };
    return rec(this);
  }

  getAtPos(index: number): OrNull {
    const rec = (touch: TouchNode): TouchNode | null => {
      if (!touch) return null;
      if (touch.pos - 1 === index) return touch;
      if (touch.next) return rec(touch.next);
      return null;
    };
    const { pos } = this.getLast();
    return index >= pos ? null : rec(this.getFirst());
  }

  toArray(): TouchNode[] {
    const nodes = [];
    for (let node = this.getFirst(); !!node; node = node.next as TouchNode) nodes.push(node);
    return nodes;
  }

  filter(fn: (t: TouchNode) => boolean): OrNull {
    const rec = (cur: TouchNode, prev?: OrNull): OrNull =>
      cur.next ? rec(cur.next, fn(cur) ? new TouchNode(cur.getItem(), prev) : null) : prev;
    return rec(this.getFirst());
  }

  push(touch: TouchItem): TouchNode {
    return new TouchNode(touch, this);
  }

  concat(touches: TouchItem[]): TouchNode {
    return touches.reduce<TouchNode>((acc, t) => acc.push(t), this);
  }

  map(fn: (t: TouchNode) => TouchItem): TouchNode {
    const rec = (cur: TouchNode): TouchNode => (cur.next ? rec(cur.next.push.call(cur.next, fn(cur))) : cur);
    return rec(this.getFirst());
  }

  slice(start?: number, end?: number): OrNull {
    let startFn: (node: TouchNode) => boolean = () => true;
    let endFn: (node: TouchNode) => boolean = () => true;
    const { size } = this;
    if (typeof start === "number") {
      startFn = (t) => (start >= 0 ? t.pos >= start + 1 : t.pos >= size + start);
    }
    if (typeof end === "number") {
      if (end >= 0) endFn = (t) => t.pos <= end;
    }
    return this.filter((t) => startFn(t) && endFn(t));
  }

  find(fn: (t: TouchNode) => boolean): OrNull {
    const last = this.getLast();
    const rec = (cur: TouchNode): OrNull => {
      if (fn(cur)) return new TouchNode(cur);
      return cur.prev ? rec(cur.prev) : null;
    };
    return rec(last);
  }

  pop(): OrNull {
    const prev = this.prev;
    if (!prev) return null;
    prev.next = null;
    return new TouchNode(prev, prev.prev);
  }

  replay(op: string): TouchNode {
    if (!op) return this;
    let updatedNode = this.size >= 3 ? this.slice(Math.floor(this.size * 0.65)) : this;
    if (!updatedNode) return this;
    switch (op) {
      case "flip-x":
      case "flip-y":
        const [, mode] = op.split("-");
        updatedNode = updatedNode.getFirst().flip(mode);
        break;
      case "flip":
        updatedNode = updatedNode.getFirst().flip("xy");
        break;
      case "translate":
        const { moveX, moveY } = updatedNode.getGesture();
        updatedNode = updatedNode.getFirst().translate(moveX, moveY);
        break;
      case "rotate":
        const rotation = Math.PI / 4;
        updatedNode = updatedNode.getFirst().rotate(rotation);
        break;
      case "rain":
        // @FIXME find a way to provide the maximum height of the rain drops
        updatedNode = updatedNode.getFirst().rain(1600);
        break;
      case "unveil":
        updatedNode = updatedNode.getLast().slice(-1) as TouchNode;
        break;
    }

    return updatedNode;
  }

  translate(offsetX: number, offsetY: number): TouchNode {
    this.x += Math.round(offsetX);
    this.y += Math.round(offsetY);
    return this.next ? this.next.translate.call(this.next, offsetX, offsetY) : this;
  }

  flip(mode = "y", { prevX, prevY }: { prevX?: number; prevY?: number } = this.getGesture()): TouchNode {
    const { x, y } = this;
    if (mode.includes("x") && typeof prevX === "number") {
      this.x += Math.round((prevX - x) * 2);
    }
    if (mode.includes("y") && typeof prevY === "number") {
      this.y += Math.round((prevY - y) * 2);
    }
    return this.next ? this.next.flip.call(this.next, mode, { prevX, prevY }) : this;
  }

  rotate(rad: number): TouchNode {
    const { moveX, moveY, move } = this.getMove(this, this.next as TouchNode);
    this.x += Math.round(Math.cos(rad / 2) * move) - moveX;
    this.y += Math.round(Math.sin(rad / 2) * move) - moveY;
    return this.next ? this.next.rotate.call(this.next, rad) : this;
  }

  fallErratically(maxNumberOfNodes: number): TouchNode {
    const first = this.getFirst();
    const limitNodes = random(maxNumberOfNodes);
    const rec = (current: TouchNode, count = 1): TouchNode => {
      const newTouch = {
        ...current.getItem(),
        t: current.t + random(300),
        x: current.x + randSigned(10),
        y: current.y + random(30),
      };
      const newNode = new TouchNode(newTouch, current);
      return count <= limitNodes ? rec(newNode, count + 1) : newNode;
    };
    return rec(first);
  }

  rain(limitY: number, randomize = true): TouchNode {
    const first = this.getFirst();
    const { x: firstX } = first;
    const rec = (current: TouchNode, count = 1): TouchNode => {
      const newTouch = {
        ...current.getItem(),
        t: current.t + (randomize ? random(300) : 150),
        x: firstX,
        y: current.y + (randomize ? random(5) : 0) + count,
      };
      const newNode = new TouchNode(newTouch, current);
      return newTouch.y <= limitY ? rec(newNode, count + 1) : newNode;
    };
    return rec(first);
  }

  spread(limit: number): TouchNode {
    const first = this.getFirst();
    const rec = (current: TouchNode, count = 1): TouchNode => {
      const newTouch = {
        ...current.getItem(),
        t: current.t + random(300),
        x: current.x + (randGate(70) ? randSigned(40) : 0),
        y: current.y + randSigned(50) * count,
      };
      const newNode = new TouchNode(newTouch, current);
      return count <= limit ? rec(newNode, count + 1) : newNode;
    };
    return rec(first);
  }

  speed(factor: number | ((t: TouchNode) => number)): AsyncGenerator<TouchNode, TouchNode> {
    async function* rec(node: TouchNode): AsyncGenerator<TouchNode> {
      if (node.prev) {
        const speed = typeof factor === "function" ? factor(node) : factor;
        if (!node.isLast) await sleep(Math.max(node.elapsed / speed, 0));
        yield* rec(node.prev as TouchNode);
      }
      yield node;
    }
    return rec(this.getLast());
  }

  get movement(): TouchMove {
    return this.getMove(this, this.prev);
  }
  get velocity(): TouchVelocity {
    return this.getVelocity(this, this.prev);
  }
  get elapsed(): number {
    if (this.prev) return this.getElapsed(this.prev, this);
    if (this.next) return this.getElapsed(this, this.next);
    if (this.size === 1) return new Date().getTime() - this._t;
    return 0;
  }
  get scale(): number {
    if (!this.prev?.h) return 1;
    return Math.min(3, this.prev.scale + +this.h * 0.5);
  }

  private compare(touch1: OrNull, touch2?: OrNull): ExtendedTouch {
    const last = touch1 ?? this.next ?? this;
    const first = touch2 ?? this.prev ?? this.getFirst();
    const { x: prevX = 0, y: prevY = 0 } = first as TouchNode;
    const movement = this.getVelocity(first, last);
    const gap = Math.abs(last.pos - first.pos);
    const isFast = movement.v[0] > TouchNode.SPEED_THRESHOLD / Math.max(1, gap);
    return {
      prevX,
      prevY,
      isFast,
      isTap: last.isTap,
      ...movement,
      ...last.getItem(),
    };
  }

  private getMove(from?: OrNull, to?: OrNull): TouchMove {
    if (!to || !from) return { moveX: 0, moveY: 0, move: 0 };
    const moveX = to.x - from.x;
    const moveY = to.y - from.y;
    const move = hypo(moveX, moveY);
    return { moveX, moveY, move };
  }

  private getElapsed(from?: OrNull, to?: OrNull): number {
    return to && from ? Math.abs(to.t - from.t) : 0;
  }

  private getVelocity(from?: OrNull, to?: OrNull): TouchVelocity {
    if (!to || !from) return emptyTouch;
    const d = this.getElapsed(from, to);
    const s = to.scale;
    const { moveX, moveY, move } = this.getMove(from, to);
    const [vx, vy] = d > 0 ? [moveX, moveY].map((m) => (Math.abs(m) / d) * 1000) : [0, 0];
    let angle = move > 0 ? Math.atan(Math.abs(moveY) / Math.abs(moveX)) : 0;
    if (moveY < 0) angle += Math.PI;
    if (moveX < 0) angle += Math.PI / 2;
    const v = (Math.abs(move * d) > 0 ? [(move / d) * 1000, angle] : [0, 0]) as Tuple;

    return { d, move, moveX, moveY, vx, vy, v, s };
  }
}
