import { SoundName } from "../../resources/resources";
import BaseEntity from "../core/entity/BaseEntity";
import { PositionalSound } from "../core/sound/PositionalSound";
import { choose, rUniform } from "../core/util/Random";
import { Human } from "./Human";

// Copied from ld-55
// TODO: Comment and review this file

export class WalkSoundPlayer extends BaseEntity {
  stepProgress: number = 0.5;

  constructor(public human: Human) {
    super();
  }

  playFootstep() {
    const soundName = this.human.running
      ? choose(...runSounds)
      : choose(...walkSounds);
    this.addChild(
      new PositionalSound(soundName, this.human.getPosition(), {
        speed: rUniform(0.9, 1.1),
      })
    );
  }

  stop() {
    this.stepProgress = 0.5;
  }
}
export const walkSounds: SoundName[] = [
  "footstepSoft1",
  "footstepSoft2",
  "footstepSoft3",
];
export const runSounds: SoundName[] = ["footstepLoud1", "footstepLoud2"];
