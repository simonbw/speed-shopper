import { CollisionGroups } from "../config/CollisionGroups";
import { BaseEntity } from "../core/entity/BaseEntity";
import { Entity, GameEventMap } from "../core/entity/Entity";
import { createGraphics } from "../core/entity/GameSprite";
import { createRigid2D } from "../core/physics/body/bodyFactories";
import { Box } from "../core/physics/shapes/Box";
import { V2d } from "../core/Vector";
import { isMerchandise } from "./Merchandise";

export class Checkout extends BaseEntity implements Entity {
  constructor(position: V2d) {
    super();

    this.body = createRigid2D({
      motion: "static",
      position: position.clone(),
    });
    const sensorShape = new Box({
      width: 2,
      height: 2,
      sensor: true,
      collisionGroup: CollisionGroups.Checkout,
      collisionMask: CollisionGroups.CartedMerchandise,
    });
    this.body.addShape(sensorShape);

    this.sprite = createGraphics("floorDecals")
      .rect(-1, -1, 2, 2)
      .fill({ color: 0x00ff00, alpha: 0.5 });

    this.sprite.position.set(...position);
  }

  onBeginContact({ other }: GameEventMap["beginContact"]) {
    if (isMerchandise(other)) {
      console.log("Merchandise purchased!");
      this.game?.dispatch("merchandisePurchased", { merchandise: other });
      other.destroy();
    }
  }
}
