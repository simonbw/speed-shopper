import { BlurFilter, Graphics } from "pixi.js";
import { CollisionGroups } from "../config/CollisionGroups";
import { BaseEntity } from "../core/entity/BaseEntity";
import { Entity } from "../core/entity/Entity";
import { createGraphics, GameSprite } from "../core/entity/GameSprite";
import { on } from "../core/entity/handler";
import { Body } from "../core/physics/body/Body";
import { createRigid2D } from "../core/physics/body/bodyFactories";
import { Box } from "../core/physics/shapes/Box";
import { V, V2d } from "../core/Vector";

const FRICTION = 100;
const ANGULAR_FRICTION = 1000;
const MASS = 100;

export class Shelves extends BaseEntity implements Entity {
  body: Body;
  sprite: Graphics & GameSprite;

  constructor(position: V2d) {
    super();

    this.body = createRigid2D({
      motion: "dynamic",
      position,
      mass: MASS,
    });

    const width = 2;
    const height = 10;

    const shape = new Box({
      width,
      height,
      collisionGroup: CollisionGroups.Environment,
      collisionMask: CollisionGroups.All,
    });
    this.body.addShape(shape);

    this.sprite = createGraphics("walls")
      .rect(-width / 2, -height / 2, width, height)
      .fill(0xccbbaa);
    this.sprite.position.set(...position);

    const shadowWidth = width + 0.2;
    const shadowHeight = height + 0.2;
    const shadowSprite = createGraphics("shadows")
      .rect(-shadowWidth / 2, -shadowHeight / 2, shadowWidth, shadowHeight)
      .fill({ color: 0x000000, alpha: 0.15 });
    shadowSprite.filters = [new BlurFilter({})];
    shadowSprite.position.set(...position);
    this.sprites = [shadowSprite];
  }

  @on("tick")
  onTick() {
    const friction = V(this.body.velocity)
      .imul(-1)
      .imul(FRICTION * this.body.mass);
    this.body.applyForce(friction);

    const angularFriction =
      -this.body.angularVelocity * ANGULAR_FRICTION * this.body.mass;
    this.body.angularForce += angularFriction;
  }

  @on("render")
  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }
}
