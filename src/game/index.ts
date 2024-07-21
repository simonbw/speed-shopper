import { TextureStyle } from "pixi.js";
import Game from "../core/Game";
import FPSMeter from "../core/util/FPSMeter";
import { V } from "../core/Vector";
import { Cart, isCart } from "./Cart";
import { GamePreloader } from "./GamePreloader";
import Wall from "./Wall";
import { CameraController } from "./CameraController";
import { Human } from "./Human";
import { PlayerController } from "./PlayerController";
import { Floor } from "./Floor";
import { Shelves } from "./Shelves";
import { isMerchandise, Merchandise } from "./Merchandise";

// Do this so we can access the game from the console
declare global {
  interface Window {
    DEBUG: { game?: Game };
  }
}

async function main() {
  // Make the pixel art crisp
  TextureStyle.defaultOptions.scaleMode = "linear";

  const game = new Game({ tickIterations: 100 });
  await game.init({ rendererOptions: { backgroundColor: 0x444454 } });
  // Make the game accessible from the console
  window.DEBUG = { game };

  const preloader = game.addEntity(GamePreloader);
  await preloader.waitTillLoaded();
  preloader.destroy();

  game.entities.addFilter(isCart);
  game.entities.addFilter(isMerchandise);

  if (process.env.NODE_ENV === "development") {
    const fpsMeter = new FPSMeter();
    fpsMeter.sprite.layerName = "debugHud";
    game.addEntity(fpsMeter);
  }

  const player = game.addEntity(
    new Human({ position: V(5, 5), angle: 0, walkSpeed: 5 })
  );
  game.addEntity(new PlayerController(player));
  game.addEntity(new CameraController(game.camera, player));

  game.addEntity(new Cart(V(5, 3)));
  game.addEntity(new Cart(V(6, 3)));
  game.addEntity(new Cart(V(7, 3)));
  game.addEntity(new Cart(V(8, 3)));

  const storeWidth = 40;
  const storeHeight = 35;
  game.addEntity(
    new Floor(V(0, 0), V(storeWidth, storeHeight), "tileFloor14", 0.005)
  );

  game.addEntities(
    new Wall([0, 0], [storeWidth, 0]),
    new Wall([storeWidth, 0], [storeWidth, storeHeight]),
    new Wall([storeWidth, storeHeight], [0, storeHeight]),
    new Wall([0, storeHeight], [0, 0])
  );

  game.addEntities(
    new Shelves(V(10, 10)),
    new Shelves(V(15, 10)),
    new Shelves(V(20, 10)),
    new Shelves(V(25, 10)),
    new Shelves(V(30, 10)),

    new Shelves(V(10, 25)),
    new Shelves(V(15, 25)),
    new Shelves(V(20, 25)),
    new Shelves(V(25, 25)),
    new Shelves(V(30, 25))
  );

  game.addEntities(
    new Merchandise(V(7, 10)),
    new Merchandise(V(7, 12)),
    new Merchandise(V(7, 14)),
    new Merchandise(V(7, 16)),
    new Merchandise(V(7, 18)),
    new Merchandise(V(7, 20)),
    new Merchandise(V(7, 22)),
    new Merchandise(V(7, 24)),
    new Merchandise(V(7, 26)),
    new Merchandise(V(7, 28)),
    new Merchandise(V(7, 30)),

    new Merchandise(V(31, 10))
  );
}

window.addEventListener("load", main);
