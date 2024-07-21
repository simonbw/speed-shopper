import p2, { Body, vec2 } from "p2";
import { Sprite } from "pixi.js";
import { V } from "../core/Vector";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { Cart } from "./Cart";
import { HumanArm } from "./HumanArm";
import { CollisionGroups } from "./config/CollisionGroups";

const DROPPED_FRICTION = 2.0;
const CARTED_FRICTION = 10.0;

type MerchandiseState = "pickedUp" | "dropped" | "carted";

export class Merchandise extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  state: MerchandiseState = "dropped";
  cart: Cart | undefined;

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

    const shape = new p2.Circle({
      radius: size / 2,
    });
    shape.collisionGroup = CollisionGroups.FreeMerchandise;
    shape.collisionMask = CollisionGroups.All;
    this.body.addShape(shape);
  }

  onTick() {
    if (this.state === "dropped") {
      const friction = V(this.body.velocity)
        .imul(-DROPPED_FRICTION)
        .imul(this.body.mass);
      this.body.applyForce(friction);
    } else if (this.state === "carted") {
      const cart = this.cart!;
      // Apply cart friction
      const positionInCart = this.getPosition().isub(cart.body.position);
      const friction = V(cart.body.getVelocityAtPoint(V(), positionInCart))
        .isub(this.body.velocity)
        .imul(CARTED_FRICTION)
        .imul(this.body.mass);

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

    for (const shape of this.body.shapes) {
      shape.collisionGroup = CollisionGroups.CartedMerchandise;
      shape.collisionMask =
        CollisionGroups.CartInterior | CollisionGroups.CartedMerchandise;
    }
  }

  onBeginContact({ other }: { other?: Entity }) {
    if (this.state === "carted" && other?.tags.includes("cart")) {
      console.log("Merchandise hit cart!");
    }
  }
}

export function isMerchandise(entity: Entity): entity is Merchandise {
  return entity.tags.includes("merchandise");
}
