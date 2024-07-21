import { Body } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import { lerpV2d, polarToVec, stepToward } from "../core/util/MathUtil";
import { V, V2d } from "../core/Vector";
import { Human } from "./Human";
import { isMerchandise, Merchandise } from "./Merchandise";

const PICKUP_RANGE = 0.2;
export const ARM_LENGTH = 0.6;

export class HumanArm extends BaseEntity {
  extensionTarget: number = 0;
  private _extension: number = 0;

  merchandise: Merchandise | undefined;

  public readonly shoulderPosition: V2d;
  public readonly side: "left" | "right";

  get extension() {
    return this._extension;
  }

  constructor(
    private human: Human,
    shoulderPosition: V2d,
    side: "left" | "right",
    private extendSpeed: number = 10
  ) {
    super();

    this.shoulderPosition = shoulderPosition;
    this.side = side;

    this.body = new Body({
      mass: 0,
      position: shoulderPosition.clone(),
      type: Body.KINEMATIC,
      collisionResponse: false,
    });
  }

  onTick(dt: number) {
    const game = this.game!;
    this._extension = stepToward(
      this._extension,
      this.extensionTarget,
      dt * this.extendSpeed
    );

    // Find nearby merchandise
    const armPosition = this.getHandWorldPosition();
    if (this.merchandise) {
      this.merchandise.body.position = this.getHandWorldPosition();

      if (this._extension === 0) {
        // Keep merchandise momentumd
        this.human.body.getVelocityAtPoint(
          this.merchandise.body.velocity,
          this.merchandise.getPosition().isub(this.human.getPosition())
        );
        this.merchandise.drop();
        this.merchandise = undefined;
      }
    } else {
      if (this._extension > 0) {
        const merchandises = game.entities.getByFilter(isMerchandise);
        for (const merchandise of merchandises) {
          if (
            merchandise.state === "dropped" &&
            armPosition.sub(merchandise.body.position).magnitude < PICKUP_RANGE
          ) {
            merchandise.pickup(this);
            this.merchandise = merchandise;
          }
        }
      }
    }
  }

  getHandLocalPosition(): V2d {
    const shoulder = this.shoulderPosition;
    const extendDirection = this.side === "left" ? -1 : 1;
    const extended = shoulder.add(
      polarToVec(extendDirection * Math.PI * 0.45, ARM_LENGTH * 0.8)
    );

    if (this.human.cart) {
      const cart = this.human.cart;

      const cartWorld =
        cart.getWorldHandPositions()[this.side === "left" ? 0 : 1];
      const cartLocal = this.human.worldToLocal(cartWorld);

      const cartLimited = cartLocal
        .sub(shoulder)
        .ilimit(ARM_LENGTH)
        .iadd(shoulder);

      return lerpV2d(cartLimited, extended, this.extension);
    } else {
      return lerpV2d(shoulder, extended, this.extension);
    }
  }

  getHandWorldPosition(): V2d {
    return this.human.localToWorld(this.getHandLocalPosition());
  }
}
