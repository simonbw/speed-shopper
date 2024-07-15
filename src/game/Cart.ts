import { Body, Convex } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { V } from "../core/Vector";
import { CartWheel } from "./CartWheel";

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
