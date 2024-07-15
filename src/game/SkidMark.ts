import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { lerp, smoothStep } from "../core/util/MathUtil";
import { V2d } from "../core/Vector";

export class SkidMark extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;

  constructor(position: V2d, angle: number) {
    super();

    const sprite = loadGameSprite("cartWheel", "floorDecals");
    sprite.anchor.set(0.5, 0.5);
    sprite.setSize(0.2);
    sprite.position.set(...position);
    sprite.rotation = angle;
    this.sprite = sprite;
  }

  onAdd() {
    this.waitRender(
      10,
      (_, t) => (this.sprite.alpha = lerp(0.1, 0, smoothStep(t)))
    ).then(() => this.destroy());
  }
}
