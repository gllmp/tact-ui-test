import { unveil } from "../effects";
import { Coordinates } from "../effects/typings";
import { hypo, lerp } from "./number";
import { getAmplifier } from "./zones";

export class CanvasGrid extends Map {
  private unit: number;
  private canvas: HTMLCanvasElement;
  private copy: CanvasImageSource;
  private isUnveiled = false;
  x = 0;
  y = 0;

  constructor(canvas: HTMLCanvasElement, unit = 10) {
    super();
    this.canvas = canvas;
    this.copy = this.copyImage(canvas);
    this.unit = unit;
  }

  get context(): CanvasRenderingContext2D {
    return this.canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  get width(): number {
    return this.canvas.width ?? innerWidth;
  }
  get height(): number {
    return this.canvas.height ?? innerHeight;
  }
  get image(): HTMLCanvasElement {
    return this.canvas;
  }
  get original(): CanvasImageSource {
    return this.copy;
  }

  copyImage(cnv: HTMLCanvasElement): HTMLCanvasElement {
    const original = document.createElement("canvas");
    original.width = cnv.width;
    original.height = cnv.height;
    original.getContext("2d")?.drawImage(cnv, 0, 0);
    return original;
  }

  blur(x = 10): CanvasImageSource {
    const ctx = this.context;
    ctx.save();
    ctx.filter = `blur(${x.toFixed(1)}px)`;
    ctx.drawImage(this.original, 0, 0);
    ctx.restore();
    const blurred = new OffscreenCanvas(ctx.canvas.width, ctx.canvas.height);
    blurred.getContext("2d")?.drawImage(ctx.canvas, 0, 0);
    return blurred.transferToImageBitmap();
  }

  draw(image: CanvasImageSource, dx: number, dy: number): void {
    if (image.width <= 0 || image.height <= 0) return;
    this.context.drawImage(image, dx, dy);
  }

  get(touch: Coordinates): number {
    const key = this.getKey(touch);
    return super.get(key) ?? 0;
  }
  set(item: Coordinates | Coordinates[]): this {
    const touches = Array.isArray(item) ? item : [item];
    for (const touch of touches) {
      const key = this.getKey(touch);
      const value = this.get(touch);
      if (value >= 0) super.set(key, value + 1);
    }
    return this;
  }
  has(touch: Coordinates, limit = 0): boolean {
    if (this.isUnveiled) return true;
    const amplifier = getAmplifier(touch);
    return this.get(touch) > limit * amplifier;
  }
  mark(touches: Coordinates[]): this {
    const shallow = new CanvasGrid(this.canvas);
    const radius = this.unit / 2;
    const params = { radius, mark: false, hardness: 0.1, alpha: 1 };
    touches.forEach((touch) => {
      super.set(this.getKey(touch), -Infinity);
      unveil(shallow)({ touch, params });
    });
    return this;
  }
  isMarked(touch: Coordinates): boolean {
    if (this.isUnveiled) return true;
    return this.get(touch) < 0;
  }

  unveilAll(): void {
    if (this.isUnveiled) return;
    const rec = (alpha: number): void => {
      if (alpha <= 0) return;
      this.context.save();
      this.context.fillStyle = `rgba(0, 0, 0, ${Math.max(1 - alpha, 0)})`;
      this.context.globalCompositeOperation = "destination-out";
      this.context.fillRect(0, 0, this.width, this.height);
      this.context.restore();
      setTimeout(() => requestAnimationFrame(rec.bind(this, alpha - 0.001)), 80);
    };
    this.isUnveiled = true;
    requestAnimationFrame(rec.bind(this, 1));
  }

  get percentage(): number {
    const marks = [...this.values()].reduce(
      (acc, value) => (typeof value === "number" && value < 0 ? acc + 1 : acc),
      0
    );
    return marks / this.total;
  }

  get total(): number {
    return Math.round((this.width / this.unit) * (this.height / this.unit));
  }

  private getKey({ x, y }: Coordinates): string {
    return `${Math.floor(x / 10)}_${Math.floor(y / 10)}`;
  }

  private createApproxSquare(
    { x, y }: Coordinates,
    image: CanvasImageSource | { width: number; height: number }
  ): Coordinates[] {
    const baseRadius = +image.width / 2;
    const maxRadius = hypo(baseRadius);
    const radius = lerp(baseRadius, maxRadius);
    const width = radius / Math.cos(Math.PI / 4);
    const [offsetX, offsetY] = [x, y].map((v) => lerp(v, v + width));
    const origin = this.createShallow({ x: offsetX, y: offsetY });

    return Array(Math.ceil(width / this.unit) ** 2)
      .fill(origin)
      .reduce(
        (acc, { x, y }) => {
          const { x: lastX, y: lastY } = acc[acc.length - 1];
          let nextX = lastX + this.unit;
          let nextY = lastY;
          if (nextX > x + width) {
            nextX = x;
            nextY += this.unit;
          }
          if (nextY > y + width) {
            nextY = y + width;
          }
          return acc.concat(this.createShallow({ x: nextX, y: nextY }));
        },
        [origin]
      );
  }

  private createShallow(
    item: Coordinates,
    bounds: {
      x: number;
      y: number;
      width: number;
      height: number;
    } = this
  ): Coordinates {
    let { x, y } = item;
    if (x > bounds.width) x = bounds.width;
    if (y > bounds.height) y = bounds.height;
    if (x < bounds.x) x = bounds.x;
    if (y < bounds.y) y = bounds.y;
    return { x, y };
  }
}
