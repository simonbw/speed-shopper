import { Body, Circle } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { V, V2d } from "../core/Vector";
import { CollisionGroups } from "./config/CollisionGroups";
import { HumanSprite } from "./HumanSprite";
import { WalkSoundPlayer } from "./WalkSoundPlayer";
import { WalkSpring } from "./WalkSpring";
import { Cart } from "./Cart";
import { CartSpring } from "./CartSpring";

const WALKING_STEPS_PER_METER = 0.4;
const RUNNING_STEPS_PER_METER = 0.4;

// Copied from ld-55
// TODO: Comment and review this file

export class Human extends BaseEntity implements Entity {
  body: Body;
  tags = ["human"];

  walkSoundPlayer: WalkSoundPlayer;
  walkSpring: WalkSpring;

  running: boolean = false;
  percentThroughStride: number = 0;
  lastDistanceMoved: number = 0;
  humanSprite: HumanSprite;

  cart: Cart | undefined;
  cartSpring: CartSpring | undefined;

  constructor(
    private options: {
      position: V2d;
      angle: number;
      walkSpeed: number;
      runSpeed: number;
    }
  ) {
    super();

    this.body = new Body({
      mass: 0.5,
      angle: options.angle,
      position: options.position.clone(),
      damping: 0,
      angularDamping: 0,
    });

    const radius = 0.3; // meters

    const shape = new Circle({ radius: radius * 0.6 });
    shape.collisionMask = CollisionGroups.All;
    this.body.addShape(shape);

    this.humanSprite = this.addChild(
      new HumanSprite(
        this,
        {
          head: "demitriHead",
          torso: "demitriTorso",
          leftHand: "demitriLeftHand",
          rightHand: "demitriRightHand",
          leftArm: "demitriLeftArm",
          rightArm: "demitriRightArm",
        },
        radius
      )
    );

    this.walkSoundPlayer = this.addChild(new WalkSoundPlayer(this));
    this.walkSpring = this.addChild(new WalkSpring(this.body));
  }

  grabCart(cart: Cart) {
    if (!this.cart) {
      this.cart = cart;
      this.cartSpring = this.addChild(new CartSpring(this, cart));
      // this.walkSpring.enabled = false;
    }
  }

  releaseCart() {
    this.cart = undefined;
    this.cartSpring?.destroy();
    // this.walkSpring.enabled = true;
  }

  /** Called every update cycle */
  onTick(dt: number) {
    // this.body.applyDamping(200 * dt);
    this.walkSpring.speed = this.running
      ? this.options.runSpeed
      : this.options.walkSpeed;
    this.walkSpring.acceleration = 20;

    const distanceMoved = V(this.body.velocity).magnitude * dt;

    const stopThreshold = 0.001;
    if (distanceMoved > stopThreshold) {
      const lastPercentThroughStep = this.percentThroughStride;
      const stepsPerMeter = this.running
        ? RUNNING_STEPS_PER_METER
        : WALKING_STEPS_PER_METER;
      this.percentThroughStride += distanceMoved * stepsPerMeter;

      // If we've taken a new step
      if (
        (this.percentThroughStride > 1 && lastPercentThroughStep < 1) ||
        (this.percentThroughStride > 2 && lastPercentThroughStep < 2)
      ) {
        this.walkSoundPlayer.playFootstep();
      }

      // Wrap around the stride
      this.percentThroughStride %= 2;

      this.body.angle = V(this.body.velocity).angle;
    } else {
      // not moving
      this.percentThroughStride = 0;

      // If we've just stopped moving
      if (this.lastDistanceMoved > stopThreshold) {
        this.walkSoundPlayer.playFootstep();
      }
    }
  }

  public walk(angle: number, running: boolean): void {
    this.walkSpring.walkTowards(angle, running ? 1 : 0.5);
    this.percentThroughStride;
  }
}
