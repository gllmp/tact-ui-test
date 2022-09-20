import { sleep } from "./time";

export type Tuple<T1 = number, T2 = number> = [T1, T2];

export const lerp = (a: number, b: number, t = 0.5): number => a + (b - a) * t;
export const hypo = (a: number, b = a): number => Math.sqrt(a ** 2 + b ** 2);
export const random = (max = 100): number => Math.round(Math.random() * max);
export const divide =
  (denominator: number) =>
  (numerator: number): number =>
    denominator === 0 ? 0 : numerator / denominator;
export const randGate = (limit: number): boolean => random() > limit;
export const randSigned = (max = 100): number => Math.round((Math.random() - 0.5) * max);

type RangeResult = {
  begin: number;
  end: number;
  result: string;
};
export const getRange = (el: HTMLInputElement): RangeResult => {
  el.focus();
  const { selectionStart, selectionEnd, value } = el;
  return {
    begin: selectionStart as number,
    end: selectionEnd as number,
    result: value.substring(selectionStart as number, selectionEnd as number),
  };
};

export const isValidIPItemValue = (ip: string | number): boolean => {
  const val = parseInt(ip as string);
  return !isNaN(val) && val >= 0 && val <= 255;
};
export class RangeNumber extends Number {
  private min = 0;
  private max = 1;
  private _value: number;
  private _origin: number;
  constructor(value: number, opts?: { min?: number; max?: number }) {
    super(value);
    const { min = 0, max = 1 } = opts ?? {};
    this.min = min;
    this.max = max;
    this._value = value ?? min;
    this._origin = this._value;
  }

  set value(v: number) {
    const vmax = Math.min(v, this.max);
    this._value = Math.max(vmax, this.min);
  }

  get value(): number {
    const vmax = Math.min(this._value, this.max);
    return Math.max(vmax, this.min);
  }

  valueOf(): number {
    return this.value;
  }

  scale(factor: number): this {
    return this.multiply(Math.max(0.1, factor));
  }
  grow(factor: number): this {
    return factor >= 1 ? this.multiply(factor) : this;
  }
  shrink(factor: number): this {
    return factor > 1 ? this.divide(factor) : this;
  }

  reset(): void {
    const rec = async (): Promise<void> => {
      if (this.value > this._origin) {
        this.value -= 0.01;
      } else if (this.value < this._origin) {
        this.value = this._origin;
      }
      if (this.value !== this._origin) {
        await sleep(1);
        rec();
      }
    };
    rec();
  }

  private multiply(factor: number): this {
    this.value *= factor;
    return this;
  }
  private divide(factor: number): this {
    if (factor === 0) return this;
    this.value /= factor;
    return this;
  }
}
