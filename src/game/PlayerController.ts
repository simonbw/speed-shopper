import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { KeyCode } from "../core/io/Keys";
import { clamp } from "../core/util/MathUtil";
import { Cart } from "./Cart";
import { Human } from "./Human";

export class PlayerController extends BaseEntity implements Entity {
  human: Human;
  cart: Cart;

  constructor(human: Human, cart: Cart) {
    super();
    this.human = human;
    this.cart = cart;
  }

  onKeyDown({ key }: { key: KeyCode }) {
    if (key === "Space") {
      if (this.human.cart === undefined) {
        this.human.grabCart(this.cart);
      } else {
        this.human.releaseCart();
      }
    }
  }

  onTick() {
    const io = this.game!.io;

    const cart = this.human.cart;
    if (cart) {
      const [rotational, axial] = io.getMovementVector();

      if (io.isKeyDown("ShiftLeft") || io.isKeyDown("ShiftRight")) {
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
          this.human.body.angle = direction.angle;
        }
      } else {
        const mousePosition = this.game!.camera.toWorld(io.mousePosition);
        const mouseDirection = mousePosition.sub(
          this.human.getPosition()
        ).angle;
        this.human.body.angle = mouseDirection;
      }
    }
  }
}
