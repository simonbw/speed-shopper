import p2, { Body, vec2 } from "p2";
import { Sprite } from "pixi.js";
import { V } from "../core/Vector";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { Cart } from "./Cart";
import { HumanArm } from "./HumanArm";
import { CollisionGroups } from "./config/CollisionGroups";
import { RESOURCES } from "../../resources/resources";
import { stepToward } from "../core/util/MathUtil";

const DROPPED_FRICTION = 2.0;
const DROPPED_ANGULAR_FRICTION = 0.2;
const CARTED_FRICTION = 10.0;
const CARTED_ANGULAR_FRICTION = 0.2;
const SPRITE_STEP_SIZE = 100; // m / s

type MerchandiseState = "pickedUp" | "dropped" | "carted";

export type MerchandiseType = "orange";

export class Merchandise extends BaseEntity implements Entity {
  sprite!: Sprite & GameSprite;
  body!: Body;

  state: MerchandiseState = "dropped";
  cart: Cart | undefined;

  merchandiseType: MerchandiseType = "orange";

  constructor(position: [number, number]) {
    super(RESOURCES.entityDefs.orange);
    this.tags.push("merchandise");

    this.body.position = V(position);
    this.sprite.position.set(...position);
  }

  onTick() {
    if (this.state === "dropped") {
      const friction = V(this.body.velocity)
        .imul(-DROPPED_FRICTION)
        .imul(this.body.mass);
      this.body.applyForce(friction);
      this.body.angularForce +=
        -this.body.angularVelocity *
        this.body.inertia *
        DROPPED_ANGULAR_FRICTION;
    } else if (this.state === "carted") {
      const cart = this.cart!;
      // Apply cart friction
      const positionInCart = this.getPosition().isub(cart.body.position);
      const friction = V(cart.body.getVelocityAtPoint(V(), positionInCart))
        .isub(this.body.velocity)
        .imul(CARTED_FRICTION)
        .imul(this.body.mass);

      this.body.applyForce(friction);
      this.body.angularForce +=
        -this.body.angularVelocity *
        this.body.inertia *
        CARTED_ANGULAR_FRICTION;

      // equal and opposite force on cart
      cart.body.applyForce(friction.imul(-1), positionInCart);
    }
  }

  onRender(dt: number) {
    const stepSize = SPRITE_STEP_SIZE * dt;
    this.sprite.position.x = stepToward(
      this.sprite.position.x,
      this.body.position[0],
      stepSize
    );
    this.sprite.position.y = stepToward(
      this.sprite.position.y,
      this.body.position[1],
      stepSize
    );
    this.sprite.rotation = this.body.angle;
  }

  pickup(arm: HumanArm) {
    console.log("Picked up merchandise");
    this.body.collisionResponse = false;
    this.state = "pickedUp";
  }

  drop(velocity: [number, number]) {
    this.body.collisionResponse = true;
    this.state = "dropped";
    vec2.copy(this.body.velocity, velocity);
  }

  putInCart(cart: Cart) {
    this.state = "carted";
    this.cart = cart;
    this.body.collisionResponse = true;
    this.body.position = V(cart.body.position);
    this.body.velocity = V(cart.body.velocity);

    for (const shape of this.body.shapes) {
      shape.collisionGroup = CollisionGroups.CartedMerchandise;
      shape.collisionMask =
        CollisionGroups.CartInterior |
        CollisionGroups.CartedMerchandise |
        CollisionGroups.Checkout;
    }
  }

  onBeginContact({ other }: { other?: Entity }) {
    if (this.state === "carted" && other?.tags.includes("cart")) {
      console.log("Merchandise hit cart!");
    }
  }
}

export function isMerchandise(entity?: Entity): entity is Merchandise {
  return entity !== undefined && entity.tags.includes("merchandise");
}
