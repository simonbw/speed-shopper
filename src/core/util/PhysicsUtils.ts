import { Line } from "p2";
import { V2d } from "../Vector";

export function lineFromPoints(p1: V2d, p2: V2d): Line {
  const vector = p2.sub(p1);
  const midpoint = p1.add(p2).imul(0.5);

  return new Line({
    position: midpoint,
    angle: vector.angle,
    length: vector.magnitude,
  });
}
