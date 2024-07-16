import { Body, Circle } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import AimSpring from "../core/physics/AimSpring";
import { V, V2d } from "../core/Vector";
import { Cart } from "./Cart";
import { CartSpring } from "./CartSpring";
import { CollisionGroups } from "./config/CollisionGroups";
import { HumanSprite } from "./HumanSprite";
import { WalkSoundPlayer } from "./WalkSoundPlayer";
import { WalkSpring } from "./WalkSpring";
import { normalizeAngle } from "../core/util/MathUtil";

const STEPS_PER_METER = 0.4;

export class Human extends BaseEntity implements Entity {
  body: Body;
  tags = ["human"];

  walkSoundPlayer: WalkSoundPlayer;
  walkSpring: WalkSpring;
  aimSpring: AimSpring;

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
    }
  ) {
    super();

    this.body = new Body({
      mass: 1,
      angle: options.angle,
      position: options.position.clone(),
      damping: 10,
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
    this.aimSpring = new AimSpring(this.body);

    this.springs = [this.aimSpring];
  }

  grabCart(cart: Cart) {
    if (!this.cart) {
      this.cart = cart;
      // this.cartSpring = this.addChild(new CartSpring(this, cart));
      // this.walkSpring.enabled = false;
    }
  }

  releaseCart() {
    this.cart = undefined;
    // this.cartSpring?.destroy();
    // this.walkSpring.enabled = true;
  }

  public aimAt(position: [number, number]) {
    const offset = this.getPosition().isub(position).imul(-1);
    this.aimSpring.restAngle = normalizeAngle(offset.angle);
  }

  public aim(angle: number) {
    this.aimSpring.restAngle = normalizeAngle(angle);
  }

  /** Called every update cycle */
  onTick(dt: number) {
    const distanceMoved = V(this.body.velocity).magnitude * dt;

    if (this.cart) {
      this.walkSpring.acceleration = 8;
      this.walkSpring.speed = 30;
    } else {
      this.walkSpring.acceleration = 6;
      this.walkSpring.speed = 9;
    }

    const stopThreshold = 0.001;
    if (distanceMoved > stopThreshold) {
      const lastPercentThroughStep = this.percentThroughStride;
      const stepsPerMeter = STEPS_PER_METER;
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
}
