import { LinearSpring } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V } from "../core/Vector";
import { Cart } from "./Cart";
import { Human } from "./Human";

export class CartSpring extends BaseEntity implements Entity {
  constructor(
    private human: Human,
    private cart: Cart
  ) {
    super();

    const armLength = 0.32;
    const damping = 5;
    const stiffness = 100;

    const [leftHandPosition, rightHandPosition] = cart.getLocalHandPositions();
    const leftSpring = new LinearSpring(this.human.body, this.cart.body, {
      localAnchorA: V(0, -0.3),
      localAnchorB: leftHandPosition,
      restLength: armLength,
      damping,
      stiffness,
    });
    const rightSpring = new LinearSpring(this.human.body, this.cart.body, {
      localAnchorA: V(0, 0.3),
      localAnchorB: rightHandPosition,
      restLength: armLength,
      damping,
      stiffness,
    });

    this.springs = [leftSpring, rightSpring];
  }
}
