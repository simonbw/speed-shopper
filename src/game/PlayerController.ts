import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { KeyCode } from "../core/io/Keys";
import { clamp } from "../core/util/MathUtil";
import { isCart } from "./Cart";
import { getClosest } from "./getClosest";
import { Human } from "./Human";

export class PlayerController extends BaseEntity implements Entity {
  human: Human;

  constructor(human: Human) {
    super();
    this.human = human;
  }

  onKeyDown({ key }: { key: KeyCode }) {
    if (key === "Space") {
      if (this.human.cart === undefined) {
        const carts = this.game!.entities.getByFilter(isCart);
        const cart = getClosest(this.human.getPosition(), carts, 1);

        if (cart) {
          this.human.grabCart(cart);
        }
      } else {
        this.human.releaseCart();
      }
    }
  }

  onTick() {
    const io = this.game!.io;
    const shiftIsDown = io.isKeyDown("ShiftLeft") || io.isKeyDown("ShiftRight");

    const cart = this.human.cart;
    if (cart) {
      const [rotational, axial] = io.getMovementVector();

      if (shiftIsDown) {
        cart.skid();
      }

      cart.push(rotational, axial);

      const pushingPosition = cart.localToWorld([0, 0.5 + 0.3 + 0.15 * axial]);
      const pushOffset = pushingPosition.sub(this.human.getPosition());
      const correctionAmount = clamp(3 * pushOffset.magnitude);
      this.human.walkSpring.walkTowards(pushOffset.angle, correctionAmount);

      this.human.aimAt(cart.getPosition());
    } else {
      // Walking
      const walkDirection = io.getMovementVector();
      if (walkDirection.magnitude > 1) {
        walkDirection.magnitude = 1;
      }
      this.human.walkSpring.walkTowards(
        walkDirection.angle,
        walkDirection.magnitude
      );

      // Aiming
      if (io.usingGamepad) {
        const direction = io.getStick("right");
        // account for dead zone
        if (direction.magnitude > 0.01) {
          this.human.aim(direction.angle);
        }
      } else {
        if (walkDirection.magnitude > 0.1) {
          this.human.aim(walkDirection.angle);
        }
      }
    }
  }
}
