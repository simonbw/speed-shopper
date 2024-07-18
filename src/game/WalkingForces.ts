import { Body } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V, V2d } from "../core/Vector";
import { clamp, lerpV2d } from "../core/util/MathUtil";
import { Graphics } from "pixi.js";
import { KeyCode } from "../core/io/Keys";

export class WalkingForces extends BaseEntity implements Entity {
  // The position we're walking to, otherwise
  targetPosition: V2d | undefined;
  targetVelocity: V2d = V(0, 0);
  enabled: boolean = true;

  constructor(
    public humanBody: Body,
    public maxSpeed: number = 4, // meters / sec
    public maxAcceleration: number = 10, // meters / sec^2
    public damping: number = 1.0 // ?
  ) {
    super();

    this.sprite = new Graphics().circle(0, 0, 0.03).fill(0xff0000);
    this.sprite.visible = false;
  }

  /** Walk towards a specific point, and try to arrive at a specific velocity */
  walkToPoint(
    targetPosition: [number, number],
    targetVelocity: [number, number] = [0, 0]
  ) {
    if (!this.targetPosition) {
      this.targetPosition = V(targetPosition);
    } else {
      this.targetPosition.set(...targetPosition);
    }
    this.targetVelocity.set(...targetVelocity);
  }

  /** Walk in a specific direction */
  walkInDirection(direction: [number, number], speed: number = 1) {
    this.targetPosition = undefined;
    this.targetVelocity
      .set(...direction)
      .inormalize()
      .imul(this.maxSpeed)
      .imul(speed);
  }

  onTick() {
    if (this.enabled) {
      const stiffness = 1000;
      if (this.targetPosition) {
        const displacement = this.targetPosition.sub(this.humanBody.position);

        // Walk towards a specific point
        const displacementAccel = displacement.mul(stiffness);

        // Try to match the target velocity
        const speedMatchAccel = this.targetVelocity
          .sub(this.humanBody.velocity)
          .inormalize(this.maxAcceleration);

        // Combine the two forces
        const t = clamp(displacement.magnitude * 5, 0.1, 1.0);
        // const force = lerpV2d(speedMatchAccel, displacementAccel, t)
        const force = displacementAccel
          .add(speedMatchAccel)
          .ilimit(this.maxAcceleration)
          .imul(this.humanBody.mass);

        this.humanBody.applyForce(force);
      } else {
        // If we're not walking to a specific poin t, just try to match the target velocity
        const force = this.targetVelocity
          .sub(this.humanBody.velocity)
          .inormalize(this.maxAcceleration)
          .imul(this.humanBody.mass);
        this.humanBody.applyForce(force);
      }
    }
  }

  onKeyDown({ key }: { key: KeyCode }) {
    if (key === "Digit0") {
      this.sprite!.visible = !this.sprite!.visible;
    }
  }

  onRender() {
    if (this.targetPosition) {
      this.sprite!.alpha = 0.7;
      this.sprite?.position.set(...this.targetPosition);
    } else {
      this.sprite!.alpha = 0.0;
    }
  }
}
