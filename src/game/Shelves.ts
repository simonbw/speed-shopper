import { Body, Box, LockConstraint } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V, V2d } from "../core/Vector";
import { BlurFilter, Graphics } from "pixi.js";
import { GameSprite } from "../core/entity/GameSprite";

const FRICTION = 100;
const ANGULAR_FRICTION = 1000;
const MASS = 100;

export class Shelves extends BaseEntity implements Entity {
  body: Body;
  sprite: Graphics & GameSprite;

  constructor(position: V2d) {
    super();

    this.body = new Body({
      type: Body.DYNAMIC,
      position,
      mass: MASS,
    });

    const width = 2;
    const height = 10;

    const shape = new Box({ width, height });
    this.body.addShape(shape);

    this.sprite = new Graphics({ position })
      .rect(-width / 2, -height / 2, width, height)
      .fill(0xccbbaa);
    this.sprite.layerName = "walls";

    const shadowWidth = width + 0.2;
    const shadowHeight = height + 0.2;
    const shadowSprite = new Graphics({ position })
      .rect(-shadowWidth / 2, -shadowHeight / 2, shadowWidth, shadowHeight)
      .fill({ color: 0x000000, alpha: 0.15 });
    shadowSprite.filters = [new BlurFilter({})];
    this.sprites = [shadowSprite];
    this.sprites[0].layerName = "shadows";
  }

  onTick() {
    const friction = V(this.body.velocity)
      .imul(-1)
      .imul(FRICTION * this.body.mass);
    this.body.applyForce(friction);

    const angularFriction =
      -this.body.angularVelocity * ANGULAR_FRICTION * this.body.mass;
    this.body.angularForce += angularFriction;
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }
}
