import BaseEntity from "../core/entity/BaseEntity";
import Entity from "../core/entity/Entity";
import { Camera2d } from "../core/graphics/Camera2d";
import { V } from "../core/Vector";
import { Cart } from "./Cart";

export class CameraController extends BaseEntity implements Entity {
  camera: Camera2d;
  cart: Cart;

  constructor(camera: Camera2d, cart: Cart) {
    super();

    this.camera = camera;
    this.cart = cart;
    this.camera.z = 100;
    this.camera.center(this.cart.getPosition());
  }

  onLateRender() {
    const velocity = V(this.cart.body.velocity);
    this.camera.smoothCenter(this.cart.getPosition(), velocity, 0.2);
    this.camera.smoothZoom(130 - 2 * velocity.magnitude);
  }
}
