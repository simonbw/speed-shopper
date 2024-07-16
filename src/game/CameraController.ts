import { Body } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Camera2d } from "../core/graphics/Camera2d";
import { V, V2d } from "../core/Vector";
import { Human } from "./Human";

type Target = { getPosition: () => V2d; body: Body };

export class CameraController extends BaseEntity implements Entity {
  camera: Camera2d;
  player: Human;

  constructor(camera: Camera2d, player: Human) {
    super();

    this.camera = camera;
    this.player = player;
    this.camera.z = 100;
    this.camera.center(this.player.getPosition());
  }

  onLateRender() {
    const target = this.player.cart ? this.player.cart : this.player;
    const velocity = V(target.body.velocity);
    this.camera.smoothCenter(target.getPosition(), velocity, 0.3, 0.15);
    this.camera.smoothZoom(130 - 2 * velocity.magnitude);
  }
}
