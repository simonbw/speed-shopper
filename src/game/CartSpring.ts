import { DistanceConstraint } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Cart } from "./Cart";
import { Human } from "./Human";
import { ARM_LENGTH } from "./HumanArm";

const GRIP_STRENGTH = 100;

export class CartSpring extends BaseEntity implements Entity {
  readonly leftDistanceConstraint: DistanceConstraint;
  readonly rightDistanceConstraint: DistanceConstraint;

  constructor(
    private human: Human,
    private cart: Cart
  ) {
    super();

    const armLength = ARM_LENGTH;

    const leftShoulderPosition = this.human.leftArm.shoulderPosition;
    const rightShoulderPosition = this.human.rightArm.shoulderPosition;
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
    this.leftDistanceConstraint = leftDistanceConstraint;

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
    this.rightDistanceConstraint = rightDistanceConstraint;

    this.constraints = [leftDistanceConstraint, rightDistanceConstraint];
  }

  onTick() {
    if (this.human.leftArm.merchandise || this.human.leftArm.extension > 0) {
      this.leftDistanceConstraint.setMaxForce(0);
    } else {
      this.leftDistanceConstraint.setMaxForce(GRIP_STRENGTH);
    }

    if (this.human.rightArm.merchandise || this.human.rightArm.extension > 0) {
      this.rightDistanceConstraint.setMaxForce(0);
    } else {
      this.rightDistanceConstraint.setMaxForce(GRIP_STRENGTH);
    }
  }
}
