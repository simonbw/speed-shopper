import { Body, Box, Convex, LockConstraint, RevoluteConstraint } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { lerp, polarToVec } from "../core/util/MathUtil";
import { V, V2d } from "../core/Vector";

export class Cart extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  wheels: CartWheel[];

  constructor(position: [number, number]) {
    super();

    this.sprite = loadGameSprite("cart", "cart");
    this.sprite.anchor.set(0.5, 0.5);
    this.sprite.setSize(1, 1);

    this.body = new Body({
      type: Body.DYNAMIC,
      mass: 1,
      position,
    });

    const fw = 0.26;
    const bw = 0.32;

    const shape = new Convex({
      vertices: [
        [-bw, 0.5],
        [-fw, -0.5],
        [fw, -0.5],
        [bw, 0.5],
      ],
    });
    this.body.addShape(shape);

    const frontLeft = new CartWheel(this, V(-(fw - 0.15), -0.28), false);
    const frontRight = new CartWheel(this, V(fw - 0.15, -0.28), false);
    const backLeft = new CartWheel(this, V(-(bw - 0.03), 0.38), true);
    const backRight = new CartWheel(this, V(bw - 0.03, 0.38), true);

    this.wheels = [frontLeft, frontRight, backLeft, backRight];
    this.addChildren(frontLeft, frontRight, backLeft, backRight);
  }

  onTick() {
    const [rotational, axial] = this.game!.io.getMovementVector();

    const pushStrength = 5.0;
    const leftHandForce = V(0, 1)
      .imul(1.0 * axial - 0.5 * rotational)
      .imul(pushStrength);
    const rightHandForce = V(0, 1)
      .imul(1.0 * axial + 0.5 * rotational)
      .imul(pushStrength);

    const handWidth = 1.5;
    const leftHandPosition = V(-handWidth, -0.5);
    const rightHandPosition = V(handWidth, -0.5);
    // Apply left hand force
    this.body.applyForceLocal(leftHandForce, leftHandPosition);
    this.body.applyForceLocal(rightHandForce, rightHandPosition);

    if (this.game?.io.isKeyDown("ShiftLeft")) {
      for (const wheel of this.wheels) {
        wheel.skidding = true;
      }
    }
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }
}

class CartWheel extends BaseEntity implements Entity {
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
      revoluteConstraint.setStiffness(100_000_000);
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

class SkidMark extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;

  constructor(position: V2d, angle: number) {
    super();

    const sprite = loadGameSprite("cartWheel", "floorDecals");
    sprite.anchor.set(0.5, 0.5);
    sprite.setSize(0.2);
    sprite.position.set(...position);
    sprite.rotation = angle;
    this.sprite = sprite;
  }

  onAdd() {
    this.wait(3, (_, t) => (this.sprite.alpha = lerp(0.1, 0, t))).then(() =>
      this.destroy()
    );
  }
}
