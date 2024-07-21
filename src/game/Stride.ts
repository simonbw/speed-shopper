import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V } from "../core/Vector";
import { Human } from "./Human";

export class Stride extends BaseEntity implements Entity {
  human: Human;
  percentThroughStride: number = 0;
  lastDistanceMoved: number = 0;
  stepsPerMeter: number;

  constructor(human: Human, stepsPerMeter: number) {
    super();
    this.human = human;
    this.stepsPerMeter = stepsPerMeter;
  }

  onTick(dt: number) {
    const speed = V(this.human.body.velocity).magnitude;
    const distanceMoved = speed * dt;

    const stopThreshold = 0.0000001;
    if (distanceMoved > stopThreshold) {
      const lastPercentThroughStep = this.percentThroughStride;
      this.percentThroughStride += distanceMoved * this.stepsPerMeter;

      // If we've taken a new step
      if (
        (this.percentThroughStride > 1 && lastPercentThroughStep < 1) ||
        (this.percentThroughStride > 2 && lastPercentThroughStep < 2)
      ) {
        this.human.walkSoundPlayer.playFootstep();
      }

      // Wrap around the stride
      this.percentThroughStride %= 2;
    } else {
      // not moving
      this.percentThroughStride = 0;

      // If we've just stopped moving
      if (this.lastDistanceMoved > stopThreshold) {
        this.human.walkSoundPlayer.playFootstep();
      }
    }
  }
}
