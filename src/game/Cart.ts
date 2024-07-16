import { Body, Convex } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { V } from "../core/Vector";
import { CartWheel } from "./CartWheel";

const PUSH_STRENGTH = 8.0;
const PUSH_TORQUE = 0.15;

export class Cart extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  wheels: CartWheel[];

  constructor(position: [number, number]) {
    super();

    this.tags.push("cart");

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
    const backLeft = new CartWheel(this, V(-(bw - 0.08), 0.3), true);
    const backRight = new CartWheel(this, V(bw - 0.08, 0.3), true);

    this.wheels = [frontLeft, frontRight, backLeft, backRight];
    this.addChildren(frontLeft, frontRight, backLeft, backRight);
  }

  public getLocalHandPositions() {
    const handWidth = 0.3;
    const leftHandPosition = V(-handWidth, 0.5);
    const rightHandPosition = V(handWidth, 0.5);
    return [leftHandPosition, rightHandPosition];
  }

  public getHandPositions() {
    const [leftLocal, rightLocal] = this.getLocalHandPositions();
    return [this.localToWorld(leftLocal), this.localToWorld(rightLocal)];
  }

  public push(rotational: number, axial: number) {
    const leftHandForce = V(0, 1)
      .imul(axial - rotational)
      .imul(PUSH_STRENGTH);
    const rightHandForce = V(0, 1)
      .imul(axial + rotational)
      .imul(PUSH_STRENGTH);

    const [leftHandPosition, rightHandPosition] = this.getLocalHandPositions();
    // Apply left hand force
    this.body.applyForceLocal(leftHandForce, leftHandPosition);
    this.body.applyForceLocal(rightHandForce, rightHandPosition);

    this.body.angularForce += PUSH_TORQUE * rotational;
  }

  public skid() {
    for (const wheel of this.wheels) {
      wheel.skidding = true;
    }
  }

  onRender() {
    this.sprite.position.set(...this.body.position);
    this.sprite.rotation = this.body.angle;
  }
}
