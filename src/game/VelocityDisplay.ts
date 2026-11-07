import { Text } from "pixi.js";
import { BaseEntity } from "../core/entity/BaseEntity";
import { Entity } from "../core/entity/Entity";
import { GameSprite } from "../core/entity/GameSprite";
import { on } from "../core/entity/handler";
import { Body } from "../core/physics/body/Body";
import { V } from "../core/Vector";

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

  @on("render")
  onRender() {
    this.sprite.position.set(
      ...this.game!.camera.toScreen(V(this.targetBody.position)),
    );

    const speed = V(this.targetBody.velocity).magnitude;
    this.sprite.text = `Speed: ${speed.toFixed(2)}`;
  }
}
