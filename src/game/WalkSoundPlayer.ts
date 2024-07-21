import { SoundName } from "../../resources/resources";
import BaseEntity from "../core/entity/BaseEntity";
import { PositionalSound } from "../core/sound/PositionalSound";
import { choose, rUniform } from "../core/util/Random";
import { Human } from "./Human";

const walkSounds: SoundName[] = [
  "footstepSoft1",
  "footstepSoft2",
  "footstepSoft3",
];

const runSounds: SoundName[] = ["footstepLoud1", "footstepLoud2"];

// Copied from ld-55
// TODO: Comment and review this file

export class WalkSoundPlayer extends BaseEntity {
  constructor(public human: Human) {
    super();
  }

  playFootstep() {
    const soundName = choose(...runSounds);
    this.addChild(
      new PositionalSound(soundName, this.human.getPosition(), {
        speed: rUniform(0.9, 1.1),
        gain: 0.4,
      })
    );
  }
}
