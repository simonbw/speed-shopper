import { Body, Circle } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import AimSpring from "../core/physics/AimSpring";
import { normalizeAngle, polarToVec } from "../core/util/MathUtil";
import { V, V2d } from "../core/Vector";
import { Cart } from "./Cart";
import { CartSpring } from "./CartSpring";
import { CollisionGroups } from "./config/CollisionGroups";
import { HumanSprite } from "./HumanSprite";
import { Stride } from "./Stride";
import { VelocityDisplay } from "./VelocityDisplay";
import { WalkingForces } from "./WalkingForces";
import { WalkSoundPlayer } from "./WalkSoundPlayer";
import { HumanArm, ARM_LENGTH } from "./HumanArm";

// Walk spring config
const PUSH_ACCELERATION = 30;
const PUSH_SPEED = 30;
const WALK_ACCELERATION = 25;
const WALK_SPEED = 7;
const FRICTION = 0;

const CART_SLIP_THRESHOLD = 0.1;

// Stride config
const STEPS_PER_METER = 0.5;

export class Human extends BaseEntity implements Entity {
  body: Body;
  tags = ["human"];

  walkSoundPlayer: WalkSoundPlayer;
  walkSpring: WalkingForces;
  aimSpring: AimSpring;

  humanSprite: HumanSprite;
  stride: Stride;
  leftArm: HumanArm;
  rightArm: HumanArm;

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
    shape.collisionGroup = CollisionGroups.Player;
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

    this.stride = this.addChild(new Stride(this, STEPS_PER_METER));
    this.walkSoundPlayer = this.addChild(new WalkSoundPlayer(this));
    this.walkSpring = this.addChild(new WalkingForces(this.body));
    this.aimSpring = new AimSpring(this.body);

    this.springs = [this.aimSpring];

    this.addChild(new VelocityDisplay(this.body));
    this.leftArm = this.addChild(
      new HumanArm(this, V(0, -(radius * 0.8)), "left")
    );
    this.rightArm = this.addChild(
      new HumanArm(this, V(0, radius * 0.8), "right")
    );
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

  public aimAt(position: [number, number], offset: number = 0) {
    const displacement = this.getPosition().isub(position).imul(-1);
    this.aimSpring.restAngle = normalizeAngle(displacement.angle + offset);
  }

  public aim(angle: number) {
    this.aimSpring.restAngle = normalizeAngle(angle);
  }

  /** Called every update cycle */
  onTick(dt: number) {
    // Update walk spring
    if (this.cart) {
      this.walkSpring.maxAcceleration = PUSH_ACCELERATION;
      this.walkSpring.maxSpeed = PUSH_SPEED;
    } else {
      this.walkSpring.maxAcceleration = WALK_ACCELERATION;
      this.walkSpring.maxSpeed = WALK_SPEED;
    }

    // Apply friction
    const friction = V(this.body.velocity).imul(-1).imul(FRICTION);
    this.body.applyForce(friction);

    // See if cart is lost
    if (this.cart) {
      const [leftHandTarget, rightHandTarget] =
        this.cart.getWorldHandPositions();
      const leftHandWorld = this.localToWorld(
        this.leftArm.getHandLocalPosition()
      );
      const rightHandWorld = this.localToWorld(
        this.rightArm.getHandLocalPosition()
      );

      const leftDistance = leftHandWorld.isub(leftHandTarget).magnitude;
      const rightDistance = rightHandWorld.isub(rightHandTarget).magnitude;

      if (
        leftDistance > CART_SLIP_THRESHOLD &&
        rightDistance > CART_SLIP_THRESHOLD
      ) {
        this.releaseCart();
        console.log("Couldn't hang on");
      }
    }
  }
}
