import { BaseEntity } from "../core/entity/BaseEntity";
import { Entity, GameEventMap } from "../core/entity/Entity";
import { on } from "../core/entity/handler";
import { Camera2d } from "../core/graphics/Camera2d";
import { PositionalSoundListener } from "../core/sound/PositionalSoundListener";
import { V } from "../core/Vector";
import { Human } from "./Human";

// The camera is a spring toward the target, tuned to lag behind and swing a
// little. The engine's `smoothCenter` is a different (critically damped)
// follow, so this keeps the old one.
const CAMERA_STIFFNESS = 0.3;
const CAMERA_DAMPING = 0.15;

export class CameraController extends BaseEntity implements Entity {
  camera: Camera2d;
  player: Human;
  soundListener: PositionalSoundListener;

  constructor(camera: Camera2d, player: Human) {
    super();

    this.camera = camera;
    this.player = player;
    this.camera.z = 100;
    this.camera.center(this.player.getPosition());

    this.soundListener = this.addChild(new PositionalSoundListener());
  }

  @on("tick")
  onTick({ dt }: GameEventMap["tick"]) {
    const target = this.player.cart ? this.player.cart : this.player;
    const [x, y] = target.getPosition();
    const [vx, vy] = target.body.velocity;
    const camera = this.camera;
    camera.vx +=
      (CAMERA_STIFFNESS * (x - camera.x) - CAMERA_DAMPING * (camera.vx - vx)) *
      dt;
    camera.vy +=
      (CAMERA_STIFFNESS * (y - camera.y) - CAMERA_DAMPING * (camera.vy - vy)) *
      dt;
    this.camera.smoothZoom(130 - 2 * V(target.body.velocity).magnitude);
  }

  @on("lateRender")
  onLateRender() {
    this.soundListener.setPosition(V(this.camera.position));
  }
}
