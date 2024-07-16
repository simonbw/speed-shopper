import { V2d } from "../core/Vector";
import { Cart } from "./Cart";

export function getClosest(
  origin: V2d,
  carts: Iterable<Cart>,
  threshold: number = Infinity
): Cart | undefined {
  let closest: Cart | undefined;
  let closestDistance = threshold;
  for (const cart of carts) {
    const distance = cart.getPosition().isub(origin).magnitude;
    if (distance < closestDistance) {
      closest = cart;
      closestDistance = distance;
    }
  }
  return closest;
}
