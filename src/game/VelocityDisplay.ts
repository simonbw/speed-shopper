import { Body } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V } from "../core/Vector";
import { Text } from "pixi.js";
import { GameSprite } from "../core/entity/GameSprite";

export class VelocityDisplay extends BaseEntity implements Entity {
  sprite: GameSprite & Text;

  constructor(private targetBody: Body) {
    super();

    this.sprite = new Text({
      style: {
        fontSize: 12,
        fill: "white",
        align: "left",
        dropShadow: {
          color: 0x000000,
          alpha: 0.5,
          angle: 0,
          distance: 0,
          blur: 2,
        },
      },
    });
    this.sprite.layerName = "hud";
  }

  onRender() {
    this.sprite.position.set(
      ...this.game!.camera.toScreen(V(this.targetBody.position))
    );

    const speed = V(this.targetBody.velocity).magnitude;
    this.sprite.text = `Speed: ${speed.toFixed(2)}`;
  }
}
