import { DistanceConstraint } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Cart } from "./Cart";
import { Human, MAX_ARM_LENGTH } from "./Human";

const GRIP_STRENGTH = 100;

export class CartSpring extends BaseEntity implements Entity {
  constructor(
    private human: Human,
    private cart: Cart
  ) {
    super();

    const armLength = MAX_ARM_LENGTH;

    const [leftShoulderPosition, rightShoulderPosition] =
      this.human.humanSprite.getShoulderPositions();
    const [leftHandPosition, rightHandPosition] = cart.getLocalHandPositions();

    const leftDistanceConstraint = new DistanceConstraint(
      this.human.body,
      this.cart.body,
      {
        distance: armLength,
        localAnchorA: leftShoulderPosition,
        localAnchorB: leftHandPosition,
        maxForce: GRIP_STRENGTH,
      }
    );
    leftDistanceConstraint.lowerLimitEnabled = false;
    leftDistanceConstraint.upperLimitEnabled = true;
    leftDistanceConstraint.upperLimit = armLength;
    const rightDistanceConstraint = new DistanceConstraint(
      this.human.body,
      this.cart.body,
      {
        distance: armLength,
        localAnchorA: rightShoulderPosition,
        localAnchorB: rightHandPosition,
        maxForce: GRIP_STRENGTH,
      }
    );
    rightDistanceConstraint.lowerLimitEnabled = false;
    rightDistanceConstraint.upperLimitEnabled = true;
    rightDistanceConstraint.upperLimit = armLength;

    this.constraints = [leftDistanceConstraint, rightDistanceConstraint];

    // this.springs = [leftSpring, rightSpring];
  }
}
