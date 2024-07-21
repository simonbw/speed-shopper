import { Body, Convex, Line, vec2 } from "p2";
import { Sprite } from "pixi.js";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { GameSprite, loadGameSprite } from "../core/entity/GameSprite";
import { V } from "../core/Vector";
import { CartWheel } from "./CartWheel";
import { SoundName } from "../../resources/resources";
import { PositionalSound } from "../core/sound/PositionalSound";
import { choose, rUniform } from "../core/util/Random";
import { Merchandise } from "./Merchandise";
import { lineFromPoints } from "../core/util/PhysicsUtils";
import { CollisionGroups } from "./config/CollisionGroups";

const PUSH_STRENGTH = 7.0;
const PUSH_TORQUE = 0.15;

const IMPACT_SOUNDS: SoundName[] = [
  "cartImpact1",
  "cartImpact2",
  "cartImpact3",
];

export class Cart extends BaseEntity implements Entity {
  sprite: Sprite & GameSprite;
  body: Body;

  wheels: CartWheel[];

  merchandises: Merchandise[] = [];

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
    const h = 0.5;

    const bl = V([-bw, 0.5]);
    const fl = V([-fw, -0.5]);
    const fr = V([fw, -0.5]);
    const br = V([bw, 0.5]);

    const shape = new Convex({
      vertices: [bl.clone(), fl.clone(), fr.clone(), br.clone()],
    });
    shape.collisionGroup = CollisionGroups.CartExterior;
    shape.collisionMask = CollisionGroups.All;
    this.body.addShape(shape);

    // The inverse of mainShape for keeping merchandise in the cart
    const innerShapes = [
      lineFromPoints(fl, bl),
      lineFromPoints(fr, br),
      lineFromPoints(fl, fr),
      lineFromPoints(bl, br),
    ];

    for (const innerShape of innerShapes) {
      innerShape.collisionGroup = CollisionGroups.CartInterior;
      innerShape.collisionMask = CollisionGroups.CartedMerchandise;
      this.body.addShape(innerShape, innerShape.position, innerShape.angle);
    }

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

  public getWorldHandPositions() {
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

  onImpact() {
    const sound = choose(...IMPACT_SOUNDS);
    this.game?.addEntity(
      new PositionalSound(sound, this.getPosition(), {
        gain: 0.5,
        speed: rUniform(0.9, 1.1),
      })
    );
  }

  addMerchandise(merchandise: Merchandise) {
    this.merchandises.push(merchandise);
  }
}

export function isCart(entity: Entity): entity is Cart {
  return entity instanceof Cart;
}
