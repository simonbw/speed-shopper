import { TextureStyle } from "pixi.js";
import Game from "../core/Game";
import FPSMeter from "../core/util/FPSMeter";
import { V } from "../core/Vector";
import { Cart } from "./Cart";
import { GamePreloader } from "./GamePreloader";
import Wall from "./Wall";
import { CameraController } from "./CameraController";

// Do this so we can access the game from the console
declare global {
  interface Window {
    DEBUG: { game?: Game };
  }
}

async function main() {
  // Make the pixel art crisp
  TextureStyle.defaultOptions.scaleMode = "nearest";

  const game = new Game({ tickIterations: 10 });
  await game.init({ rendererOptions: { backgroundColor: 0x444454 } });
  // Make the game accessible from the console
  window.DEBUG = { game };

  const preloader = game.addEntity(GamePreloader);
  await preloader.waitTillLoaded();
  preloader.destroy();

  if (process.env.NODE_ENV === "development") {
    const fpsMeter = new FPSMeter();
    fpsMeter.sprite.layerName = "debugHud";
    game.addEntity(fpsMeter);
  }

  const cart = game.addEntity(new Cart(V(5, 5)));
  game.addEntity(new CameraController(game.camera, cart));

  game.addEntities(
    new Wall([0, 0], [10, 0]),
    new Wall([10, 0], [10, 10]),
    new Wall([10, 10], [0, 10]),
    new Wall([0, 10], [0, 0])
  );
}

window.addEventListener("load", main);
