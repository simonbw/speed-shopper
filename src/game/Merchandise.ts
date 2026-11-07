import { Sprite } from "pixi.js";
import orangeDef from "../../resources/entity-defs/orange.json";
import { CollisionGroups } from "../config/CollisionGroups";
import { BaseEntity } from "../core/entity/BaseEntity";
import { Entity, GameEventMap } from "../core/entity/Entity";
import { GameSprite } from "../core/entity/GameSprite";
import { on } from "../core/entity/handler";
import { EntityDef } from "../core/EntityDef";
import { Body } from "../core/physics/body/Body";
import { stepToward } from "../core/util/MathUtil";
import { V } from "../core/Vector";
import { Cart } from "./Cart";
import { HumanArm } from "./HumanArm";

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
    super(orangeDef as unknown as EntityDef);
    this.tags.push("merchandise");

    this.body.position.set(position);
    this.sprite.position.set(...position);
  }

  @on("tick")
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
      const friction = V(cart.body.getVelocityAtPoint(positionInCart))
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

  @on("render")
  onRender({ dt }: GameEventMap["render"]) {
    const stepSize = SPRITE_STEP_SIZE * dt;
    this.sprite.position.x = stepToward(
      this.sprite.position.x,
      this.body.position[0],
      stepSize,
    );
    this.sprite.position.y = stepToward(
      this.sprite.position.y,
      this.body.position[1],
      stepSize,
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
    this.body.velocity.set(velocity);
  }

  putInCart(cart: Cart) {
    this.state = "carted";
    this.cart = cart;
    this.body.collisionResponse = true;
    this.body.position.set(cart.body.position);
    this.body.velocity.set(cart.body.velocity);

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
