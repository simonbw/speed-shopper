type ArrayLen2 = [number, number];

/** Simple function to always return a new V2d */
export function V(a: Readonly<ArrayLen2>): V2d;
export function V(x: number, y: number): V2d;

export interface V2d extends ArrayLen2 {
  constructor(x: number, y: number): void;

  x: number;

  y: number;

  /**
   * The magnitude (length) of this vector.
   * Changing it does not change the angle.
   */
  magnitude: number;

  /**
   * The angle in radians ccw from east of this vector.
   * Changing it does not change the magnitude.
   */
  angle: number;

  /** Return the result of adding this vector to another. */
  add(other: Readonly<ArrayLen2>): V2d;

  /** (In Place) Return the result of adding this vector to another. */
  iadd(other: Readonly<ArrayLen2>): this;

  /** Return the result of multiplying a scalar by another vector and adding it to this. */
  addScaled(other: Readonly<ArrayLen2>, scale: number): this;

  /** (In Place) Return the result of multiplying a scalar by another vector and adding it to this. */
  iaddScaled(other: Readonly<ArrayLen2>, scale: number): this;

  /** Return the result of subtracting a vector from this one. */
  sub(other: Readonly<ArrayLen2>): V2d;

  /** (In Place) Return the result of subtracting a vector from this one. */
  isub(other: Readonly<ArrayLen2>): this;

  /** Return the result of multiplying this vector by a scalar. */
  mul(scalar: number): V2d;

  /** (In Place) Return the result of multiplying this vector by a scalar. */
  imul(scalar: number): this;

  /** Return the result of multiplying this vector by another vector componentwise. */
  mulComponent(other: Readonly<ArrayLen2>): V2d;

  /** (In Place) Return the result of multiplying this vector by another vector componentwise. */
  imulComponent(other: Readonly<ArrayLen2>): V2d;

  /** Returns the result of rotating this vector 90 decgrees clockwise */
  rotate90cw(): V2d;

  /** (In Place) Returns the result of rotating this vector 90 decgrees clockwise */
  irotate90cw(): this;

  /** Returns the result of rotating this vector 90 decgrees counter-clockwise */
  rotate90ccw(): V2d;

  /** (In Place) Returns the result of rotating this vector 90 decgrees counter-clockwise */
  irotate90ccw(): this;

  /** Return the result of rotating this angle by `angle` radians ccw. */
  rotate(angle: number): V2d;

  /** (In Place) Return the result of rotating this angle by `angle` radians ccw. */
  irotate(angle: number): this;

  /** Return the dot product of this and another vector */
  dot(other: Readonly<ArrayLen2>): number;

  /** Set the components of this vector */
  set(other: Readonly<ArrayLen2>): this;
  set(x: number, y: number): this;

  /** Return a normalized version of this vector */
  normalize(length?: number): V2d;

  /** (In Place) Return a normalized version of this vector */
  inormalize(length?: number): this;

  /** Return a new vector with the same values as this one */
  clone(): V2d;

  /** Return a vector that is between this and other */
  lerp(other: Readonly<ArrayLen2>, t: number): V2d;

  /** (In place) Return a vector that is between this and other */
  ilerp(other: Readonly<ArrayLen2>, t: number): this;

  equals(other?: Readonly<ArrayLen2>): boolean;
}
