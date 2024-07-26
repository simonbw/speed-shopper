import { Body, Box, LockConstraint, RevoluteConstraint } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { polarToVec } from "../core/util/MathUtil";
import { V, V2d } from "../core/Vector";
import { Cart } from "./Cart";
import { SkidMark } from "./SkidMark";

// How far the swivel arm on the front casters are
const SWIVEL_RADIUS = 0.04;

// Linear and angular friction coefficients
const ROLLING_FRICTION = 0.5;
const SKIDDING_FRICTION = 0.9;
const ANGULAR_FRICTION = 0.00001;

// Point at which the wheel starts skidding
const MAX_TRACTION = 15;
const MAX_TRACTION_SKIDDING = 6.5;
const TRACTION_COEFFICIENT = 20;

export class CartWheel extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  skidding: boolean = false;
  cart: Cart;

  constructor(cart: Cart, positionOnCart: V2d, fixed: boolean) {
    super();

    this.cart = cart;

    this.sprite = loadGameSprite("cartWheel", "wheels");
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.setSize(0.2);

    const swivelAmount = SWIVEL_RADIUS;
    const position = fixed
      ? cart.localToWorld(positionOnCart)
      : cart.localToWorld(positionOnCart.add([0, swivelAmount]));

    this.body = new Body({
      type: Body.DYNAMIC,
      mass: 0.1,
      position,
    });

    const shape = new Box({ width: 0.03, height: 0.1 });
    shape.collisionResponse = false;
    this.body.addShape(shape);

    // Keep the wheel attached to the cart
    if (fixed) {
      const weldConstraint = new LockConstraint(cart.body, this.body, {
        localOffsetB: positionOnCart,
      });
      this.constraints = [weldConstraint];
    } else {
      const revoluteConstraint = new RevoluteConstraint(cart.body, this.body, {
        worldPivot: cart.localToWorld(positionOnCart),
      });
      this.constraints = [revoluteConstraint];
    }
  }

  onTick(dt: number) {
    const forward = polarToVec(this.body.angle + Math.PI / 2, 1);
    const normal = forward.rotate90cw();
    const velocity = V(this.body.velocity);
    const weight = this.cart.getWeight();

    const normalAmount = velocity.dot(normal);
    const tractionForce = normal
      .mul(-normalAmount)
      .imul(TRACTION_COEFFICIENT)
      .imul(weight);

    const maxTraction =
      (this.skidding ? MAX_TRACTION_SKIDDING : MAX_TRACTION) * weight;
    if (tractionForce.magnitude > maxTraction) {
      this.skidding = true;
      tractionForce.magnitude = maxTraction;
    } else {
      this.skidding = false;
    }
    this.body.applyForce(tractionForce);

    const forwardAmount = velocity.dot(forward);

    const rollingFriction = forward
      .imul(-forwardAmount)
      .mul(this.skidding ? SKIDDING_FRICTION : ROLLING_FRICTION);
    this.body.applyForce(rollingFriction);

    const angularFrictionAmount = this.body.angularVelocity * -ANGULAR_FRICTION;
    this.body.angularForce += angularFrictionAmount;
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;

    if (this.skidding) {
      this.game!.addEntity(new SkidMark(this.getPosition(), this.body.angle));
    }
  }
}
