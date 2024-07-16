import { Body } from "p2";
import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Camera2d } from "../core/graphics/Camera2d";
import { V, V2d } from "../core/Vector";

type Target = { getPosition: () => V2d; body: Body };

export class CameraController extends BaseEntity implements Entity {
  camera: Camera2d;
  target: Target;

  constructor(camera: Camera2d, target: Target) {
    super();

    this.camera = camera;
    this.target = target;
    this.camera.z = 100;
    this.camera.center(this.target.getPosition());
  }

  onLateRender() {
    const velocity = V(this.target.body.velocity);
    this.camera.smoothCenter(this.target.getPosition(), velocity, 0.2);
    this.camera.smoothZoom(130 - 2 * velocity.magnitude);
  }
}
