import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Camera2d } from "../core/graphics/Camera2d";
import { Cart } from "./Cart";

export class CameraController extends BaseEntity implements Entity {
  camera: Camera2d;
  cart: Cart;

  constructor(camera: Camera2d, cart: Cart) {
    super();

    this.camera = camera;
    this.cart = cart;
    this.camera.z = 100;
  }

  onLateRender() {
    this.camera.position.set(this.cart.getPosition());
  }

  onTick(dt: number) {
    if (this.game!.io.isKeyDown("KeyQ")) {
      this.camera.z *= 1.2 ** dt;
    }
    if (this.game!.io.isKeyDown("KeyE")) {
      this.camera.z *= 0.8 ** dt;
    }
  }
}
