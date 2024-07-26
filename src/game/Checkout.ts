import { Body, Box } from "p2";
import { Graphics } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity, { GameEventMap } from "../core/entity/Entity";
import { V2d } from "../core/Vector";
import { CollisionGroups } from "./config/CollisionGroups";
import { isMerchandise } from "./Merchandise";

export class Checkout extends BaseEntity implements Entity {
  constructor(position: V2d) {
    super();

    this.body = new Body({
      mass: 0,
      type: Body.STATIC,
      position: position.clone(),
    });
    const sensorShape = new Box({ width: 2, height: 2, sensor: true });
    sensorShape.collisionGroup = CollisionGroups.Checkout;
    sensorShape.collisionMask = CollisionGroups.CartedMerchandise;
    this.body.addShape(sensorShape);

    this.sprite = new Graphics()
      .rect(-1, -1, 2, 2)
      .fill({ color: 0x00ff00, alpha: 0.5 });
    this.sprite.layerName = "floorDecals";

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
