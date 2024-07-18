import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { V, V2d } from "../core/Vector";
import { polarToVec } from "../core/util/MathUtil";
import { ImageName } from "../../resources/resources";
import { Human, MAX_ARM_LENGTH } from "./Human";

export interface HumanTextures {
  head: ImageName;
  torso: ImageName;
  leftHand: ImageName;
  rightHand: ImageName;
  leftArm: ImageName;
  rightArm: ImageName;
}

// A body with arms that faces a direction
export class HumanSprite extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  torsoSprite: Sprite;
  headSprite: Sprite;
  leftArmSprite: Sprite;
  armThickness: number;
  rightArmSprite: Sprite;
  leftHandSprite: Sprite;
  rightHandSprite: Sprite;

  constructor(
    public readonly human: Human,
    textures: HumanTextures,
    private radius: number
  ) {
    super();

    this.sprite = new Sprite();
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.layerName = "player";

    this.torsoSprite = loadGameSprite(textures.torso);
    this.torsoSprite.anchor.set(0.5);
    const baseScale = (this.radius * 2) / this.torsoSprite.height;
    this.torsoSprite.scale.set(baseScale);

    this.headSprite = loadGameSprite(textures.head);
    this.headSprite.anchor.set(0.5);
    this.headSprite.scale.copyFrom(this.torsoSprite.scale); // because we know we're exporting them at the same resolution

    this.leftArmSprite = loadGameSprite(textures.leftArm);
    this.armThickness = baseScale * this.leftArmSprite.height; // To use for shoulder positioning
    this.leftArmSprite.anchor.set(0.5, 0.5);
    this.leftArmSprite.height = this.armThickness;

    this.rightArmSprite = loadGameSprite(textures.rightArm);
    this.rightArmSprite.anchor.set(0.5, 0.5);
    this.rightArmSprite.height = this.armThickness;

    this.leftHandSprite = loadGameSprite(textures.leftHand);
    this.leftHandSprite.anchor.set(0.5, 0.5);
    this.leftHandSprite.width = this.armThickness;
    this.leftHandSprite.height = this.armThickness;

    this.rightHandSprite = loadGameSprite(textures.rightHand);
    this.rightHandSprite.anchor.set(0.5, 0.5);
    this.rightHandSprite.width = this.armThickness;
    this.rightHandSprite.height = this.armThickness;

    this.sprite.addChild(this.leftArmSprite);
    this.sprite.addChild(this.rightArmSprite);
    this.sprite.addChild(this.leftHandSprite);
    this.sprite.addChild(this.rightHandSprite);
    this.sprite.addChild(this.torsoSprite);
    this.sprite.addChild(this.headSprite);
  }

  onRender(dt: number) {
    [this.sprite.x, this.sprite.y] = this.getPosition();
    this.sprite.rotation = this.getAngle();

    this.torsoSprite.rotation = this.getStanceAngle();

    const stanceOffset = this.getStanceOffset();
    this.torsoSprite.position.set(...stanceOffset);
    this.headSprite.position.set(...stanceOffset);

    const [leftShoulderPos, rightShoulderPos] = this.getShoulderPositions();
    const [leftHandPos, rightHandPos] = this.getHandPositions();

    const leftArmPos = leftShoulderPos.lerp(leftHandPos, 0.5);
    const rightArmPos = rightShoulderPos.lerp(rightHandPos, 0.5);

    this.leftArmSprite.position.set(...leftArmPos);
    this.rightArmSprite.position.set(...rightArmPos);

    const leftArmSpan = leftHandPos.sub(leftShoulderPos);
    const rightArmSpan = rightHandPos.sub(rightShoulderPos);

    this.leftArmSprite.width = leftArmSpan.magnitude;
    this.rightArmSprite.width = rightArmSpan.magnitude;
    this.leftArmSprite.rotation = leftArmSpan.angle;
    this.rightArmSprite.rotation = rightArmSpan.angle;

    this.leftHandSprite.position.set(...leftHandPos);
    this.rightHandSprite.position.set(...rightHandPos);
  }

  // Override me!
  getPosition() {
    return this.human.getPosition();
  }

  // Override me!
  getAngle() {
    return this.human.body.angle;
  }

  // Override me!
  getStanceAngle(): number {
    return 0;
  }

  // Override me!
  getStanceOffset() {
    return V(0, 0);
  }

  getShoulderPositions(): [V2d, V2d] {
    const stanceAngle = this.getStanceAngle();
    const offset = this.getStanceOffset();
    const r = this.radius - this.armThickness / 2;
    return [
      polarToVec(stanceAngle - Math.PI / 2, r).iadd(offset),
      polarToVec(stanceAngle + Math.PI / 2, r).iadd(offset),
    ];
  }

  getHandPositions(): [V2d, V2d] {
    if (this.human.cart) {
      const cart = this.human.cart;
      const [leftHandPosition, rightHandPosition] = cart.getHandPositions();
      const localLeft = this.human.worldToLocal(leftHandPosition);
      const localRight = this.human.worldToLocal(rightHandPosition);

      const [leftShoulder, rightShoulder] = this.getShoulderPositions();
      const leftFromShoulder = localLeft.sub(leftShoulder);
      const rightFromShoulder = localRight.sub(rightShoulder);

      return [
        leftShoulder.iadd(leftFromShoulder.ilimit(MAX_ARM_LENGTH)),
        rightShoulder.iadd(rightFromShoulder.ilimit(MAX_ARM_LENGTH)),
      ];
    } else {
      return this.getShoulderPositions();
    }
  }
}
