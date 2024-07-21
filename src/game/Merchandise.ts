import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { Body } from "p2";
import { V } from "../core/Vector";
import p2 from "p2";
import { HumanArm } from "./HumanArm";

const FRICTION = 0.3;

export class Merchandise extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  state: "pickedUp" | "dropped" = "dropped";

  constructor(position: [number, number]) {
    super();
    this.tags.push("merchandise");

    const size = 0.12;

    this.sprite = loadGameSprite("orange", "merchandise");
    this.sprite.anchor.set(0.5);
    this.sprite.setSize(size);

    this.body = new Body({
      type: Body.DYNAMIC,
      position: V(position),
      mass: 0.1,
    });

    this.body.addShape(
      new p2.Circle({
        radius: size / 2,
      })
    );
  }

  onTick() {
    if (this.state === "dropped") {
      const friction = V(this.body.velocity).imul(-FRICTION);
      this.body.applyForce(friction);
    }
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }

  pickup(arm: HumanArm) {
    console.log("Picked up merchandise");
    this.body.collisionResponse = false;
    this.state = "pickedUp";
  }

  drop() {
    this.body.collisionResponse = true;
    this.state = "dropped";
  }
}

export function isMerchandise(entity: Entity): entity is Merchandise {
  return entity.tags.includes("merchandise");
}
