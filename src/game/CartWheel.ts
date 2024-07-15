import { Body, Box, LockConstraint, RevoluteConstraint } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { polarToVec } from "../core/util/MathUtil";
import { V, V2d } from "../core/Vector";
import { Cart } from "./Cart";
import { SkidMark } from "./SkidMark";

export class CartWheel extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  skidding: boolean = false;

  constructor(cart: Cart, positionOnCart: V2d, fixed: boolean) {
    super();

    this.sprite = loadGameSprite("cartWheel", "wheels");
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.setSize(0.2);

    const swivelAmount = 0.03;
    const position = fixed
      ? cart.localToWorld(positionOnCart)
      : cart.localToWorld(positionOnCart.add([0, swivelAmount]));

    this.body = new Body({
      type: Body.DYNAMIC,
      mass: 0.01,
      position,
    });

    const shape = new Box({ width: 0.03, height: 0.1 });
    shape.collisionGroup = 0;
    shape.collisionMask = 0;
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
      revoluteConstraint.setStiffness(100000000);
      revoluteConstraint.setRelaxation(1);
      this.constraints = [revoluteConstraint];
    }
  }

  onTick(dt: number) {
    const forward = polarToVec(this.body.angle + Math.PI / 2, 1);
    const normal = forward.rotate90cw();
    const velocity = V(this.body.velocity);

    const normalAmount = velocity.dot(normal);
    const tractionForce = normal.mul(-normalAmount * 20);

    const maxTraction = this.skidding ? 10 : 20;
    if (tractionForce.magnitude > maxTraction) {
      this.skidding = true;
      tractionForce.magnitude = maxTraction;
      this.game!.addEntity(new SkidMark(this.getPosition(), this.body.angle));
    } else {
      this.skidding = false;
    }
    this.body.applyForce(tractionForce);

    const dragForce = velocity.mul(this.skidding ? -1 : -0.1);
    this.body.applyForce(dragForce);

    const angularFrictionAmount = this.body.angularVelocity * -0.00001;
    this.body.angularForce += angularFrictionAmount;
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }
}
